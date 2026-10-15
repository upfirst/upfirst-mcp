// Checks that the setup files agree with each other and that Upfirst accepts the client documents.
// No dependencies: run it with `node scripts/validate.mjs`.

import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SERVER_URL = "https://mcp.upfirst.ai";
const SERVER_NAME = "upfirst";
const PAGES_BASE_URL = "https://upfirst.github.io/upfirst-mcp/";
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
const MAX_CLIENT_DOCUMENT_BYTES = 5 * 1024;
const MAX_REDIRECT_URIS = 20;
const MAX_REGISTRY_TEXT_LENGTH = 100;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const CLIENT_DOCUMENT_NAME_PATTERN = /^[a-z0-9-]+\.json$/;

const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${path}: not valid JSON (${error.message})`);
    return null;
  }
}

const gemini = readJson("gemini-extension.json");
const cursorPlugin = readJson(".cursor-plugin/plugin.json");
const cursorMcp = readJson("mcp.json");
const claudePlugin = readJson(".claude-plugin/plugin.json");
const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const claudeMcp = readJson(".mcp.json");
const antigravityPlugin = readJson("plugin.json");
const antigravityMcp = readJson("mcp_config.json");
const registry = readJson("server.json");

// Every manifest has the same version, and it is a real version number.
const versions = {
  "gemini-extension.json": gemini?.version,
  ".cursor-plugin/plugin.json": cursorPlugin?.version,
  ".claude-plugin/plugin.json": claudePlugin?.version,
  ".claude-plugin/marketplace.json": claudeMarketplace?.plugins?.[0]?.version,
  "server.json": registry?.version,
};
for (const [file, version] of Object.entries(versions)) {
  check(
    typeof version === "string" && VERSION_PATTERN.test(version),
    `${file}: version ${version} is not in the form X.Y.Z`,
  );
}
check(new Set(Object.values(versions)).size === 1, `Versions differ: ${JSON.stringify(versions)}`);

// Every manifest has exactly one server, and it is ours.
// Antigravity names the URL field `serverUrl`; the other clients name it `url`.
const serverLists = [
  { file: "gemini-extension.json", servers: gemini?.mcpServers, urlField: "url" },
  { file: "mcp.json", servers: cursorMcp?.mcpServers, urlField: "url" },
  { file: ".mcp.json", servers: claudeMcp?.mcpServers, urlField: "url" },
  { file: "mcp_config.json", servers: antigravityMcp?.mcpServers, urlField: "serverUrl" },
];
for (const { file, servers, urlField } of serverLists) {
  const names = Object.keys(servers ?? {});
  check(
    names.length === 1 && names[0] === SERVER_NAME,
    `${file}: mcpServers must contain only "${SERVER_NAME}", found ${JSON.stringify(names)}`,
  );
  const url = servers?.[SERVER_NAME]?.[urlField];
  check(url === SERVER_URL, `${file}: ${urlField} is ${url}, expected ${SERVER_URL}`);
}

// Antigravity rejects any plugin.json field other than these.
const allowedAntigravityPluginFields = ["$schema", "name", "description"];
check(
  Object.keys(antigravityPlugin ?? {}).every((field) =>
    allowedAntigravityPluginFields.includes(field),
  ),
  `plugin.json: only ${allowedAntigravityPluginFields.join(", ")} are allowed`,
);
check(antigravityPlugin?.name === SERVER_NAME, `plugin.json: name must be "${SERVER_NAME}"`);
check(
  registry?.remotes?.length === 1 &&
    registry.remotes[0].type === "streamable-http" &&
    registry.remotes[0].url === SERVER_URL,
  `server.json: remotes must be one streamable-http remote at ${SERVER_URL}`,
);

check(
  cursorPlugin?.mcpServers === "./mcp.json",
  ".cursor-plugin/plugin.json: mcpServers must be ./mcp.json",
);
check(
  claudePlugin?.mcpServers === "./.mcp.json",
  ".claude-plugin/plugin.json: mcpServers must be ./.mcp.json",
);
check(
  typeof cursorPlugin?.logo === "string" && existsSync(cursorPlugin.logo),
  `.cursor-plugin/plugin.json: logo file ${cursorPlugin?.logo} does not exist`,
);
check(
  (registry?.description?.length ?? 0) <= MAX_REGISTRY_TEXT_LENGTH,
  `server.json: description is longer than ${MAX_REGISTRY_TEXT_LENGTH} characters`,
);
check(
  (registry?.title?.length ?? 0) <= MAX_REGISTRY_TEXT_LENGTH,
  `server.json: title is longer than ${MAX_REGISTRY_TEXT_LENGTH} characters`,
);

// Every client document is a plain file that Upfirst accepts.
const clientDocuments = new Map();
for (const name of readdirSync("oauth")) {
  const path = join("oauth", name);
  const stats = lstatSync(path);
  check(
    stats.isFile() && !stats.isSymbolicLink(),
    `${path}: must be a regular file, not a link or a folder`,
  );
  check(
    CLIENT_DOCUMENT_NAME_PATTERN.test(name),
    `${path}: file name must use only a-z, 0-9 and "-", and end in .json`,
  );
  if (!stats.isFile()) {
    continue;
  }
  check(
    stats.size <= MAX_CLIENT_DOCUMENT_BYTES,
    `${path}: larger than ${MAX_CLIENT_DOCUMENT_BYTES} bytes`,
  );

  const document = readJson(path);
  if (!document) {
    continue;
  }
  const expectedClientId = `${PAGES_BASE_URL}oauth/${name}`;
  clientDocuments.set(expectedClientId, document);
  check(
    document.client_id === expectedClientId,
    `${path}: client_id must be ${expectedClientId}`,
  );
  check(
    typeof document.client_name === "string" && document.client_name.trim() !== "",
    `${path}: client_name is missing`,
  );
  check(!("client_secret" in document), `${path}: must not contain client_secret`);
  check(
    document.token_endpoint_auth_method === "none",
    `${path}: token_endpoint_auth_method must be "none"`,
  );
  check(
    Array.isArray(document.redirect_uris) &&
      document.redirect_uris.length >= 1 &&
      document.redirect_uris.length <= MAX_REDIRECT_URIS,
    `${path}: redirect_uris must have 1 to ${MAX_REDIRECT_URIS} entries`,
  );
  for (const uri of document.redirect_uris ?? []) {
    check(isAllowedRedirectUri(uri), `${path}: redirect URI not allowed: ${uri}`);
  }
}

// Each manifest uses a client document with the redirect URIs that its client needs.
const clientContracts = [
  {
    file: "gemini-extension.json",
    clientId: gemini?.mcpServers?.[SERVER_NAME]?.oauth?.clientId,
    requiredRedirectUris: ["http://localhost/oauth/callback"],
  },
  {
    file: "mcp.json",
    clientId: cursorMcp?.mcpServers?.[SERVER_NAME]?.auth?.CLIENT_ID,
    requiredRedirectUris: [
      "http://localhost:8787/callback",
      "https://www.cursor.com/agents/mcp/oauth/callback",
    ],
  },
  {
    file: "mcp_config.json",
    clientId: antigravityMcp?.mcpServers?.[SERVER_NAME]?.oauth?.clientId,
    requiredRedirectUris: ["https://antigravity.google/oauth-callback"],
  },
];
for (const { file, clientId, requiredRedirectUris } of clientContracts) {
  const document = clientDocuments.get(clientId);
  check(document, `${file}: client ID ${clientId} has no file in oauth/`);
  for (const uri of requiredRedirectUris) {
    check(
      document?.redirect_uris?.includes(uri),
      `${file}: client document ${clientId} is missing redirect URI ${uri}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("All setup files are valid.");

function isAllowedRedirectUri(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password || url.hash) {
    return false;
  }
  return (
    url.protocol === "https:" ||
    (url.protocol === "http:" && LOOPBACK_HOSTS.includes(url.hostname))
  );
}

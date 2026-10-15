# Contributing

This repository holds the setup files for the hosted Upfirst MCP server. The server code is not here.

## Where to report a problem

| Problem | Where to go |
| --- | --- |
| Your account, your receptionist, or a tool does not work as expected | [Help Center](https://help.upfirst.ai/en/) or [support@upfirst.ai](mailto:support@upfirst.ai) |
| A setup file or the README in this repository is wrong | Open an issue or a pull request |
| A security problem | [SECURITY.md](SECURITY.md) |

## Files

| File | Used by |
| --- | --- |
| `gemini-extension.json` | Gemini CLI and its extensions gallery |
| `.cursor-plugin/plugin.json`, `mcp.json` | Cursor plugin and the Cursor marketplace |
| `.claude-plugin/`, `.mcp.json` | Claude Code plugin marketplace |
| `server.json` | Official MCP Registry |
| `oauth/*.json` | Client ID documents. GitHub Pages serves them, and Upfirst reads them when a client signs in. |
| `assets/` | Logos |
| `scripts/validate.mjs` | Checks that the files above agree with each other and that Upfirst accepts the client documents. It runs on every pull request and every push to `main`. It does not replace the official schema checks of each directory. |

Cursor uses `mcp.json` and Claude Code uses `.mcp.json`. They differ because Cursor needs a client ID to sign in and Claude Code does not.

## Rules

1. **One version number.** `gemini-extension.json`, both plugin manifests, the marketplace entry, and `server.json` always have the same version. Change all of them together, then tag the release `vX.Y.Z`.
2. **Never change or delete a file in `oauth/` after it is merged.** Upfirst saves each client document the first time a client uses it and does not read it again, so a change has no effect. To change a client, add a new file (for example `cursor-v2.json`) and point the manifest to it. The check fails if a pull request or a push to `main` changes, deletes, or replaces a file in `oauth/`.
3. **Each client document has 1 to 20 redirect URIs. Each one must use `https`, or `http` on `localhost` or `127.0.0.1`.** Upfirst rejects the whole document if one URI uses another scheme, such as `cursor://`. Older Cursor versions use that scheme, so they cannot sign in.
4. **Run the checks before you open a pull request:**

   ```sh
   node scripts/validate.mjs
   ```

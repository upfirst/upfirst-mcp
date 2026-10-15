<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/wordmark-on-dark.svg">
    <img alt="Upfirst" src="assets/wordmark-on-light.svg" width="200">
  </picture>
</p>

<h1 align="center">Upfirst MCP server</h1>

<p align="center">
  The AI answering service for small businesses, now inside your AI assistant.<br>
  Ask for last week's calls, fix an answer your receptionist got wrong, or add a transfer rule. No dashboard needed.
</p>

<p align="center">
  <a href="https://cursor.com/install-mcp?name=upfirst&config=eyJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vbWNwLnVwZmlyc3QuYWkiLCJhdXRoIjp7IkNMSUVOVF9JRCI6Imh0dHBzOi8vdXBmaXJzdC5naXRodWIuaW8vdXBmaXJzdC1tY3Avb2F1dGgvY3Vyc29yLmpzb24ifX0%3D"><img alt="Add to Cursor" src="https://cursor.com/deeplink/mcp-install-dark.svg" height="32"></a>
  <a href="https://insiders.vscode.dev/redirect/mcp/install?name=upfirst&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.upfirst.ai%22%7D"><img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-Install_server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white" height="32"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/upfirst/upfirst-mcp?style=flat-square" height="32"></a>
</p>

## What this is

[Upfirst](https://upfirst.ai) answers your business calls with an AI receptionist. The Upfirst MCP server connects your receptionist to AI assistants like Claude, ChatGPT, Cursor, Antigravity, Gemini CLI, and VS Code. You manage it by asking, not by clicking.

Upfirst hosts the server at `https://mcp.upfirst.ai`. This repository holds only the setup files that AI clients and directories use to connect to it. The server code is not in this repository.

You need an Upfirst account. [See plans](https://upfirst.ai/pricing).

## Connect your AI assistant

Every client signs in the same way. The first time it connects, it opens the Upfirst sign-in page. You approve access once. There are no API keys to copy or store.

<details open>
<summary><b>Claude</b></summary>

Upfirst is in Claude's connector directory. Open [claude.ai/directory/upfirst](https://claude.ai/directory/upfirst), add Upfirst, and sign in. It works on claude.ai and in the Claude desktop app.

</details>

<details>
<summary><b>ChatGPT</b></summary>

Open the [Upfirst page in ChatGPT](https://chatgpt.com/plugins/plugin_asdk_app_6aa057dfb19c81919777fdc34a9d1f12?search=upfirst), add it, and sign in.

</details>

<details>
<summary><b>Claude Code</b></summary>

```sh
claude mcp add --transport http upfirst https://mcp.upfirst.ai
```

Then run `/mcp` in Claude Code and sign in. Add `--scope user` to use Upfirst in every project.

You can also install Upfirst as a plugin from this repository:

```text
/plugin marketplace add upfirst/upfirst-mcp
/plugin install upfirst@upfirst
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

```sh
gemini extensions install https://github.com/upfirst/upfirst-mcp
```

Then run `/mcp auth upfirst` in Gemini CLI and sign in.

</details>

<details>
<summary><b>Antigravity</b></summary>

```sh
agy plugin install https://github.com/upfirst/upfirst-mcp
```

Then open Agent settings, go to **Customizations**, and click **Authenticate** next to Upfirst. Sign in to Upfirst in the browser, copy the code it shows, paste it into Antigravity, and click **Submit**.

</details>

<details>
<summary><b>Cursor</b></summary>

Click **Add to Cursor** at the top of this page. Or add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "upfirst": {
      "url": "https://mcp.upfirst.ai",
      "auth": {
        "CLIENT_ID": "https://upfirst.github.io/upfirst-mcp/oauth/cursor.json"
      }
    }
  }
}
```

Cursor needs a client ID to sign in to Upfirst. The ID is the address of a small public file in this repository. It tells Upfirst which app is asking. It is not a secret.

You need a current version of Cursor. Older versions use a sign-in method that Upfirst does not support. If sign-in fails, update Cursor and try again.

</details>

<details>
<summary><b>VS Code</b></summary>

Click **Install in VS Code** at the top of this page. Or add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "upfirst": {
      "type": "http",
      "url": "https://mcp.upfirst.ai"
    }
  }
}
```

Start the server from the play button in the file, then use it in Copilot agent mode.

</details>

<details>
<summary><b>Codex</b></summary>

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.upfirst]
url = "https://mcp.upfirst.ai"
```

Then run `codex mcp login upfirst`.

</details>

<details>
<summary><b>Other clients</b></summary>

Use `https://mcp.upfirst.ai` as a remote MCP server with the streamable HTTP transport.

</details>

## What you can do

| Area | What your assistant can do | Tools |
| --- | --- | --- |
| Account and receptionists | See your account, list your receptionists, and change their settings | `get_account_overview`, `list_agents`, `get_agent_by_id`, `update_agent` |
| Greetings | Choose what a receptionist says first, based on the time of the call | `list_agent_greetings`, `create_agent_greeting`, `update_agent_greeting`, `delete_agent_greeting` |
| Knowledge | Read and edit what your receptionists know | `get_agent_knowledge`, `create_agent_knowledge`, `update_agent_knowledge`, `delete_agent_knowledge` |
| Skills | Add text message and call transfer skills | `list_agent_skills`, `create_sms_skill`, `update_sms_skill`, `delete_sms_skill`, `create_transfer_call_skill`, `update_transfer_call_skill` |
| Custom actions | Connect a receptionist to your own HTTP APIs | `list_custom_actions`, `create_custom_action`, `update_custom_action`, `delete_custom_action` |
| Calls | Find calls and read transcripts | `list_calls`, `get_call_by_id`, `get_call_transcript` |

The [Upfirst MCP docs](https://upfirst.ai/docs/mcp) describe every tool and its parameters.

## Try these prompts

- *"Review my calls from the last seven days. Which questions could my receptionist not answer? Suggest knowledge entries that fill the gaps. Do not change anything yet."*
- *"Read my most recent call. The receptionist gave the wrong opening hours. Fix its knowledge so it answers correctly next time."*
- *"During business hours, transfer callers who ask about billing to +1 202 555 0100."*
- *"Set up my receptionist from this description of my business: …"*

## Security and your data

- Sign-in uses OAuth 2.1 with PKCE. Your assistant never sees your Upfirst password.
- The connection reaches only the organization you signed in to.
- Your assistant can change your settings, not only read them. Treat the connection like being signed in to the dashboard.
- Deletes are permanent. There is no undo.
- Some settings are managed only in the Upfirst dashboard: voice, timezone, and language; scheduling skills; OAuth connections for custom actions; deleting a transfer skill; and importing knowledge from a website. Call recordings are not available over MCP.

Read our [Privacy Policy](https://upfirst.ai/privacy-policy), [Terms of Service](https://upfirst.ai/terms-of-service), [Data Processing Addendum](https://upfirst.ai/data-processing-addendum), and [Security](https://upfirst.ai/security) pages.

## Help

- Setup for every client and a reference for all tools: [upfirst.ai/docs/mcp](https://upfirst.ai/docs/mcp)
- Questions about your account or receptionist: [Help Center](https://help.upfirst.ai/en/) or [support@upfirst.ai](mailto:support@upfirst.ai)
- A setup file in this repository is wrong: [open an issue](https://github.com/upfirst/upfirst-mcp/issues/new/choose)
- A security problem: see [SECURITY.md](SECURITY.md)

## License

Except for the Upfirst name and the logo files in [`assets/`](assets), the files in this repository are under the [MIT License](LICENSE). The Upfirst name and logos belong to Upfirst, Inc.

# 🤖 OpenReview

**Self-hosted AI code review bot for GitHub PRs.**

MIT-licensed alternative to CodeRabbit, Qodo Merge, and Copilot Code Review.
Bring your own LLM — OpenAI, Anthropic, DeepSeek, or local Ollama.

## Why OpenReview?

| | CodeRabbit | Qodo Merge | **OpenReview** |
|---|---|---|---|
| **License** | Proprietary | MIT (complex) | **MIT (minimal)** |
| **Self-hosted** | ❌ | ✅ | ✅ |
| **Setup** | SaaS | Docker + config | **Docker compose, 3 env vars** |
| **LLM** | Hidden | Any | **Any OpenAI-compatible** |
| **Code** | Closed | 100K+ lines | **~300 lines** |
| **Customize** | `.coderabbit.yaml` | `configuration.toml` | **Edit the source** |

## Quick Start

### 1. Clone & Deploy

```bash
git clone https://github.com/kunci115/open-review
cd open-review
cp .env.example .env   # fill in LLM_API_KEY + GITHUB_TOKEN
docker compose up -d
```

### 2. GitHub Webhook

Create a webhook on your repo:
- **URL**: `https://your-server:4000/webhook`
- **Events**: Pull requests
- **Content type**: `application/json`

Or use the public endpoint via ngrok for testing:
```bash
ngrok http 4000
```

### 3. Done

Open a PR → OpenReview posts a review within 2-4 minutes.

## Configuration

| Env Var | Required | Default |
|---|---|---|
| `LLM_BASE_URL` | Yes | `https://api.openai.com/v1` |
| `LLM_API_KEY` | Yes | — |
| `LLM_MODEL` | No | `gpt-4o` |
| `GITHUB_TOKEN` | Yes | — |
| `PORT` | No | `4000` |

### Providers

**DeepSeek** (recommended — cheap + good):
```env
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

**OpenAI**:
```env
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

**Anthropic** (via compatible proxy):
```env
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_MODEL=claude-sonnet-4
```

**Ollama** (local, free):
```env
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen3-coder
```

## What It Reviews

- 🔴 **Security**: SQL injection, XSS, hardcoded secrets, unsafe deserialization
- 🟡 **Bugs**: null refs, race conditions, incorrect error handling
- 🟠 **Performance**: N+1 queries, missing indexes, inefficient loops
- 🔵 **Patterns**: anti-patterns, broken conventions, missing validation

## Roadmap

- [ ] GitLab + Bitbucket support
- [ ] `openreview.yaml` config file (path-specific rules)
- [ ] PR summarization (`/describe`-style)
- [ ] Code suggestions with fix snippets
- [ ] Review dashboard UI
- [ ] Slack/Discord notifications

## Sponsors

OpenReview is MIT licensed and self-hosted forever. If this saves your team time,
consider [sponsoring on GitHub](https://github.com/sponsors/kunci115).

---

*Built by [Kolonix](https://kolonix.com) • Self-hosted • MIT • No vendor lock-in*
# Test change for PR review

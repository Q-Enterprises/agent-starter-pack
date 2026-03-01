# AGENTS.md

## Project overview
- **Repository purpose:** `agent-starter-pack` is a template and tooling repository for building, testing, and deploying production-ready GenAI agents on Google Cloud.
- **Primary stack:** Python (CLI + templates), with supporting Go, Terraform, and frontend assets in template folders.
- **Key entry points:**
  - `README.md` for quick start and high-level architecture.
  - `Makefile` for common local tasks.
  - `pyproject.toml` for Python tooling/configuration.

## Build and test commands
Use these commands from the repository root:

- Install dev dependencies:
  - `make install`
- Run full test suite:
  - `make test`
- Run templated agent integration tests:
  - `make test-templated-agents`
- Run E2E deployment tests (requires configured env in `tests/cicd/.env`):
  - `make test-e2e`
- Run linting/type checks:
  - `make lint`
- Validate templated agent linting:
  - `make lint-templated-agents`

## Code style guidelines
- Follow formatting and linting rules configured in `pyproject.toml`.
- For Python changes:
  - Keep functions focused and type-friendly.
  - Prefer explicit names over abbreviations.
  - Update docs/comments when behavior changes.
- For generated/template content, preserve placeholder variables and template directory structure.
- Keep edits minimal and scoped to the requested change.

## Testing instructions
- Run targeted tests for the area you modified first, then broader suites when practical.
- For Python logic changes, run at least:
  - `make lint`
  - `make test`
- For template-related changes, also run:
  - `make test-templated-agents`
  - `make lint-templated-agents`
- If a test cannot run due to environment limitations (e.g., missing cloud credentials), document it clearly in your final summary.

## Security considerations
- Never commit secrets, credentials, API keys, or `.env` values.
- Assume cloud resources are billed to real projects; avoid unnecessary provisioning in tests.
- Treat external inputs (prompts, config files, template variables) as untrusted and validate before use.
- Prefer least-privilege service account/IAM settings in deployment changes.
- Avoid introducing dependencies that require network-time code execution without clear justification.

## Commit and pull request guidelines
- Use clear, imperative commit messages (e.g., `Add root AGENTS.md with contributor guidance`).
- Keep commits focused on one logical change.
- PR descriptions should include:
  - What changed.
  - Why it changed.
  - How it was validated (commands + results).
  - Any known limitations or follow-up work.

## Monorepo and nested AGENTS.md guidance
- This repository contains many subdirectories and templates.
- Add nested `AGENTS.md` files in subprojects when workflows differ significantly (for example, frontend, Go templates, or deployment-specific directories).
- When nested instructions conflict, the closest `AGENTS.md` to the changed file takes precedence.

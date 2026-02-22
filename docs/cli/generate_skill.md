# `generate-skill`

Generate a deterministic skill markdown document from an existing project.

## Usage

```bash
agent-starter-pack generate-skill [OPTIONS]
```

## Options

- `--source` Path to the source project directory. Defaults to `.`.
- `--output` Output file path for generated skill content. Defaults to `skills.md`.
- `--format` Output format. Currently supports `markdown` only.

## What it extracts

The command reuses project discovery and metadata loading behaviors used by `extract`:

- language detection (`python`/`go`)
- agent starter pack config loading
- agent directory detection

It then combines metadata from:

- `pyproject.toml` (`[tool.agent-starter-pack]`)
- `.template/templateconfig.yaml` (if available)
- `GEMINI.md` (if available)

## Output structure

The generated markdown contains:

1. Name and description
2. Trigger phrases
3. Required tools/dependencies
4. Step-by-step workflow
5. Key files/functions to inspect

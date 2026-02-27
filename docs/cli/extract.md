# extract

The `extract` command produces a minimal, shareable agent core from a full Agent Starter Pack scaffold. Use it when you want to hand off just the reusable agent logic (without full infrastructure) to another team, repository, or workflow.

## Usage

```bash
uvx agent-starter-pack extract [OUTPUT_PATH] [OPTIONS]
```

## Purpose

`extract` is designed to:

- Start from a full project generated with [`create`](./create.md) or upgraded with [`enhance`](./enhance.md)
- Keep the essential agent implementation and metadata
- Remove scaffold-heavy files that are useful for deployment but unnecessary for sharing core agent logic
- Produce a clean output folder that can be versioned, copied, or converted into reusable skill documentation (`skills.md`)

## Options

### `OUTPUT_PATH` (positional)

Destination directory for the extracted project. If omitted, the command uses its default output location.

### `--source` PATH

Source project directory to extract from. Defaults to the current working directory.

### `--dry-run`

Show what would be extracted without writing files. Useful for validating include/exclude behavior before changing anything on disk.

### `--force`

Overwrite an existing output path when present.

### `--debug`

Enable verbose debugging output to help diagnose extraction logic, file selection, and project detection behavior.

## End-to-End Example

### 1) Start with a full scaffold

```bash
# Option A: Create a new project
uvx agent-starter-pack create my-agent -a adk

# Option B: Enhance an existing project in-place
uvx agent-starter-pack enhance . --name my-agent
```

### 2) Extract the minimal shareable core

```bash
uvx agent-starter-pack extract ./dist/my-agent-core --source ./my-agent
```

### 3) Convert extracted project into `skills.md`

After extraction, convert the resulting core project into `skills.md` documentation:

- **Manual now:** write `skills.md` by documenting the extracted agent's purpose, inputs/outputs, commands, and usage examples.
- **Future workflow:** use a dedicated conversion command when available.

## Troubleshooting

### Missing ASP configuration

If extraction fails because `pyproject.toml` is missing or lacks Agent Starter Pack metadata:

1. Confirm you are targeting a valid ASP-based project.
2. Re-run extraction with `--source` pointing to the scaffold root.
3. Use `--debug` to inspect which configuration keys are being read.

### Agent directory detection failures

If the command cannot locate your agent directory automatically:

1. Verify project metadata and package paths in `pyproject.toml`.
2. Ensure your agent code lives in the expected directory layout.
3. Re-run with `--debug` and adjust project structure before extracting.

### Python vs Go project differences

Extraction behavior can differ across language templates:

- **Python templates:** commonly rely on package layout and `pyproject.toml` package configuration.
- **Go templates:** may use different source roots and module conventions.

When moving between ecosystems, use `--dry-run` first to verify exactly which files are included.

## Related Documentation

- [`create` command](./create.md)
- [`enhance` command](./enhance.md)
- [Using Remote Templates](../remote-templates/using-remote-templates.md)
- [Creating Remote Templates](../remote-templates/creating-remote-templates.md)

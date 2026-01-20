# Repository Guidelines

## Project Structure & Module Organization
- `content/posts/<slug>/index.md` holds Markdown per post with front matter; place post-specific assets inside the same folder for easy relocation.
- `static/` stores shared assets (images, downloads) referenced with absolute paths; never commit the generated `public/` output.
- `themes/notes-theme/` contains layouts, partials, and styling; Go template files there follow a two-space indentation and explicit `{{ end }}` pairing.
- `archetypes/default.md` seeds new posts; update it when introducing required metadata fields.
- `config.toml` centralizes menus, hero copy, and site metadata—review it before deploying any large content batch.

## Build, Test, and Development Commands
- `hugo server` starts the live-reload dev server at `http://localhost:1313`; keep it running while editing content or templates.
- `hugo server --buildDrafts` previews posts marked `draft: true` so reviewers can see in-progress work.
- `hugo new posts/<slug>.md` scaffolds a kebab-case post directory under `content/posts/`.
- `hugo --gc --minify` produces a production-ready `public/` folder, removes unused resources, and surfaces build-time errors.

## Coding Style & Naming Conventions
- Slugs and directories stay kebab-case (e.g., `content/posts/markdown-showcase/`); keep front matter titles sentence-case.
- Front matter prefers TOML-style keys with lowercase names, inline tag arrays, and an explicit `draft` flag until publication.
- Markdown headings descend in order (`#`, `##`, `###`); include language hints in fenced code blocks and keep prose lines under ~100 characters.
- Template partials and shortcodes live in `themes/notes-theme/layouts`; align indentation with two spaces and name helpers descriptively.
- `config.toml` adopts two-space indentation for nested tables; quote strings and keep array entries one per line for readability.

## Testing Guidelines
- Run `hugo server` after structural changes to catch template warnings in the console.
- Execute `hugo --gc --minify` before pushing to confirm a clean build and regenerate assets; spot-check the resulting `public/` output locally.
- Store visual diffs or screenshots alongside pull requests rather than in the repo; long-lived media belongs in `static/`.

## Agent Skills (Cursor local testing)
- This repo includes optional skill SOPs under `skills/`. When asked to “use skills”, first read the relevant `skills/<name>/SKILL.md`, then follow it strictly before making edits.

## Commit & Pull Request Guidelines
- Write imperative, concise commit subjects; prefer Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) as in `feat: localize article images and polish visuals`.
- Keep commits focused: separate theme tweaks, content updates, and configuration changes.
- Pull requests link issues when applicable, summarize scope, list verification steps (`hugo server`, `hugo --gc --minify`), and attach before/after screenshots for visual work.
- Highlight any deployment considerations (e.g., baseURL adjustments) so reviewers know when to rebuild or republish the static site.

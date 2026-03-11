# Repository Guidelines

## Project Structure & Module Organization
This repository is split into two application packages plus supporting content:

- `main/`: Electron main process, native windowing, shortcuts, overlay lifecycle, and packaging.
- `renderer/`: Vue 3 + Vite UI, item parsing, widgets, localization, and static assets in `renderer/public/`.
- `ipc/`: Shared TypeScript types and key-code mappings used across `main` and `renderer`.
- `docs/`: VitePress documentation site.
- `Awakened-PoE-Trade-CN-Helper/`: helper tooling and data-generation utilities; treat it as a separate subproject.

Keep feature code close to its runtime domain. For example, overlay UI belongs under `renderer/src/web/overlay/`, while Electron host behavior belongs under `main/src/`.

## Build, Test, and Development Commands
Run commands from the package they belong to:

- `cd renderer && npm ci`: install renderer dependencies.
- `cd renderer && npm run make-index-files`: regenerate asset indexes before dev/build.
- `cd renderer && npm run dev`: start the Vite renderer.
- `cd renderer && npm run lint`: run ESLint on `.ts` and `.vue` files.
- `cd renderer && npm run build`: run `vue-tsc --noEmit` and produce the renderer bundle.
- `cd main && npm ci`: install Electron/main-process dependencies.
- `cd main && npm run dev`: start the Electron app in development mode.
- `cd main && npm run build`: run `tsc --noEmit` and the production build script.
- `cd main && npm run package -- -p onTagOrDraft`: create distributables with `electron-builder`.
- `cd docs && npm run dev`: preview the documentation site.

## Coding Style & Naming Conventions
Use TypeScript throughout. Follow the existing ESLint configuration in `renderer/.eslintrc.js`: single quotes, consistent-as-needed quoted props, and no unused variables. Existing source files use 2-space indentation; match that style. Use `PascalCase` for Vue components (`WidgetItemSearch.vue`), `camelCase` for variables/functions, and descriptive folder names by feature area.

## Testing Guidelines
There is no dedicated unit-test suite in the root project today. Validation is build-based:

- always run `renderer` lint and build checks for UI changes;
- run `main` build checks for Electron-side changes;
- smoke-test the affected workflow locally when changing shortcuts, overlays, parsing, or localization data.

Document any manual verification steps in the PR when automated coverage is not available.

## Commit & Pull Request Guidelines
Recent history favors short, imperative subjects, often with prefixes such as `fix:` or `fix(renderer):`. Keep commits focused and scoped when helpful. PRs should include:

- a concise description of the behavior change;
- linked issues or context when relevant;
- screenshots or recordings for UI/overlay changes;
- notes on manual verification and any required data regeneration (`npm run make-index-files`, submodule updates, etc.).

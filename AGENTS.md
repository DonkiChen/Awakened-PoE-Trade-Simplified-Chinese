# Repository Guidelines

## Chinese data generation

- `Awakened-PoE-Trade-CN-Helper/` is a Git submodule, not an npm package. Initialize it and its nested tools with `git submodule update --init --recursive` on a fresh checkout. Read its [AGENTS.md](Awakened-PoE-Trade-CN-Helper/AGENTS.md) before editing the generator; the parent tracks only its commit pointer.
- The helper reads `renderer/public/data/en/` and regenerates `zh_CN/items.ndjson`, `zh_CN/stats.ndjson`, and only the marked `*_MODS` block of `zh_CN/client_strings.js`. Fix durable translation changes in the generator or its inputs; don't hand-edit the generated block. The international export's `Traditional Chinese` slot still feeds `zh_CN`, not `cmn-Hant`.
- After changing affix data or recognition, run `npm run test:affix-recognition` from `renderer/`; it regenerates asset indexes before testing. For one clipboard sample, use `npm run parse:item -- --lang zh_CN --realm pc-tencent --file <path>` with fresh indexes (`npm run make-index-files`).

## Desktop app

- `main/` and `renderer/` have separate lockfiles; run `npm ci` in each package. Run their `npm run dev` commands in separate terminals: Electron loads the renderer at `http://localhost:5173`. Native shortcuts and overlay lifecycle live in `main/src/`, overlay UI in `renderer/src/web/overlay/`, shared IPC types in `ipc/`.
- For renderer changes, run `npm run lint` and `npm run build`; Vite generates asset indexes, but the standalone parser CLI does not. For Electron changes, run `npm run build` in `main/`. Packaging consumes `renderer/dist`, so build the renderer first.
- Smoke-test native shortcut and overlay changes in the Electron app; note manual checks and data regeneration in the PR.

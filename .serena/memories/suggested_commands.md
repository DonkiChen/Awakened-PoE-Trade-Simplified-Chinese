# Suggested Commands
- Windows shell note: before running cmd/PowerShell commands for this repo, switch to UTF-8 with `chcp 65001 >NUL`.
- Common Windows navigation/search commands:
  - `Get-ChildItem -Force`
  - `Set-Location <path>`
  - `rg <pattern>` or `rg --files`
  - `Get-ChildItem -Recurse | Select-String -Pattern '<pattern>'`
  - `git status`, `git diff`, `git log --oneline -n 10`

## Renderer (`renderer/`)
- Install: `cd renderer; npm ci`
- Generate asset indexes: `cd renderer; npm run make-index-files`
- Start dev server: `cd renderer; npm run dev`
- Lint: `cd renderer; npm run lint`
- Build: `cd renderer; npm run build`
- Parse helper script: `cd renderer; npm run parse:item`

## Main / Electron (`main/`)
- Install: `cd main; npm ci`
- Start dev app: `cd main; npm run dev`
- Build: `cd main; npm run build`
- Package distributables: `cd main; npm run package -- -p onTagOrDraft`

## Docs (`docs/`)
- Start docs site: `cd docs; npm run dev`

## Troubleshooting
- `DEVELOPING.md` contains older `yarn` examples; current repository guidance for this environment uses `npm`.
- On Windows, if `main` dev hits `Error: listen EACCES: permission denied 127.0.0.1:8584`, `net stop winnat` then `net start winnat` may resolve it (documented in `DEVELOPING.md`).
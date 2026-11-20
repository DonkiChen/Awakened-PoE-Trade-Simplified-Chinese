# 简中物品与词缀数据更新

1. 首次克隆时加 `--recurse-submodules`；已有仓库可在根目录运行 `git submodule update --init --recursive`。
2. 按 [Helper 数据生成指南](./Awakened-PoE-Trade-CN-Helper/README.md) 配置数据源，在 `Awakened-PoE-Trade-CN-Helper` 目录运行 `.\scripts\build_and_export.bat`，重新导出当前游戏数据。
3. 在同一目录运行 `.\scripts\generate_translations.bat`。它会更新 `renderer/public/data/zh_CN/` 下的 `items.ndjson`、`stats.ndjson` 和 `client_strings.js` 中的 `*_MODS` 区块。
4. 在 `renderer` 目录运行 `npm run test:affix-recognition`，验证生成的数据能正确解析词缀和识别所属机制。

只更新词缀机制名称时，在 Helper 目录运行 `.\gradlew.bat generateTranslations --args=--mod-names-only`；只校验、不写入时用 `--args=--check-mod-names`。简中 `*_MODS` 只使用本次导出的 `Mods.json`，不合并旧译名，请勿手改生成区块。

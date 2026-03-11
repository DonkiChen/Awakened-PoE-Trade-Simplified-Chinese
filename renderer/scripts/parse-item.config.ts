import type { ParserRealm } from '../src/parser/runtime'

export interface ParseItemConfig {
  lang: 'en' | 'ru' | 'cmn-Hant' | 'zh_CN' | 'ko'
  realm?: ParserRealm
  file?: string
  text?: string
  dataDir?: string
}

const config: ParseItemConfig = {
  lang: 'zh_CN',
  realm: 'pc-tencent',
  // Prefer `file` for longer samples; `text` is handy for quick one-off checks.
  // file: './tmp/item.txt',
  // text: `item text`,
  // Optional override when testing against another exported data bundle.
  // dataDir: './public/data'
}

export default config

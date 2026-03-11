import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import type { TranslationDict } from './interfaces'
import { configureParserRuntime, type ParserRealm } from '../../parser/runtime'
import { finalizeDataInit, hydrateLanguageData, hydrateStaticData } from './index'

function defaultDataDir () {
  // Reuse the checked-in renderer data bundle so parser tests do not need Vite.
  return fileURLToPath(new URL('../../../public/data', import.meta.url))
}

async function importTranslationDict (filepath: string) {
  const module = await import(pathToFileURL(filepath).href)
  return module.default as TranslationDict
}

async function readUint32Array (filepath: string) {
  const data = await readFile(filepath)
  return new Uint32Array(data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ))
}

export async function initForNode (lang: string, options?: { dataDir?: string, realm?: ParserRealm }) {
  const dataDir = options?.dataDir ?? defaultDataDir()
  // CN item names are looked up by translated text, while GGG realm uses ref names.
  const realm: ParserRealm = options?.realm ?? (lang === 'zh_CN' ? 'pc-tencent' : 'pc-ggg')

  configureParserRuntime({
    getRealm: () => realm
  })

  hydrateStaticData({
    // Match the globals populated by the browser-side data bootstrap.
    clientStringsRef: await importTranslationDict(path.join(dataDir, 'en', 'client_strings.js')),
    itemDrop: JSON.parse(await readFile(path.join(dataDir, 'item-drop.json'), 'utf8')),
    appPatrons: JSON.parse(await readFile(path.join(dataDir, 'patrons.json'), 'utf8'))
  })

  hydrateLanguageData({
    clientStrings: await importTranslationDict(path.join(dataDir, lang, 'client_strings.js')),
    itemsNdjson: await readFile(path.join(dataDir, lang, 'items.ndjson'), 'utf8'),
    itemsNameIndex: await readUint32Array(path.join(dataDir, lang, 'items-name.index.bin')),
    itemsRefIndex: await readUint32Array(path.join(dataDir, lang, 'items-ref.index.bin')),
    statsNdjson: await readFile(path.join(dataDir, lang, 'stats.ndjson'), 'utf8'),
    statsRefIndex: await readUint32Array(path.join(dataDir, lang, 'stats-ref.index.bin')),
    statsMatcherIndex: await readUint32Array(path.join(dataDir, lang, 'stats-matcher.index.bin'))
  })

  finalizeDataInit(lang)
}

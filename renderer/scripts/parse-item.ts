import {readFile} from 'fs/promises'
import {initForNode} from '../src/assets/data/node'
import {parseClipboard, ParsedItem} from '../src/parser'
import type {ParserRealm} from '../src/parser/runtime'
import config from './parse-item.config'

interface CliOptions {
  lang: string
  file?: string
  text?: string
  realm?: ParserRealm
  dataDir?: string
}

function parseArgs(argv: string[]) {
  // Config file is the default; CLI flags only override specific fields.
  const options: CliOptions = {...config}

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--lang') {
      options.lang = argv[i + 1] ?? options.lang
      i += 1
    } else if (arg === '--file') {
      options.file = argv[i + 1]
      i += 1
    } else if (arg === '--realm') {
      options.realm = argv[i + 1] as ParserRealm | undefined
      i += 1
    } else if (arg === '--data-dir') {
      options.dataDir = argv[i + 1]
      i += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function readStdin() {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    process.stdin.on('data', chunk => chunks.push(Buffer.from(chunk)))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

async function readClipboardText(options: CliOptions) {
  if (options.file) {
    return await readFile(options.file, 'utf8')
  }
  if (options.text) {
    // Useful for quick parser experiments without creating a temporary file.
    return options.text
  }
  return await readStdin()
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  await initForNode(options.lang, {
    realm: options.realm,
    dataDir: options.dataDir
  })

  const text = await readClipboardText(options)
  const parsed = parseClipboard(text.trim())

  if (parsed.isErr()) {
    console.error(parsed.error)
    process.exitCode = 1
    return
  }

  const simplify = {
    stats: parsed.value.statsByType
      .map((it) => it.stat.ref),
    unknownModifiers: parsed.value.unknownModifiers
  }

  console.log(JSON.stringify(simplify, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

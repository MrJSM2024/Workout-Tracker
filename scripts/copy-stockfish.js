const fs = require('fs')
const path = require('path')

const srcDir = path.resolve(__dirname, '../node_modules/stockfish/src')
const rootDir = path.resolve(__dirname, '../node_modules/stockfish')
const destDir = path.resolve(__dirname, '../public')

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

// Possible single-threaded stockfish JS+WASM file pairs to try (in order of preference)
const candidates = [
  ['stockfish-nnue-16-single.js', 'stockfish-nnue-16-single.wasm'],
  ['stockfish-16-single.js', 'stockfish-16-single.wasm'],
  ['stockfish-nnue-16.js', 'stockfish-nnue-16.wasm'],
  ['stockfish.js', 'stockfish.wasm'],
]

let copied = false

for (const [jsFile, wasmFile] of candidates) {
  const jsSrc = path.join(srcDir, jsFile)
  if (fs.existsSync(jsSrc)) {
    fs.copyFileSync(jsSrc, path.join(destDir, 'stockfish-engine.js'))
    console.log(`✓ Copied ${jsFile} → public/stockfish-engine.js`)

    const wasmSrc = path.join(srcDir, wasmFile)
    if (fs.existsSync(wasmSrc)) {
      fs.copyFileSync(wasmSrc, path.join(destDir, 'stockfish-engine.wasm'))
      console.log(`✓ Copied ${wasmFile} → public/stockfish-engine.wasm`)
    }
    copied = true
    break
  }
}

// Fallback: try root of package
if (!copied) {
  const fallback = path.join(rootDir, 'stockfish.js')
  if (fs.existsSync(fallback)) {
    fs.copyFileSync(fallback, path.join(destDir, 'stockfish-engine.js'))
    console.log('✓ Copied stockfish.js (root) → public/stockfish-engine.js')
    copied = true
  }
}

if (!copied) {
  console.warn('⚠ Stockfish files not found. Engine will not work until resolved.')
} else {
  console.log('Stockfish ready.')
}

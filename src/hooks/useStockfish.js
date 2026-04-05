import { useEffect, useRef, useCallback } from 'react'

export function useStockfish({ difficulty, onBestMove, enabled }) {
  const workerRef = useRef(null)
  const readyRef = useRef(false)
  const pendingFenRef = useRef(null)
  const onBestMoveRef = useRef(onBestMove)

  // Keep callback ref current so the worker handler never goes stale
  useEffect(() => { onBestMoveRef.current = onBestMove }, [onBestMove])

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    let worker

    try {
      worker = new Worker(`${base}stockfish-engine.js`)
    } catch (err) {
      console.error('Failed to load Stockfish worker:', err)
      return
    }

    workerRef.current = worker
    readyRef.current = false

    worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data ?? '')
      if (!line) return

      if (line === 'readyok') {
        readyRef.current = true
        worker.postMessage(`setoption name Skill Level value ${difficulty.level}`)
        worker.postMessage('setoption name Use NNUE value false')

        if (pendingFenRef.current) {
          const fen = pendingFenRef.current
          pendingFenRef.current = null
          worker.postMessage(`position fen ${fen}`)
          worker.postMessage(`go movetime ${difficulty.time}`)
        }
      }

      if (line.startsWith('bestmove')) {
        const parts = line.split(' ')
        const move = parts[1]
        if (move && move !== '(none)') {
          onBestMoveRef.current(move)
        }
      }
    }

    worker.onerror = (err) => console.error('Stockfish error:', err)

    worker.postMessage('uci')
    worker.postMessage('setoption name Use NNUE value false')
    worker.postMessage('isready')

    return () => {
      worker.terminate()
      workerRef.current = null
      readyRef.current = false
      pendingFenRef.current = null
    }
  }, [difficulty.level, difficulty.time])

  const requestMove = useCallback((fen) => {
    if (!enabled) return
    const worker = workerRef.current
    if (!worker) return

    if (readyRef.current) {
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go movetime ${difficulty.time}`)
    } else {
      pendingFenRef.current = fen
    }
  }, [enabled, difficulty.time])

  return { requestMove }
}

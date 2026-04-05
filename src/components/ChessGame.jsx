import { useState, useEffect, useRef, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useStockfish } from '../hooks/useStockfish'
import { playMoveSound, playCaptureSound, playCheckSound, playGameEndSound } from '../utils/sounds'
import GameStatus from './GameStatus'
import styles from './ChessGame.module.css'

export default function ChessGame({ config, onNewGame }) {
  const { playerColor, difficulty } = config
  const engineColor = playerColor === 'white' ? 'b' : 'w'

  // Chess instance lives in a ref so it's always current in callbacks
  const chessRef = useRef(new Chess())
  const [fen, setFen] = useState('start')
  const [gameOver, setGameOver] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [optionSquares, setOptionSquares] = useState({})
  const [lastMoveSquares, setLastMoveSquares] = useState({})
  const engineTurnRef = useRef(false)

  const game = chessRef.current
  const isPlayerTurn = !gameOver && game.turn() !== engineColor

  // Ref so applyMove inside handleBestMove is never stale
  const applyMoveRef = useRef(null)

  function checkEnd(chess) {
    if (chess.isCheckmate()) {
      const playerWon = chess.turn() === engineColor
      playGameEndSound(playerWon)
      setGameOver({
        result: playerWon ? 'win' : 'loss',
        message: playerWon ? 'You won by checkmate!' : 'Checkmate — engine wins.',
      })
      return true
    }
    if (chess.isDraw()) {
      setGameOver({ result: 'draw', message: "It's a draw!" })
      return true
    }
    if (chess.isCheck()) playCheckSound()
    return false
  }

  function applyMove(moveData) {
    try {
      const result = game.move(moveData)
      if (!result) return false

      if (result.captured) playCaptureSound()
      else playMoveSound()

      setLastMoveSquares({
        [result.from]: { backgroundColor: 'rgba(255,255,0,0.28)' },
        [result.to]:   { backgroundColor: 'rgba(255,255,0,0.28)' },
      })
      setSelectedSquare(null)
      setOptionSquares({})
      setFen(game.fen())
      checkEnd(game)
      return true
    } catch {
      return false
    }
  }

  applyMoveRef.current = applyMove

  const handleBestMove = useCallback((moveStr) => {
    const from = moveStr.slice(0, 2)
    const to   = moveStr.slice(2, 4)
    const promo = moveStr.length > 4 ? moveStr[4] : 'q'
    applyMoveRef.current({ from, to, promotion: promo })
    engineTurnRef.current = false
  }, [])

  const { requestMove } = useStockfish({
    difficulty,
    onBestMove: handleBestMove,
    enabled: !gameOver,
  })

  // Trigger engine when it's its turn
  useEffect(() => {
    if (!gameOver && game.turn() === engineColor && !engineTurnRef.current) {
      engineTurnRef.current = true
      requestMove(game.fen())
    }
  }, [fen, gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  function showMoveOptions(square) {
    const moves = game.moves({ square, verbose: true })
    if (!moves.length) return
    const highlights = {
      [square]: { backgroundColor: 'rgba(255,255,0,0.4)' },
    }
    moves.forEach(m => {
      highlights[m.to] = {
        background: game.get(m.to)
          ? 'radial-gradient(circle, rgba(0,0,0,.38) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.22) 28%, transparent 28%)',
        borderRadius: '50%',
      }
    })
    setOptionSquares(highlights)
  }

  function onSquareClick(square) {
    if (!isPlayerTurn) return

    if (selectedSquare) {
      if (applyMove({ from: selectedSquare, to: square, promotion: 'q' })) return

      const piece = game.get(square)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        showMoveOptions(square)
      } else {
        setSelectedSquare(null)
        setOptionSquares({})
      }
    } else {
      const piece = game.get(square)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        showMoveOptions(square)
      }
    }
  }

  function onPieceDrop(source, target) {
    if (!isPlayerTurn) return false
    return applyMove({ from: source, to: target, promotion: 'q' })
  }

  const customSquareStyles = { ...lastMoveSquares, ...optionSquares }

  const resultIcon = { win: '🏆', loss: '♟', draw: '🤝' }

  return (
    <div className={styles.container}>
      <GameStatus
        turn={game.turn()}
        playerColor={playerColor}
        difficulty={difficulty.label}
        isCheck={!gameOver && game.isCheck()}
      />

      <div className={styles.boardWrapper}>
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          boardOrientation={playerColor}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          customBoardStyle={{ borderRadius: '6px', boxShadow: '0 10px 40px rgba(0,0,0,.7)' }}
          customSquareStyles={customSquareStyles}
          arePiecesDraggable={isPlayerTurn}
          animationDuration={180}
        />
      </div>

      {gameOver && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.overlayIcon}>{resultIcon[gameOver.result]}</div>
            <p className={styles.overlayMsg}>{gameOver.message}</p>
            <button className={styles.newGameBtn} onClick={onNewGame}>
              New Game
            </button>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={onNewGame}>
          ↩ New Game
        </button>
      </div>
    </div>
  )
}

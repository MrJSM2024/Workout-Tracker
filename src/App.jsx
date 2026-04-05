import { useState } from 'react'
import GameSetup from './components/GameSetup'
import ChessGame from './components/ChessGame'

export default function App() {
  const [gameConfig, setGameConfig] = useState(null)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {gameConfig ? (
        <ChessGame config={gameConfig} onNewGame={() => setGameConfig(null)} />
      ) : (
        <GameSetup onStart={setGameConfig} />
      )}
    </div>
  )
}

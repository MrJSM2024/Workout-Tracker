import { useState } from 'react'
import styles from './GameSetup.module.css'

const DIFFICULTIES = [
  { label: 'Easy',   value: 'easy',   level: 3,  time: 500  },
  { label: 'Medium', value: 'medium', level: 10, time: 1200 },
  { label: 'Hard',   value: 'hard',   level: 18, time: 2500 },
]

export default function GameSetup({ onStart }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [color, setColor] = useState('white')

  function handleStart() {
    const diff = DIFFICULTIES.find(d => d.value === difficulty)
    onStart({ difficulty: diff, playerColor: color })
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>♛</div>
        <h1 className={styles.title}>Chess</h1>
        <p className={styles.subtitle}>Play vs Stockfish Engine</p>

        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>Difficulty</h2>
          <div className={styles.optionGroup}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                className={`${styles.optionBtn} ${difficulty === d.value ? styles.active : ''}`}
                onClick={() => setDifficulty(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>Play as</h2>
          <div className={styles.optionGroup}>
            <button
              className={`${styles.optionBtn} ${color === 'white' ? styles.active : ''}`}
              onClick={() => setColor('white')}
            >
              ♔ White
            </button>
            <button
              className={`${styles.optionBtn} ${color === 'black' ? styles.active : ''}`}
              onClick={() => setColor('black')}
            >
              ♚ Black
            </button>
          </div>
        </section>

        <button className={styles.startBtn} onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}

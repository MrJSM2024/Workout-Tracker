import styles from './GameStatus.module.css'

export default function GameStatus({ turn, playerColor, difficulty, isCheck }) {
  const isPlayerTurn = (turn === 'w') === (playerColor === 'white')

  let label = isPlayerTurn ? 'Your turn' : 'Engine thinking…'
  let mod = isPlayerTurn ? styles.yourTurn : styles.thinking

  if (isCheck) {
    label = '⚠ Check!'
    mod = styles.check
  }

  return (
    <div className={styles.bar}>
      <span className={styles.diff}>{difficulty}</span>
      <span className={`${styles.status} ${mod}`}>{label}</span>
    </div>
  )
}

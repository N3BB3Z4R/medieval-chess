// import './BoardClock.css'
// import { useEffect, useState } from "react";

// const BoardClock = (active: boolean) => {
//   const matchTime = [4, 59]
//   const [timeSecondsCounter, setTimeSecondsCounter] = useState(matchTime[1])
//   const [timeMinutesCounter, setTimeMinutesCounter] = useState(matchTime[0])

//   useEffect(() => {
//     if (timeSecondsCounter === 0 && timeMinutesCounter === 0) console.log('time is over')
//     if (timeSecondsCounter % 60 === 0) {
//       setTimeMinutesCounter(timeMinutesCounter - 1)
//       setTimeSecondsCounter(59)
//     }
//     setTimeout(() => {
//       setTimeSecondsCounter(timeSecondsCounter - 1)
//     }, 1000);
//   }, [timeSecondsCounter])

//   return (
//     <>
//       <div className="board-clock">{timeMinutesCounter}:{timeSecondsCounter < 10 ? '0' + timeSecondsCounter : timeSecondsCounter}</div>
//     </>
//   )
// }
// export default BoardClock
import './BoardClock.css'
import { useEffect, useState } from "react";

const BoardClock = ({ active }: { active: boolean }) => {
  const matchTime = [4, 59]
  const [timeSecondsCounter, setTimeSecondsCounter] = useState(matchTime[1])
  const [timeMinutesCounter, setTimeMinutesCounter] = useState(matchTime[0])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (active) {
      timer = setTimeout(() => {
        if (timeSecondsCounter === 0 && timeMinutesCounter === 0) {
          console.log('time is over')
        } else {
          if (timeSecondsCounter === 0) {
            setTimeMinutesCounter(timeMinutesCounter - 1)
            setTimeSecondsCounter(59)
          } else {
            setTimeSecondsCounter(timeSecondsCounter - 1)
          }
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active, timeSecondsCounter, timeMinutesCounter]);

  return (
    <>
      <div className="board-clock">
        {timeMinutesCounter}:{timeSecondsCounter < 10 ? '0' + timeSecondsCounter : timeSecondsCounter}
      </div>
    </>
  )
}

export default BoardClock


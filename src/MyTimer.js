import { React, useEffect } from "react";
import Timer from 'react-compound-timer'

function MyTimer(props) {
    return (
        <Timer
            startImmediately={false}
            timeToUpdate={1}
        >
            {({ start, resume, pause, stop, reset, timerState }) => {
                if(timerState !== 'PLAYING' && props.timerState === 'start') {
                    start()
                    timerState = 'PLAYING'
                }
                if(timerState !== 'STOPPED' && props.timerState === 'stop') {
                    stop()
                    timerState = 'STOPPED'
                }
                if(props.timerState === 'reset')
                    reset()
                return (
                <div>
                    <Timer.Minutes formatValue={value => `${(value < 10 ? `0${value}` : value)}`}/>:
                    <Timer.Seconds formatValue={value => `${(value < 10 ? `0${value}` : value)}`}/>:
                    <Timer.Milliseconds formatValue={value => `${(value < 10 ? `00${value}` : (value < 100 ? `0${value}` : value))}`}/>
                    {/* <br />
                    <div style={{fontSize: '15px', color: 'grey'}}>{`min. sec. mil.`}</div> */}
                    {/* <br />
                    <button onClick={start}>Start</button>
                    <button onClick={stop}>Stop</button>
                    <button onClick={reset}>Reset</button>
                    <div>{timerState}</div> */}
                </div>
            )}}
        </Timer>
    )
}

export default MyTimer;

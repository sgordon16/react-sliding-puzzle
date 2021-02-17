import { React, useEffect, useRef } from "react";
import Timer from 'react-compound-timer'

const MyTimer = (props) => {
    const startTimeFunc = useRef()

    const start = () => startTimeFunc.current.start()

    const stop = () => startTimeFunc.current.stop()

    const reset = () => startTimeFunc.current.reset()
    
    if(props.timerState === 'start')
        start()
    if(props.timerState === 'stop')
        stop()
    if(props.timerState === 'reset')
        reset()

    return (
        <Timer
            startImmediately={false}
            timeToUpdate={500}
        >
            {(control) => {
                startTimeFunc.current = control
                return (
                <div>
                    <Timer.Minutes formatValue={value => `${(value < 10 ? `0${value}` : value)}`}/>:
                    <Timer.Seconds formatValue={value => `${(value < 10 ? `0${value}` : value)}`}/>
                    {/* <Timer.Milliseconds formatValue={value => `${(value < 10 ? `00${value}` : (value < 100 ? `0${value}` : value))}`}/> */}
                    {/* <br />
                    <div style={{fontSize: '15px', color: 'grey'}}>{`min. sec. mil.`}</div> */}
                    <br />
                    <button onClick={start}>Start</button>
                    <button onClick={stop}>Stop</button>
                </div>
            )}}
        </Timer>
    )
}

export default MyTimer;

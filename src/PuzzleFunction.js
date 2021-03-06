import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import MyTimer from './MyTimer';
import Tiles from './Tiles';
import Typist from 'react-typist';
import worker from 'workerize-loader!./worker'; // eslint-disable-line import/no-webpack-loader-syntax
import FileUpload from './FileUpload';
const { Heap } = require('heap-js');

const robotImage = "http://d1h92xqhwenkwx.cloudfront.net/robot.png"
const image2 = "http://d1h92xqhwenkwx.cloudfront.net/cat.jpg"
const image3 = "http://d1h92xqhwenkwx.cloudfront.net/lion.jpg"
const image4 = "http://d1h92xqhwenkwx.cloudfront.net/parrot.jpg"
const image5 = "http://d1h92xqhwenkwx.cloudfront.net/sunflower.jpg"
const image6 = "http://d1h92xqhwenkwx.cloudfront.net/penguins.jpg"


//import WebWorker from './WebWorker'
//const { performance } = require('perf_hooks');
//import Worker from './file.worker.js';
const maxDistances = [20, 56, 108]
const defaultSize = 3

const thumbnailStyle = {
  border: '1px solid #ddd', /* Gray border */
  borderRadius: '4px',  /* Rounded border */
  padding: '2px',
  margin: '5px', /* Some padding */
  width: '40px', /* Set a small width */
  height: '40px'
}


const buttonStyle = {
  display: 'block',
  margin: '16px auto',
  padding: '8px 16px'
}

const container = {
    //display: 'flex',
    height: '90%', /* Full-height: remove this if you want "auto" height */
    width: '200px', /* Set the width of the sidebar */
    position: 'fixed', /* Fixed Sidebar (stay in place on scroll) */
    top: 20, /* Stay at the top */
    //left: 10,
    backgroundColor: '#282c34',
    overflowX: 'hidden', /* Disable horizontal scroll */
    padding: '15px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)', 
    borderStyle: 'solid',
    borderWidth: '1px',  
    borderColor: 'black', 
}

const statusStyle = {
  position: 'fixed',
  top: 50,
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)', 
  borderStyle: 'solid',
  borderWidth: '1px', 
  borderRadius: '10px', 
  borderColor: 'black', 
  padding: '10px',
  backgroundColor: '#282c34'
}

const robotSayings = ['Hello, I am here to help you solve your sliding puzzles👨‍💻', `I'm thinking🤔💭...`, `Hmmm... I think this one is too hard for me😪`, 'I can solve this puzzle in']

function getManhattanDist(puzzleArray, rows, cols) {
    let manhattanDist = 0
    manhattanDist = puzzleArray.reduce((acc, curr) => {
        const currPos = getMatrixPosition(puzzleArray.indexOf(curr), rows, cols)
        const destPos = getMatrixPosition(curr, rows, cols)
        return acc + Math.abs(currPos.row - destPos.row) + Math.abs(currPos.col - destPos.col);
    }, 0)
    return manhattanDist;
}


// Checks if the puzzle can be solved.
//
// Examples:
//   isSolvable([3, 7, 6, 0, 5, 1, 2, 4, 8], 3, 3) // => false
//   isSolvable([6, 4, 5, 0, 1, 2, 3, 7, 8], 3, 3) // => true
function isSolvable (puzzleArray, rows, cols) {
  let product = 1
  for (let i = 1, l = rows * cols - 1; i <= l; i++) {
    for (let j = i + 1, m = l + 1; j <= m; j++) {
      product *= (puzzleArray[i - 1] - puzzleArray[j - 1]) / (i - j)
    }
  }
  return Math.round(product) === 1
}

// Checks if the puzzle is solved.
function isSolved (puzzleArray) {
  for (let i = 0, l = puzzleArray.length; i < l; i++) {
    if (puzzleArray[i] !== i) {
      return false
    }
  }
  return true
}


// Get the row/col pair from a linear index.
function getMatrixPosition (index, rows, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function shuffle (numbers, hole, rows, cols) {
  // do {
  //       for(let i = 0; i < numbers.length; i++) {
  //         let rand = getRandomInt(numbers.length)
  //         [numbers[i], numbers[rand]] = [numbers[rand], numbers[i]]
  //       }
  //     } while (isSolved(numbers) || !isSolvable(numbers, rows, cols))
  //     return numbers
  do {
    numbers = _.shuffle(_.without(numbers, hole)).concat(hole)
  } while (isSolved(numbers) || !isSolvable(numbers, rows, cols))
  return numbers
}

function shuffleManhattanDistance (puzzleArray, hole, rows, cols, condition) {
  let currDistance = 0
  do {
    puzzleArray = shuffle (puzzleArray, hole, rows, cols)
    currDistance = getManhattanDist(puzzleArray, rows, cols)
  }
  while (!condition(currDistance))
  return puzzleArray
}

function canMove (src, dest, rows, cols) {
  if(dest > (rows * cols) -1 || dest < 0) return false
  const {row: srcRow, col: srcCol} = getMatrixPosition(src, rows, cols)
  const {row: destRow, col: destCol} = getMatrixPosition(dest, rows, cols)
  return (Math.abs(srcRow - destRow) + Math.abs(srcCol - destCol) === 1)
}

function swap (puzzleArray, src, dest) {
  puzzleArray = _.clone(puzzleArray);
  [puzzleArray[src], puzzleArray[dest]] = [puzzleArray[dest], puzzleArray[src]]
  return puzzleArray
}

function arrayEquals (a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


const Puzzle = (props) =>  {

  const images = [image2, image3, image4, image5, image6]
  let randImage = images[Math.floor(Math.random() * 5)];  
  const [puzzleArray, setPuzzleArray] = useState(_.range(0, defaultSize * defaultSize));
  const [moveCount, setMoveCount] = useState(0);
  const [rows, setRows] = useState(defaultSize);
  const [cols, setCols] = useState(defaultSize);
  const [hole, setHole] = useState((defaultSize * defaultSize) -1);
  const [level, setLevel] = useState(1);
  const [bgImage, setBgImage] = useState(randImage);
  const [solveMoves, setSolveMoves] = useState(undefined);
  const [animating, setAnimating] = useState(false)
  const [timerState, setTimerState] = useState('')
  const [robotMessage, setRobotMessage] = useState(robotSayings[0])
  const [newPuzzle, setNewPuzzle] = useState(false)

  let workerInstance = new worker();

  useEffect(() => {
    if(animating && solveMoves && solveMoves[moveCount] !== undefined && !isSolved(puzzleArray)){
      setTimeout(() => {
        handleTileClick(solveMoves[moveCount].indexOf(hole))
      }, 350)
    }
    else 
      setAnimating(false)
    if(isSolved(puzzleArray)) {
      setTimerState('stop')
    }
    if(newPuzzle && !isSolved(puzzleArray) && !animating) {
      if(rows == 5) 
        setRobotMessage(robotSayings[2])
      else
        callWebWorker(puzzleArray, rows, cols, hole)
    }
  }, [puzzleArray, animating]);

  const callWebWorker = (puzzleArray, rows, cols, hole) => {
    //workerInstance.terminate()
    if(workerInstance === undefined)
      workerInstance = new worker()
    else {
      workerInstance.terminate()
      workerInstance = undefined
      workerInstance = new worker()
    }
    setRobotMessage(robotSayings[1])
    workerInstance.postMessage({puzzleArray, rows, cols, hole});
    workerInstance.onmessage = function(e) {
      if(e.data === 'timedOut') {
        setRobotMessage(robotSayings[2])
        workerInstance.terminate()
      }
      else if(Array.isArray(e.data)) {
        setSolveMoves(e.data)
        setRobotMessage(robotSayings[3] + ` ${e.data.length -1} moves 💪 Click below to watch me solve it 👇`)
        workerInstance.terminate()
        // workerInstance = undefined
        //setAnimating(true)
      }
      console.log(e.data);
    }
  }

  const handleSolveClick = () => {
    if(solveMoves.length && !isSolved(puzzleArray)) {
      setMoveCount(0)
      setTimerState('reset')
      if(!arrayEquals(solveMoves[0], puzzleArray))
        setPuzzleArray(solveMoves[0])
     
      let clone = _.clone(solveMoves)
      clone.shift()
      setSolveMoves(clone)
      setAnimating(true)
    }
  }

  const handleShuffleClick = () => {
    // if(workerInstance !== undefined) {
    //   console.log('before terminate: ' + workerInstance)
    //   workerInstance.terminate()
    //   console.log('after terminate: ' + workerInstance)
    // }
    workerInstance.terminate()
    setRobotMessage(robotSayings[0])
    let maxDistance = maxDistances[rows -3];
    setNewPuzzle(true)
    setPuzzleArray(shuffleManhattanDistance(puzzleArray, hole, rows, cols, (dist) => {
      if(level == 1)
        return dist < (maxDistance / 2)
      if(level == 2)
        return dist > (maxDistance / 2)
    }))
    setSolveMoves([])
    setMoveCount(0)
    setTimerState('reset')
  }

  const handleClickBoardSize = (e) => {
    if(e.target.value != rows) {
      workerInstance.terminate()
      setRobotMessage(robotSayings[0])
      const size = e.target.value
      setSolveMoves(undefined)
      if(images.includes(bgImage))
        setBgImage(randImage)
      setRows(parseInt(size))
      setCols(parseInt(size))
      setHole((size * size) -1)
      setPuzzleArray(_.range(0, size * size))
    }
  }

  const handleShuffleLevel = (e) => {
    const level = e.target.value
    console.log(level)
    setLevel(level)
    handleShuffleClick();
  }

  const handleTileClick = (index) => {
    if(!isSolved(puzzleArray))
      setTimerState('start')
    setNewPuzzle(false)
    move(index)
  }

  const move = (tileIndex) => {
    const holeIndex = puzzleArray.indexOf(hole)
    if (canMove(tileIndex, holeIndex, rows, cols)) {
      const newArray = swap(puzzleArray, tileIndex, holeIndex)
      setMoveCount(moveCount +1)
      setPuzzleArray(newArray)
    }
  }

  return (
    <>
      <div style={{...container, left: 20}}>
        {/* <h2 style={{textAlign: 'center'}}>{"Mr. Robot"}</h2> */}
        <img style={{margin: '10px'}} src={robotImage} width={100} height={150}/>
        <Typist style={{margin: '10px'}} key={robotMessage}><code>{robotMessage}</code></Typist>
        
        {/* <div>{`I can solve this puzzle in ${time} milliseconds`}</div> */}
        <button className="button btn-bottom wide"
          onClick={handleSolveClick}
        >
          {"Solve"}
        </button>
      </div>
      <div>
      <div style={{...statusStyle, left: '23%'}}>
        <h6>{"Timer"}</h6>
        <MyTimer timerState={timerState}/>
      </div>
      <Tiles {...{puzzleArray, setPuzzleArray, rows, cols, hole, bgImage}} onTileClick={handleTileClick} width={400} height={400}
      />
      <button className="button wide" onClick={handleShuffleClick}>
        {"Shuffle"}
      </button>
      <div style={{...statusStyle, right: '23%'}}><h6>{"Moves"}</h6>{moveCount}</div>
      </div>
      <div style={{...container, right: 20}}>
      <h3 style={{textAlign: 'center'}}>{"Settings"}</h3> 
      <h5>{"Background"}</h5>
      <FileUpload setBgImage={setBgImage}/> 
      {/* <div className="btn-group">
        {images.map((image, index) => (
          <img className="thumbnail" src={image} onClick={(e) => {handleInputBgPic(e)}}></img>
        ))}
      </div> */}
          <h5>{"Board Size"}</h5>
          <div className="btn-group">
            <button className={'option' + (rows == 3 ? ' active' : '')} value="3" onClick={e => handleClickBoardSize(e, "value")}>3x3</button>
            <button className={'option' + (rows == 4 ? ' active' : '')} value="4" onClick={e => handleClickBoardSize(e, "value")}>4x4</button>
            <button className={'option' + (rows == 5 ? ' active' : '')} value="5" onClick={e => handleClickBoardSize(e, "value")}>5x5</button>
          </div>
        <h5>{"Shuffle Level"}</h5>
        <div className="btn-group">
          <button className={'option' + (level == 1 ? ' active' : '')} value="1" onClick={e => handleShuffleLevel(e, "value")}>Easy</button>
          <button className={'option' + (level == 2 ? ' active' : '')} value="2" onClick={e => handleShuffleLevel(e, "value")}>Hard</button>
        </div>
      </div>
    </>
  )
}
export default Puzzle;

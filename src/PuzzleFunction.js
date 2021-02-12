import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import MyTimer from './MyTimer';
import Tiles from './Tiles';
const { Heap } = require('heap-js');
//import WebWorker from './WebWorker'
//const { performance } = require('perf_hooks');

const defaultSize = 4
const images = ['https://i.imgur.com/QdMWFHZ.jpg', 
    'https://i.picsum.photos/id/1015/6000/4000.jpg?hmac=aHjb0fRa1t14DTIEBcoC12c5rAXOSwnVlaA5ujxPQ0I', 
    'https://scx1.b-cdn.net/csz/news/800a/2020/abstractart.jpg']


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
    height: '80%', /* Full-height: remove this if you want "auto" height */
    width: '180px', /* Set the width of the sidebar */
    position: 'fixed', /* Fixed Sidebar (stay in place on scroll) */
    top: 20, /* Stay at the top */
    //left: 10,
    backgroundColor: '#282c34',
    overflowX: 'hidden', /* Disable horizontal scroll */
    padding: '20px',
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

function getMoves(puzzleArray, rows, cols, hole) {
    const holeIndex = puzzleArray.indexOf(hole)
    let moves = []
    if(canMove(holeIndex, holeIndex - 1, rows, cols)) 
        moves.push(swap(puzzleArray, holeIndex, holeIndex - 1))
    if(canMove(holeIndex, holeIndex + 1, rows, cols)) 
        moves.push(swap(puzzleArray, holeIndex, holeIndex + 1))
    if(canMove(holeIndex, holeIndex - rows, rows, cols)) 
        moves.push(swap(puzzleArray, holeIndex, holeIndex - rows))
    if(canMove(holeIndex, holeIndex + rows, rows, cols))  
        moves.push(swap(puzzleArray, holeIndex, holeIndex + rows))                                                                                                                                                                   
    return moves;
}

function getManhattanDist(puzzleArray, rows, cols) {
    let manhattanDist = 0
    manhattanDist = puzzleArray.reduce((acc, curr) => {
        const currPos = getMatrixPosition(puzzleArray.indexOf(curr), rows, cols)
        const destPos = getMatrixPosition(curr, rows, cols)
        return acc + Math.abs(currPos.row - destPos.row) + Math.abs(currPos.col - destPos.col);
    }, 0)
    return manhattanDist;
}

function aStar (puzzleArray, rows, cols, hole) {
    let solution = []
    const AStarComparator = (a, b) => (a.h + a.g) - ((b.h + b.g));
    let priorityQueue = new Heap(AStarComparator);
    let map = new Map()
    priorityQueue.init();
    let node = {
        g: 0,
        h: getManhattanDist(puzzleArray, rows, cols),
        parent: null,
        layout: puzzleArray,
        nextMoves: getMoves(puzzleArray, rows, cols, hole)
    }
    priorityQueue.push(node)
    map.set(node.layout.toString(), node.g)

    while(!isSolved(node.layout)) {
        node.nextMoves.forEach(e => {
            let newNode = {
                g: node.g +1,
                h: getManhattanDist(e, rows, cols),
                parent: node,
                layout: e,
                nextMoves: getMoves(e, rows, cols, hole)
            }
            let str = newNode.layout.toString()
            if(!map.has(str) || map.get(str) > newNode.g) {
                priorityQueue.push(newNode)
                map.set(str, newNode.g)
            }
        })

        node = priorityQueue.poll()
        if(!typeof node === 'object') return
    }
    while(node !== null) {
        solution.unshift(node.layout)
        node = node.parent
    }
    solution.shift()
    return solution;
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

function shuffleManhattanDistance (puzzleArray, hole, rows, cols, distance) {
  console.log(distance)
  let currDistance = 0
  do {
    puzzleArray = shuffle (puzzleArray, hole, rows, cols)
    currDistance = getManhattanDist(puzzleArray, rows, cols)
  }
  while (currDistance > distance + 2 || currDistance < distance -2)
  console.log(currDistance)
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


const Puzzle = (props) =>  {

  const [puzzleArray, setPuzzleArray] = useState(_.range(0, defaultSize * defaultSize));
  const [moveCount, setMoveCount] = useState(0);
  const [rows, setRows] = useState(defaultSize);
  const [cols, setCols] = useState(defaultSize);
  const [hole, setHole] = useState((defaultSize * defaultSize) -1);
  const [level, setLevel] = useState(1);
  const [bgImage, setBgImage] = useState();
  const [solveMoves, setSolveMoves] = useState([]);
  const [animating, setAnimating] = useState(false)
  const [timerState, setTimerState] = useState('')

  useEffect(() => {
    if(animating && solveMoves[moveCount] !== undefined){
      setTimeout(() => {
        handleTileClick(solveMoves[moveCount].indexOf(hole))
      }, 300)
    }
    else 
      setAnimating(false)
    if(isSolved(puzzleArray)) {
      setTimerState('stop')
    }
  }, [solveMoves, puzzleArray]);

  function loadWebWorker(worker) {
    const code = worker.toString();
    const blob = new Blob(['('+code+')()']);
    return new Worker(URL.createObjectURL(blob));
}

  const callWebWorker = (puzzleArray, rows, cols, hole) => {
    if (window.Worker) {
      const myWorker = new Worker("./WebWorker.js");
      //const myWorker = loadWebWorker(WebWorker)
    
      myWorker.postMessage({puzzleArray, rows, cols, hole});
      console.log('Message posted to worker');
    
      myWorker.onmessage = function(e) {
        setSolveMoves(e.data)
        console.log('Message received from worker');
      }
    } else {
      console.log('Your browser doesn\'t support web workers.')
    }
  }

  const handleSolveClick = () => {
    callWebWorker(puzzleArray, rows, cols, hole)
    // const moves = aStar(puzzleArray, rows, cols, hole)
    // setSolveMoves(moves)
    // setAnimating(true)
  }

  const handleShuffleClick = () => {
    setPuzzleArray(shuffleManhattanDistance(puzzleArray, hole, rows, cols, (rows * cols) * level))
    setSolveMoves([])
    setMoveCount(0)
    setTimerState('reset')
  }

  const handleInputBgPic = (e) => {
    setBgImage(e.target.src)
  }

  const handleBoardSize = (e) => {
    const size = e.target.value
    setRows(parseInt(size))
    setCols(parseInt(size))
    setPuzzleArray(_.range(0, size * size))
    setHole((size * size) -1)
  }

  const handleTileClick = (index) => {
    if(!isSolved(puzzleArray))
      setTimerState('start')
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
        <h2 style={{textAlign: 'center'}}>{"Mr. Robot"}</h2>       
        <div><code>{`I can solve this puzzle in ${solveMoves.length} moves`}</code></div>
        {/* <div>{`I can solve this puzzle in ${time} milliseconds`}</div> */}
        <button style={buttonStyle}
          onClick={handleSolveClick}
        >
          {"Solve"}
        </button>
      </div>
      <div style={{...statusStyle, left: '25%'}}>
        <MyTimer timerState={timerState}/>
      </div>
      <Tiles {...{puzzleArray, setPuzzleArray, rows, cols, hole, bgImage}} onTileClick={handleTileClick} width={400} height={400}
      />
      <button style={buttonStyle} onClick={handleShuffleClick}>
        {"Shuffle"}
      </button>
      <div style={{...statusStyle, right: '25%'}}>{`Moves:  ${moveCount}`}</div>
      <div style={{...container, right: 20}}>
      <h2 style={{textAlign: 'center'}}>{"Settings"}</h2>  
        {/* <label for="bg-pic">Choose a picture for the puzzle:</label>
        <input type="file"
          id="bg-pic" name="bg-pic"
          accept="image/png, image/jpeg" onInput={this.handleInputBgPic}>            
        </input> */}
        {images.map((image, index) => (
          <img style={thumbnailStyle} src={image} onClick={(e) => {handleInputBgPic(e)}}></img>
        ))}
        <div>
          <label for="boardSize">Board Size:</label>
          <div>
            <input type="number" id="boardSize" name="boardSize"min="3" max="5" value={rows} onChange={(e) => {handleBoardSize(e)}}></input>
          </div>            
        </div>
        <div>
          <ul style={{listStyle: 'none'}}>
              <li>
                  <input type='radio' value='1' name='radio' id='easy'/>
                  <label for='easy'>Easy</label>
              </li>
              <li>
                  <input type='radio' value='2' name='radio' id='hard'/>
                  <label for='hard'>Hard</label>
              </li>
          </ul>
        </div>
      </div>
    </>
  )
}
export default Puzzle;

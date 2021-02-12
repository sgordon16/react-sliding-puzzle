import React from 'react';
const { Heap } = require('heap-js');

function getMatrixPosition (index, rows, cols) {
    return {
        row: Math.floor(index / cols),
        col: index % cols
    }
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

function isSolved (puzzleArray) {
    for (let i = 0, l = puzzleArray.length; i < l; i++) {
      if (puzzleArray[i] !== i) {
        return false
      }
    }
    return true
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

onmessage = function(e) {
    console.log('Worker: Message received from main script');
    const solution = aStar(e.data.puzzleArray, e.data.rows, e.data.cols, e.data.hole)
    console.log('Worker: Posting message back to main script');
    postMessage(solution);
}
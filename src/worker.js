import React from 'react';
import _ from 'lodash';
const { Heap } = require('heap-js');

const limit = 2000000

export const solvePuzzle = (e) => {
    const getMatrixPosition = (index, rows, cols) => {
        return {
            row: Math.floor(index / cols),
            col: index % cols
        }
    }

    const canMove = (src, dest, rows, cols) => {
        if(dest > (rows * cols) -1 || dest < 0) return false
        const {row: srcRow, col: srcCol} = getMatrixPosition(src, rows, cols)
        const {row: destRow, col: destCol} = getMatrixPosition(dest, rows, cols)
        return (Math.abs(srcRow - destRow) + Math.abs(srcCol - destCol) === 1)
    }
    
    const swap = (puzzleArray, src, dest) => {
        puzzleArray = _.clone(puzzleArray);
        [puzzleArray[src], puzzleArray[dest]] = [puzzleArray[dest], puzzleArray[src]]
        return puzzleArray
    }

    const getMoves = (puzzleArray, rows, cols, hole) => {
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

    const getManhattanDist = (puzzleArray, rows, cols) => {
        let manhattanDist = 0
        manhattanDist = puzzleArray.reduce((acc, curr) => {
            const currPos = getMatrixPosition(puzzleArray.indexOf(curr), rows, cols)
            const destPos = getMatrixPosition(curr, rows, cols)
            return acc + Math.abs(currPos.row - destPos.row) + Math.abs(currPos.col - destPos.col);
        }, 0)
        return manhattanDist;
    }

    const isSolved = (puzzleArray) => {
        for (let i = 0; i < puzzleArray.length; i++) {
            if (puzzleArray[i] !== i) {
                return false
            }
        }
        return true
    }

    const aStar = (puzzleArray, rows, cols, hole) => {
        let counter = 0
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
            counter++
            if(counter > limit)
                return 'timedOut'
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
        //solution.shift()
        return solution;
    }
    const solution = aStar(e.data.puzzleArray, e.data.rows, e.data.cols, e.data.hole)
    return solution;
}

onmessage = (e) => {
    postMessage(solvePuzzle(e))
}

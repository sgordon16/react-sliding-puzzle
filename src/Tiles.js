import { React } from "react";
import Tile from './Tile'

const tilesStyle = {
    listStyle: 'none',
    margin: '0 auto',
    padding: 2,
    position: 'relative'
}

const Tiles = (props) => {
    const {width, height, cols, rows, puzzleArray, bgImage} = props
    const pieceWidth = Math.round(width / cols)
    const pieceHeight = Math.round(height / rows)
    const style = {
      ...tilesStyle,
      width,
      height,
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)', 
      borderStyle: 'solid',
      borderWidth: '1px',  
      borderColor: 'black', 
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    }
    
    return (
        <ul style={style}>
          {puzzleArray.map((number, index) => (
            <Tile {...props} index={index} number={number} key={number}
              width={pieceWidth} height={pieceHeight} image={bgImage}
              onClick={props.onTileClick}
            />
          ))}
        </ul>
    )
}
export default Tiles
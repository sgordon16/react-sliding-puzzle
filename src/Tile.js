import { React } from "react";
import { Motion, spring } from 'react-motion';

const tileStyle = {
    backgroundColor: '#68d930',
    //backgroundImage: `url(${image})`,
    //backgroundImage: "url('https://i.imgur.com/QdMWFHZ.jpg')",
    boxShadow: 'inset 0 0 2px 0 black, inset 0 0 5px 5px rgba(0, 0, 0, 0.2)', 
    boxSizing: 'border-box',
    display: 'block',
    padding: 6,
    position: 'absolute',
}

const holeStyle = {
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
    // backgroundColor: 'rgba(0, 0, 0, 0.6)',
    // boxShadow: 'inset 0 0 15px 15px rgba(0, 0, 0, 0.2), inset 0 0 25px 25px rgba(0, 0, 0, 0.3), inset 0 0 50px 50px rgba(0, 0, 0, 0.5)', 
    boxSizing: 'border-box',
    display: 'block',
    // padding: 6,
    position: 'absolute',
    zIndex: -1
}

function getMatrixPosition (index, rows, cols) {
    return {
        row: Math.floor(index / cols),
        col: index % cols
    }
}

function getVisualPosition ({row, col}, width, height) {
    return {
      x: col * width,
      y: row * height
    }
}

const Tile = (props) => {

    const handleClick = () => {
      const {index} = props
      props.onClick(index)
    }
    
    const {hole, number, index, rows, cols, width, height, image} = props
    const imgMatrixPos = getMatrixPosition(number, rows, cols)
    const imgVisualPos = getVisualPosition(imgMatrixPos, width, height)
    const matrixPos = getMatrixPosition(index, rows, cols)
    const visualPos = getVisualPosition(matrixPos, width, height)
    const motionStyle = {
        translateX: spring(visualPos.x),
        translateY: spring(visualPos.y)   //{stiffness: 120, damping: 17}
    }
    const style = {
        ...(number === hole ? holeStyle : tileStyle),
        width,
        height,     
        backgroundImage: `url(${image})`,
        backgroundSize: `${width * cols}px ${height * rows}px`,
        backgroundPosition: `-${imgVisualPos.x}px -${imgVisualPos.y}px`,
    }
      
  
    return (
        <Motion style={motionStyle}>
        {({translateX, translateY}) => (
            <li style={{...style, transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}
            onClick={handleClick}
            >
            {number === hole ? '' : number + 1}
            </li>
        )}
        </Motion>
    )
  }

  export default Tile
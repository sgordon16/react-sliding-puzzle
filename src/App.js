import './App.css';
import Puzzle from './PuzzleFunction'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Puzzle size={4} level={3}/>
      </header>
    </div>
  );
}

export default App;

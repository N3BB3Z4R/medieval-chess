import './App.css';
import './styles/main.css';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import BoardCounter from './components/BoardCounter/BoardCounter';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div id="app">
        <header>
          <h1>MESS - Medieval Chess</h1>
        </header>
        <BoardCounter />
        <Messboard />
        <Footer />
      </div>
    </GameProvider>
  );
}

export default App;

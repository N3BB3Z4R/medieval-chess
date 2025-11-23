import './App.css';
import './styles/main.css';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import BoardCounter from './components/BoardCounter/BoardCounter';
import TurnIndicator from './components/TurnIndicator/TurnIndicator';
import { GameProvider, useGame } from './context/GameContext';

function AppContent() {
  const { gameState } = useGame();
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();

  return (
    <div id="app">
      <header>
        <h1>MESS - Medieval Chess</h1>
      </header>
      <TurnIndicator currentTurn={currentTurn} gameStatus={gameStatus} />
      <BoardCounter />
      <Messboard />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;

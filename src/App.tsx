import './App.css';
import './styles/main.css';
import { useState } from 'react';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import BoardCounter from './components/BoardCounter/BoardCounter';
import TurnIndicator from './components/TurnIndicator/TurnIndicator';
import GameSetupModal from './components/GameSetupModal/GameSetupModal';
import { GameProvider, useGame } from './context/GameContext';
import { GameConfig } from './domain/game/GameConfig';

function AppContent() {
  const { gameState, dispatch } = useGame();
  const [showSetup, setShowSetup] = useState(true); // Show setup modal on start
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();

  const handleStartNewGame = (config: GameConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    dispatch({ type: 'RESET_GAME' });
    setShowSetup(false);
  };

  return (
    <div id="app">
      <header>
        <h1>MESS - Medieval Chess</h1>
        <button 
          className="new-game-button"
          onClick={() => setShowSetup(true)}
        >
          Nueva Partida
        </button>
      </header>
      <TurnIndicator currentTurn={currentTurn} gameStatus={gameStatus} />
      <BoardCounter />
      <Messboard />
      <Footer />
      
      {showSetup && (
        <GameSetupModal
          onStartGame={handleStartNewGame}
          onClose={() => setShowSetup(false)}
        />
      )}
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

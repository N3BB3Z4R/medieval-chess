import './App.css';
import './styles/main.css';
import { useState } from 'react';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import BoardCounter from './components/BoardCounter/BoardCounter';
import TurnIndicator from './components/TurnIndicator/TurnIndicator';
import GameSetupModal from './components/GameSetupModal/GameSetupModal';
import MoveHistory from './components/MoveHistory/MoveHistory';
import { GameProvider, useGame } from './context/GameContext';
import { GameConfig } from './domain/game/GameConfig';
import { GameStatus } from './domain/core/types';

function AppContent() {
  const { gameState, dispatch } = useGame();
  const [showSetup, setShowSetup] = useState(true); // Show setup modal on start
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();
  const moveHistory = gameState.getMoveHistory();

  const handleStartNewGame = (config: GameConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    dispatch({ type: 'RESET_GAME' });
    setShowSetup(false);
  };

  const handleSurrender = () => {
    if (window.confirm('¿Estás seguro de que quieres rendirte?')) {
      // Current player loses, opponent wins
      const winnerStatus = currentTurn === 'OUR' 
        ? GameStatus.WINNER_OPPONENT 
        : GameStatus.WINNER_OUR;
      
      dispatch({ 
        type: 'SET_STATUS', 
        payload: { status: winnerStatus }
      });
    }
  };

  const isGameActive = gameStatus === GameStatus.IN_PROGRESS;

  return (
    <div id="app">
      <header>
        <h1>MESS - Medieval Chess</h1>
        <div className="header-actions">
          {isGameActive && (
            <button 
              className="surrender-button"
              onClick={handleSurrender}
              title="Rendirse"
            >
              🏳️ Rendirse
            </button>
          )}
          <button 
            className="new-game-button"
            onClick={() => setShowSetup(true)}
          >
            🎮 Nueva Partida
          </button>
        </div>
      </header>
      <TurnIndicator currentTurn={currentTurn} gameStatus={gameStatus} />
      <div className="game-container">
        <BoardCounter />
        <Messboard />
        <MoveHistory moves={moveHistory} />
      </div>
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

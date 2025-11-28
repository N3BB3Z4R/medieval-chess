import './App.css';
import './styles/main.css';
import React, { useState, useMemo } from 'react';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import GameSidebar from './components/GameSidebar/GameSidebar';
import GameSetupModal from './components/GameSetupModal/GameSetupModal';
import PieceLegend from './components/PieceLegend/PieceLegend';
import { GameProvider, useGame } from './context/GameContext';
import { GameConfig } from './domain/game/GameConfig';
import { GameStatus, PieceType } from './domain/core/types';
import { PlayerProfile, PlayerStats, PlayerStatus } from './components/PlayerCard/PlayerCard';

function AppContent() {
  const { gameState, gameConfig, dispatch } = useGame();
  const [showSetup, setShowSetup] = useState(true);
  const [isMobile, setIsMobile] = useState(globalThis.innerWidth <= 768);
  
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();
  const moveHistory = gameState.getMoveHistory();

  // Monitor window size for responsive layout
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(globalThis.innerWidth <= 768);
    };
    
    globalThis.addEventListener('resize', handleResize);
    return () => globalThis.removeEventListener('resize', handleResize);
  }, []);

  const handleStartNewGame = (config: GameConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    dispatch({ type: 'RESET_GAME' });
    setShowSetup(false);
  };

  const handleSurrender = () => {
    if (globalThis.confirm('¿Estás seguro de que quieres rendirte?')) {
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

  // Prepare player data for GameSidebar
  const playersData = useMemo(() => {
    const activePlayers = gameConfig.players.filter(p => p.isActive);
    
    return activePlayers.map((player) => {
      const isActive = player.team === currentTurn;
      
      // Get player pieces from game state
      const piecesRemaining = 16; // Placeholder - will be calculated from GameState
      
      // Calculate captured pieces (will implement tracking)
      const capturedPieces: Array<{ type: PieceType; image: string }> = [];
      
      // Calculate stats
      const movesPlayed = Math.floor(moveHistory.length / activePlayers.length);
      const score = 0; // Placeholder
      
      // Get last move
      const lastMove = moveHistory.at(-1) ?? null;
      const lastMovedPiece = lastMove ? {
        type: lastMove.pieceType,
        from: `${String.fromCodePoint(97 + lastMove.from.x)}${lastMove.from.y + 1}`,
        to: `${String.fromCodePoint(97 + lastMove.to.x)}${lastMove.to.y + 1}`,
      } : undefined;
      
      // Determine player status
      let state: 'active' | 'waiting' | 'thinking' | 'check' | 'disconnected' = 'waiting';
      let message = 'Esperando';
      
      if (isActive) {
        if (player.isAI) {
          state = 'thinking';
          message = 'Calculando...';
        } else {
          state = 'active';
          message = 'Tu turno';
        }
      }
      
      const status: PlayerStatus = { state, message };
      
      const profile: PlayerProfile = {
        playerPosition: player.position,
        playerName: player.name,
        playerAvatar: player.avatar,
        playerRange: player.isAI ? 'AI Player' : 'Human',
        playerElo: 1200, // Default ELO
        team: player.team,
      };
      
      const stats: PlayerStats = {
        capturedPieces,
        materialAdvantage: 0, // Will calculate based on opponent's captured pieces
        score,
        piecesRemaining,
        movesPlayed,
        lastMovedPiece,
      };
      
      return {
        profile,
        stats,
        status,
        isActive,
        timePerTurn: gameConfig.timePerTurn,
        incrementPerTurn: gameConfig.incrementPerTurn,
        onTimeUp: () => {
          const winnerStatus = player.team === 'OUR' 
            ? GameStatus.WINNER_OPPONENT 
            : GameStatus.WINNER_OUR;
          dispatch({ type: 'SET_STATUS', payload: { status: winnerStatus } });
        },
      };
    });
  }, [gameConfig, currentTurn, moveHistory, dispatch]);

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
      
      <div className={`game-container game-container--${isMobile ? 'mobile' : 'desktop'}`}>
        {isMobile && (
          <GameSidebar 
            players={playersData}
            moveHistory={moveHistory}
            variant="mobile"
          />
        )}
        
        <Messboard />
        
        {!isMobile && (
          <GameSidebar 
            players={playersData}
            moveHistory={moveHistory}
            variant="desktop"
            boardHeight={800}
          />
        )}
      </div>
      
      <Footer />
      
      <PieceLegend />
      
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

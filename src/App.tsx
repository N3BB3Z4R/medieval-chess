import './App.css';
import './styles/main.css';
import React, { useState, useMemo } from 'react';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import GameSidebar from './components/GameSidebar/GameSidebar';
import GameControlPanel from './components/GameControlPanel/GameControlPanel';
import MoveHistory from './components/MoveHistory/MoveHistory';
import GameSetupModal, { GameSetupConfig, AIConfig } from './components/GameSetupModal/GameSetupModal';
import PieceLegend from './components/PieceLegend/PieceLegend';
import { GameProvider, useGame } from './context/GameContext';
import { GameConfig } from './domain/game/GameConfig';
import { GameStatus, PieceType } from './domain/core/types';
import { PlayerProfile, PlayerStats, PlayerStatus } from './components/PlayerCard/PlayerCard';
import { useGameLoop } from './hooks/useGameLoop';
import { Move } from './domain/core/Move';

function AppContent() {
  const { gameState, gameConfig, dispatch } = useGame();
  const [showSetup, setShowSetup] = useState(true);
  const [isMobile, setIsMobile] = useState(globalThis.innerWidth <= 768);
  
  // AI Configuration State
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [aiConfig, setAIConfig] = useState<AIConfig | undefined>(undefined);
  
  // AI Game Loop Integration
  const handleMoveExecuted = React.useCallback((move: Move) => {
    dispatch({ 
      type: 'MAKE_MOVE', 
      payload: { move } 
    });
  }, [dispatch]);
  
  const handleAIThinking = React.useCallback((isThinking: boolean) => {
    // Update UI to show AI is thinking
    console.log('AI thinking:', isThinking);
  }, []);
  
  const { isProcessingAI } = useGameLoop({
    gameState,
    gameMode,
    aiConfig: aiConfig ?? null,
    onMoveExecuted: handleMoveExecuted,
    onAIThinking: handleAIThinking,
  });
  
  // Piece values for material advantage calculation
  const pieceValues: Record<PieceType, number> = {
    [PieceType.FARMER]: 1,
    [PieceType.RAM]: 3,
    [PieceType.TRAP]: 2,
    [PieceType.KNIGHT]: 4,
    [PieceType.TEMPLAR]: 5,
    [PieceType.SCOUT]: 3,
    [PieceType.TREBUCHET]: 4,
    [PieceType.TREASURE]: 0,
    [PieceType.KING]: 0, // King is invaluable
  };
  
  // Helper to map piece type to image filename
  const mapPieceTypeToImage = (type: PieceType): string => {
    const specialMapping: Record<string, string> = {
      'SCOUT': 'hunter',
      'TREBUCHET': 'catapult'
    };
    return specialMapping[type] || type.toLowerCase();
  };
  
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

  const handleStartNewGame = (config: GameSetupConfig) => {
    // Extract AI configuration if present
    if (config.mode && config.aiConfig) {
      setGameMode(config.mode);
      setAIConfig(config.aiConfig);
    } else {
      setGameMode('pvp');
      setAIConfig(undefined);
    }
    
    // Initialize game with base config
    const gameConfig: GameConfig = {
      playerCount: config.players.length as 2 | 3 | 4,
      players: config.players,
      timePerTurn: config.timePerTurn,
      incrementPerTurn: config.incrementPerTurn,
    };
    
    dispatch({ type: 'SET_CONFIG', payload: gameConfig });
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
      const activePieces = gameState.getPiecesForTeam(player.team);
      const piecesRemaining = activePieces.length;
      
      // Get captured pieces (pieces captured BY this player = opponent's lost pieces)
      const allCaptured = gameState.getCapturedPieces();
      const capturedByPlayer = allCaptured.filter(p => p.team !== player.team);
      
      const capturedPieces: Array<{ type: PieceType; image: string }> = capturedByPlayer.map(p => ({
        type: p.type,
        image: `assets/images/${mapPieceTypeToImage(p.type)}_${p.team === 'OUR' ? 'w' : 'b'}.svg`
      }));
      
      // Calculate material advantage (positive = ahead, negative = behind)
      const capturedValue = capturedByPlayer.reduce((sum, p) => sum + pieceValues[p.type], 0);
      const lostPieces = allCaptured.filter(p => p.team === player.team);
      const lostValue = lostPieces.reduce((sum, p) => sum + pieceValues[p.type], 0);
      const materialAdvantage = capturedValue - lostValue;
      
      // Calculate stats
      const movesPlayed = Math.floor(moveHistory.length / activePlayers.length);
      const score = capturedValue; // Score = material captured
      
      // Get last move (ES5-compatible way)
      const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
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
      
      // Check if this player is AI and currently thinking
      const isAIThinking = player.isAI && isActive && isProcessingAI;
      if (isAIThinking) {
        status.state = 'thinking';
        status.message = '🤖 La IA está pensando...';
      }
      
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
        materialAdvantage,
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
  }, [gameConfig, currentTurn, moveHistory, dispatch, gameState, pieceValues, isProcessingAI]);

  // Get player names for board labels (Chess.com style)
  const ourPlayer = playersData.find(p => p.profile.team === 'OUR');
  const opponentPlayer = playersData.find(p => p.profile.team === 'OPPONENT');

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
        {isMobile ? (
          // Mobile Layout: Players (top) → Board (center) → History (bottom)
          <>
            <div className="mobile-players-section">
              <GameSidebar 
                players={playersData}
                moveHistory={moveHistory}
                variant="mobile"
              />
            </div>
            <div className="mobile-board-section">
              <Messboard 
                topPlayerName={opponentPlayer?.profile.playerName}
                bottomPlayerName={ourPlayer?.profile.playerName}
                topPlayerElo={opponentPlayer?.profile.playerElo}
                bottomPlayerElo={ourPlayer?.profile.playerElo}
                isAIThinking={isProcessingAI}
              />
            </div>
          </>
        ) : (
          // Desktop Layout: Left Panel | Board | Right Panel
          <>
            {/* Left Panel: Controls + Players */}
            <div className="desktop-left-panel">
              <GameControlPanel 
                gameStatus={gameStatus}
                onNewGame={() => setShowSetup(true)}
                onSurrender={handleSurrender}
                matchType={`${playersData.length} Jugadores`}
                timeControl={gameConfig.timePerTurn ? `${gameConfig.timePerTurn/60}min` : 'Sin límite'}
              />
              <div className="desktop-players-compact">
                <GameSidebar 
                  players={playersData}
                  moveHistory={[]} 
                  variant="compact"
                />
              </div>
            </div>
            
            {/* Center: Board */}
            <Messboard 
              topPlayerName={opponentPlayer?.profile.playerName}
              bottomPlayerName={ourPlayer?.profile.playerName}
              topPlayerElo={opponentPlayer?.profile.playerElo}
              bottomPlayerElo={ourPlayer?.profile.playerElo}
              isAIThinking={isProcessingAI}
            />
            
            {/* Right Panel: Move History */}
            <div className="desktop-right-panel">
              <MoveHistory moves={moveHistory} />
            </div>
          </>
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

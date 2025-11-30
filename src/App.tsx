import './App.css';
import './styles/main.css';
import React, { useState, useMemo } from 'react';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import GameSidebar from './components/GameSidebar/GameSidebar';
import GameControlPanel from './components/GameControlPanel/GameControlPanel';
import MoveHistory from './components/MoveHistory/MoveHistory';
import GameSetupModal, { GameSetupConfig } from './components/GameSetupModal/GameSetupModal';
import GameOverModal, { PlayerScore } from './components/GameOverModal/GameOverModal';
import PieceLegend from './components/PieceLegend/PieceLegend';
import { GameProvider, useGame } from './context/GameContext';
import { GameConfig } from './domain/game/GameConfig';
import { GameStatus, PieceType } from './domain/core/types';
import { PlayerProfile, PlayerStats, PlayerStatus } from './components/PlayerCard/PlayerCard';
import { CornerPlayerData } from './components/CornerPlayerCard/CornerPlayerCard';
import { useGameLoop } from './hooks/useGameLoop';
import { Move } from './domain/core/Move';

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

function AppContent() {
  const { gameState, gameConfig, dispatch } = useGame();
  const [showSetup, setShowSetup] = useState(true);
  const [isMobile, setIsMobile] = useState(globalThis.innerWidth <= 768);
  
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
    gameConfig,
    onMoveExecuted: handleMoveExecuted,
    onAIThinking: handleAIThinking,
  });
  
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
    console.log('[App] Starting new game with config:', config);
    
    // Initialize game with base config
    const gameConfig: GameConfig = {
      playerCount: config.players.length as 2 | 3 | 4,
      players: config.players,
      timePerTurn: config.timePerTurn,
      incrementPerTurn: config.incrementPerTurn,
    };
    
    console.log('[App] Game config:', gameConfig);
    console.log('[App] Players:', gameConfig.players.map(p => ({ team: p.team, isAI: p.isAI, name: p.name })));
    
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

  // Helper to map piece type to image filename
  const mapPieceTypeToImage = (pieceType: PieceType): string => {
    const specialMapping: Record<string, string> = {
      'SCOUT': 'hunter',
      'TREBUCHET': 'catapult'
    };
    return specialMapping[pieceType] || pieceType.toLowerCase();
  };

  // Helper function to determine which pieces each player captured
  // Uses gameState.getCapturedPieces() which tracks all captured pieces
  const getCapturedPiecesByPlayer = useMemo(() => {
    const capturesByTeam = new Map<string, Array<{ type: PieceType; image: string }>>();
    
    // Initialize empty arrays for each team
    for (const p of gameConfig.players) {
      capturesByTeam.set(p.team, []);
    }
    
    // Get all captured pieces from game state
    const allCaptured = gameState.getCapturedPieces();
    
    // Calculate initial piece counts for each team
    const initialPieceCounts = new Map<string, number>();
    for (const player of gameConfig.players) {
      // In a 4-player game, each team starts with 24 pieces (except treasure/king special cases)
      // For simplicity, we count current + captured to get initial
      const currentPieces = gameState.getPiecesForTeam(player.team).length;
      const lostPieces = allCaptured.filter(p => p.team === player.team).length;
      initialPieceCounts.set(player.team, currentPieces + lostPieces);
    }
    
    // For each team, determine who captured their pieces
    // Logic: if a team lost pieces, the other teams captured them
    // In a 4-player game, we distribute captures based on who has more pieces remaining
    for (const capturedPiece of allCaptured) {
      const victimTeam = capturedPiece.team;
      
      // Find which team(s) could have captured this piece
      // For now, we'll credit all captures to the team with the most pieces remaining
      // This is a simplification - ideally we'd track this in the move history
      const activePlayers = gameConfig.players.filter(p => p.team !== victimTeam && p.isActive);
      
      if (activePlayers.length > 0) {
        // Sort by pieces remaining (descending) and give credit to the leading player
        const sortedByStrength = activePlayers.sort((a, b) => {
          const aPieces = gameState.getPiecesForTeam(a.team).length;
          const bPieces = gameState.getPiecesForTeam(b.team).length;
          return bPieces - aPieces;
        });
        
        const capturerTeam = sortedByStrength[0].team;
        const captures = capturesByTeam.get(capturerTeam) || [];
        captures.push({
          type: capturedPiece.type,
          image: `assets/images/${mapPieceTypeToImage(capturedPiece.type)}_${capturedPiece.team === 'OUR' ? 'w' : 'b'}.svg`
        });
        capturesByTeam.set(capturerTeam, captures);
      }
    }
    
    // Debug: log captures for verification
    console.log('[App] Captured pieces by player:', Array.from(capturesByTeam.entries()).map(([team, pieces]) => ({
      team,
      count: pieces.length,
      totalValue: pieces.reduce((sum, p) => sum + pieceValues[p.type], 0)
    })));
    
    return capturesByTeam;
  }, [gameState, gameConfig.players]);

  // Prepare player data for GameSidebar
  const playersData = useMemo(() => {
    const activePlayers = gameConfig.players.filter(p => p.isActive);
    
    return activePlayers.map((player) => {
      const isActive = player.team === currentTurn;
      
      // Get player pieces from game state
      const activePieces = gameState.getPiecesForTeam(player.team);
      const piecesRemaining = activePieces.length;
      
      // Get captured pieces BY this specific player (from move history analysis)
      const capturedPieces = getCapturedPiecesByPlayer.get(player.team) || [];
      
      // Calculate material advantage (positive = ahead, negative = behind)
      const capturedValue = capturedPieces.reduce((sum, p) => sum + pieceValues[p.type], 0);
      
      // Get pieces lost by this player
      const allCaptured = gameState.getCapturedPieces();
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
  }, [gameConfig, currentTurn, moveHistory, dispatch, gameState, isProcessingAI, getCapturedPiecesByPlayer]);

  // Get player names for board labels (Chess.com style)
  const ourPlayer = playersData.find(p => p.profile.team === 'OUR');
  const opponentPlayer = playersData.find(p => p.profile.team === 'OPPONENT');

  // Prepare corner player data for board
  const cornerPlayersData = useMemo<CornerPlayerData[]>(() => {
    // Calculate rankings based on score
    const rankedPlayers = [...playersData].sort((a, b) => b.stats.score - a.stats.score);
    
    return playersData.map(player => {
      const rank = rankedPlayers.findIndex(p => p.profile.team === player.profile.team) + 1;
      
      return {
        playerName: player.profile.playerName,
        playerAvatar: player.profile.playerAvatar,
        playerPosition: player.profile.playerPosition as 'bottom' | 'top' | 'left' | 'right',
        team: player.profile.team,
        score: player.stats.score,
        materialAdvantage: player.stats.materialAdvantage,
        capturedPieces: player.stats.capturedPieces,
        isActive: player.isActive,
        piecesRemaining: player.stats.piecesRemaining,
        isAI: player.profile.playerRange !== 'Human',
        timePerTurn: player.timePerTurn,
        incrementPerTurn: player.incrementPerTurn,
        onTimeUp: player.onTimeUp,
        rank: rank,
        totalPlayers: playersData.length
      };
    });
  }, [playersData]);

  // Determine if we should show corner cards (ONLY for 3-4 players, NOT for 2 players)
  const showCornerCards = gameConfig.playerCount >= 3;

  // Generate detailed match type description
  const matchTypeDescription = useMemo(() => {
    const totalPlayers = playersData.length;
    const aiCount = playersData.filter(p => p.profile.playerRange !== 'Human').length;
    const humanCount = totalPlayers - aiCount;
    
    if (totalPlayers === 2) {
      if (aiCount === 2) return '2 Jugadores (2 IA)';
      if (aiCount === 1) return '2 Jugadores (1 IA, 1 Humano)';
      return '2 Jugadores (2 Humanos)';
    }
    
    if (totalPlayers === 3) {
      return `3 Jugadores (${aiCount} IA, ${humanCount} Humano${humanCount !== 1 ? 's' : ''})`;
    }
    
    if (totalPlayers === 4) {
      return `4 Jugadores (${aiCount} IA, ${humanCount} Humano${humanCount !== 1 ? 's' : ''})`;
    }
    
    return `${totalPlayers} Jugadores`;
  }, [playersData]);

  // Prepare leaderboard data for GameOverModal
  const playerScoresForLeaderboard = useMemo<PlayerScore[]>(() => {
    const scores = playersData.map(player => ({
      playerName: player.profile.playerName,
      playerAvatar: player.profile.playerAvatar,
      team: player.profile.team,
      score: player.stats.score,
      capturedPiecesCount: player.stats.capturedPieces.length,
      piecesRemaining: player.stats.piecesRemaining,
      isAI: player.profile.playerRange !== 'Human'
    }));
    
    // Debug: log final scores when game ends
    if (gameStatus !== GameStatus.IN_PROGRESS && gameStatus !== GameStatus.NOT_STARTED) {
      console.log('[App] Final leaderboard:', scores);
    }
    
    return scores;
  }, [playersData, gameStatus]);

  return (
    <div id="app">
      {/* Game Over Modal - shown on top of everything */}
      <GameOverModal 
        gameStatus={gameStatus}
        onRestart={() => {
          dispatch({ type: 'RESET_GAME' });
        }}
        onNewGame={() => setShowSetup(true)}
        playerScores={playerScoresForLeaderboard}
      />

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
                cornerPlayers={showCornerCards ? cornerPlayersData : []}
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
                matchType={matchTypeDescription}
                timeControl={gameConfig.timePerTurn ? `${gameConfig.timePerTurn/60}min` : 'Sin límite'}
              />
              {/* Only show sidebar players if 2 players (for 3-4, use corner cards) */}
              {!showCornerCards && (
                <div className="desktop-players-compact">
                  <GameSidebar 
                    players={playersData}
                    moveHistory={[]} 
                    variant="compact"
                  />
                </div>
              )}
            </div>
            
            {/* Center: Board */}
            <Messboard 
              topPlayerName={opponentPlayer?.profile.playerName}
              bottomPlayerName={ourPlayer?.profile.playerName}
              topPlayerElo={opponentPlayer?.profile.playerElo}
              bottomPlayerElo={ourPlayer?.profile.playerElo}
              isAIThinking={isProcessingAI}
              cornerPlayers={showCornerCards ? cornerPlayersData : []}
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

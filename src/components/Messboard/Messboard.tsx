import React, { useRef, useState, useMemo } from 'react';
import './Messboard.css';
import './messboard-responsive.css';
import Tile from '../Tile/Tile';
import Referee from "../../referee/Referee";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  Piece,
  PieceType,
  TeamType,
  Position,
  samePosition,
} from '../../Constants';
import { Position as PositionClass } from '../../domain/core/Position';
import { screenToBoard, BoardConfig } from '../../domain/core/boardConfig';
import { calculateValidMoves } from '../../domain/core/moveIndicatorHelper';
import { useGame, useResetGame } from '../../context/GameContext';
import { Move } from '../../domain/core/Move';
import GameOverModal from '../GameOverModal/GameOverModal';
import CornerPlayerCard, { CornerPlayerData } from '../CornerPlayerCard/CornerPlayerCard';

interface MessboardProps {
  topPlayerName?: string;
  bottomPlayerName?: string;
  topPlayerElo?: number;
  bottomPlayerElo?: number;
  isAIThinking?: boolean;
  cornerPlayers?: CornerPlayerData[]; // Array of 2-4 players for corner display
}

export default function Messboard({ 
  topPlayerName, 
  bottomPlayerName,
  topPlayerElo,
  bottomPlayerElo,
  isAIThinking = false,
  cornerPlayers = []
}: MessboardProps = {}) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [ghostPiece, setGhostPiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [captureMoves, setCaptureMoves] = useState<Position[]>([]);
  const messboardRef = useRef<HTMLDivElement>(null);
  const referee = useMemo(() => new Referee(), []);
  const { gameState, dispatch, reviewMode, reviewSnapshot, reviewMoveIndex } = useGame();
  const resetGame = useResetGame();
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();
  
  // Helper functions for type conversion
  
  // Map piece type to image filename
  const mapPieceTypeToImage = (pieceType: PieceType): string => {
    // Special cases where domain name differs from asset filename
    const specialMapping: Record<string, string> = {
      'SCOUT': 'hunter',      // hunter_w.svg, hunter_b.svg
      'TREBUCHET': 'catapult'  // catapult_w.svg, catapult_b.svg
    };
    return specialMapping[pieceType] || pieceType.toLowerCase();
  };
  
  // Convert GameState pieces to legacy format for Referee
  // If in review mode, use the snapshot instead of current game state
  const pieces: Piece[] = useMemo(() => {
    const sourcePieces = reviewMode && reviewSnapshot 
      ? reviewSnapshot 
      : gameState.getAllPieces();
      
    return sourcePieces.map(gamePiece => ({
      image: `assets/images/${mapPieceTypeToImage(gamePiece.type)}_${gamePiece.team === TeamType.OUR ? 'w' : 'b'}.svg`,
      position: { x: gamePiece.position.x, y: gamePiece.position.y },
      type: gamePiece.type, // Now both use string enums - no conversion needed
      team: gamePiece.team, // Now both use string enums - no conversion needed
      enPassant: false, // Snapshots don't store enPassant flag
    }));
  }, [gameState, reviewMode, reviewSnapshot]);

  function handleGrabPiece(e: React.MouseEvent) {
    // Disable interaction during review mode
    if (reviewMode) {
      return;
    }
    
    const element = e.target as HTMLElement;
    const messboard = messboardRef.current;
    if (element.classList.contains("mess-piece") && messboard) {
      const boardRect = messboard.getBoundingClientRect();
      const coords = screenToBoard(e.clientX, e.clientY, boardRect);
      
      if (!coords) return;
      
      setGrabPosition({ x: coords.x, y: coords.y });

      // Find the grabbed piece
      const currentPiece = pieces.find((p) => samePosition(p.position, coords));
      
      if (currentPiece) {
        // Validate turn: only allow grabbing pieces of current team
        // Now both use string enums - direct comparison
        if (currentPiece.team !== currentTurn) {
          console.warn(`Not your turn! Current turn: ${currentTurn}, Piece team: ${currentPiece.team}`);
          return; // Cannot grab opponent's piece
        }
        
        // Calculate valid moves for visual indicators
        const { validMoves: validMovesArray, captureMoves: captureMovesArray } = calculateValidMoves(
          currentPiece,
          gameState,
          referee
        );
        
        setValidMoves(validMovesArray);
        setCaptureMoves(captureMovesArray);
      }

      // Create ghost piece (clone of original)
      const ghost = element.cloneNode(true) as HTMLElement;
      ghost.classList.add('mess-piece--ghost');
      ghost.style.position = 'absolute';
      ghost.style.zIndex = '1000';
      ghost.style.opacity = '0.8';
      ghost.style.pointerEvents = 'none';
      
      // Position ghost at cursor (centered)
      // Reuse boardRect already declared above
      const pieceHalfSize = BoardConfig.PIECE_SIZE_PX / 2;
      const relativeX = e.clientX - boardRect.left - pieceHalfSize;
      const relativeY = e.clientY - boardRect.top - pieceHalfSize;
      ghost.style.left = `${relativeX}px`;
      ghost.style.top = `${relativeY}px`;
      
      // Append ghost to messboard
      messboard.appendChild(ghost);
      setGhostPiece(ghost);
      
      // Fade original piece to show it's being dragged
      element.style.opacity = '0.3';
      
      setActivePiece(element);
    }
  }

  function handleMovePiece(e: React.MouseEvent) {
    // Disable interaction during review mode
    if (reviewMode) {
      return;
    }
    
    const messboard = messboardRef.current;
    if (ghostPiece && messboard) {
      const boardRect = messboard.getBoundingClientRect();
      
      // Calculate ghost piece position relative to board
      // Center the ghost on the cursor by subtracting half the piece size
      const pieceHalfSize = BoardConfig.PIECE_SIZE_PX / 2;
      const relativeX = e.clientX - boardRect.left - pieceHalfSize;
      const relativeY = e.clientY - boardRect.top - pieceHalfSize;
      
      // Apply bounds (keep ghost within visible board area with small buffer)
      const minPos = -pieceHalfSize;
      const maxX = boardRect.width - pieceHalfSize;
      const maxY = boardRect.height - pieceHalfSize;
      
      const clampedX = Math.max(minPos, Math.min(maxX, relativeX));
      const clampedY = Math.max(minPos, Math.min(maxY, relativeY));
      
      // Move only the ghost piece
      ghostPiece.style.left = `${clampedX}px`;
      ghostPiece.style.top = `${clampedY}px`;
    }
  }

  function handleDropPiece(e: React.MouseEvent) {
    // Disable interaction during review mode
    if (reviewMode) {
      return;
    }
    
    const messboard = messboardRef.current;
    if (activePiece && messboard) {
      const boardRect = messboard.getBoundingClientRect();
      const coords = screenToBoard(e.clientX, e.clientY, boardRect);
      
      // Clean up ghost piece
      if (ghostPiece) {
        messboard.removeChild(ghostPiece);
        setGhostPiece(null);
      }
      
      // Restore original piece opacity
      activePiece.style.opacity = '';
      
      if (!coords) {
        // Invalid drop position - piece stays in original position
        setActivePiece(null);
        setValidMoves([]);
        setCaptureMoves([]);
        return;
      }
      
      const { x, y } = coords;
      
      // Check if drop position is in forbidden zone
      if (PositionClass.isInForbiddenZone({ x, y })) {
        // Cannot drop in forbidden zone - reset piece
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("left");
        activePiece.style.removeProperty("top");
        activePiece.style.opacity = ''; // Restore opacity
        setActivePiece(null);
        setValidMoves([]);
        setCaptureMoves([]);
        return;
      }

      const currentPiece = pieces.find((p) =>
        samePosition(p.position, grabPosition)
      );

      if (currentPiece) {
        // CRITICAL: Validate turn before processing move
        // No conversion needed - both use string enums now
        if (currentPiece.team !== currentTurn) {
          console.warn('Turn validation failed - resetting piece');
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("left");
          activePiece.style.removeProperty("top");
          activePiece.style.opacity = ''; // Restore opacity
          setActivePiece(null);
          setValidMoves([]);
          setCaptureMoves([]);
          return;
        }

        // CRITICAL: Detect if there's a piece at the destination (capture)
        const capturedPiece = pieces.find((p) => samePosition(p.position, { x, y }));
        const capturedPieceInfo = capturedPiece ? {
          type: capturedPiece.type, // No conversion needed - string enum
          position: new PositionClass(capturedPiece.position.x, capturedPiece.position.y)
        } : undefined;

        // Construct the Move object for validation
        const candidateMove = new Move({
          from: new PositionClass(grabPosition.x, grabPosition.y),
          to: new PositionClass(x, y),
          pieceType: currentPiece.type,
          team: currentPiece.team,
          capturedPiece: capturedPieceInfo
        });

        // Check for En Passant using new method
        const isEnPassantMove = referee.checkEnPassant(candidateMove, gameState);
        
        // Update move with isEnPassant flag if needed
        const moveWithEnPassant = isEnPassantMove 
          ? new Move({ ...candidateMove, isEnPassant: true })
          : candidateMove;

        // Validate using the new Domain Logic (RuleEngine via Referee)
        const validationResult = referee.validateMove(moveWithEnPassant, gameState);

        if (isEnPassantMove) {
          // Dispatch en passant move to GameContext
          // En passant captures the pawn that just moved 2 squares (behind the destination)
          const enPassantCaptureY = currentPiece.team === TeamType.OUR ? y - 1 : y + 1;
          const enPassantCapturedPiece = pieces.find((p) => 
            p.position.x === x && p.position.y === enPassantCaptureY
          );
          
          // Re-create move with correct capture info for En Passant
          const finalMove = new Move({
            ...candidateMove,
            capturedPiece: enPassantCapturedPiece ? {
              type: enPassantCapturedPiece.type,
              position: new PositionClass(enPassantCapturedPiece.position.x, enPassantCapturedPiece.position.y)
            } : undefined
          });
          
          dispatch({ type: 'MAKE_MOVE', payload: { move: finalMove } });
          
        } else if (validationResult.isValid) {
          // Dispatch regular move to GameContext
          dispatch({ type: 'MAKE_MOVE', payload: { move: candidateMove } });
        }
        // Note: No need to reset activePiece position since it never moved
      }
      
      // Clear valid moves indicators and active piece
      setValidMoves([]);
      setCaptureMoves([]);
      setActivePiece(null);
    }
  }

  function generateBoard() {
    const board = [];
    for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
      for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
        const number = j + i + 2;
        const piece = pieces.find((p) => samePosition(p.position, { x: i, y: j }));
        let image = piece ? piece.image : undefined;
        
        // Get piece info from gameState for TRAP invisibility
        const gamePiece = reviewMode && reviewSnapshot
          ? reviewSnapshot.find(p => p.position.x === i && p.position.y === j)
          : gameState.getAllPieces().find(p => p.position.x === i && p.position.y === j);
        
        // Check if this tile is selected
        const isSelected = samePosition(grabPosition, { x: i, y: j });
        
        // Check if this tile is a valid move
        const isValidMove = validMoves.some((pos) => samePosition(pos, { x: i, y: j }));
        
        // Check if this tile is a capture move
        const isCaptureMove = captureMoves.some((pos) => samePosition(pos, { x: i, y: j }));
        
        board.push(
          <Tile 
            key={`${j},${i}`} 
            image={image} 
            number={number}
            x={i}
            y={j}
            isSelected={isSelected}
            isValidMove={isValidMove}
            isCaptureMove={isCaptureMove}
            currentTurn={currentTurn}
            pieceType={gamePiece?.type}
            pieceTeam={gamePiece?.team}
          />
        );
      }
    }
    return board;
  }

  return (
    <>
      <GameOverModal gameStatus={gameStatus} onRestart={resetGame} />
      <div className="messboard-container">
        {/* Top player name (Opponent) - hide if using corner cards */}
        {topPlayerName && cornerPlayers.length === 0 && (
          <div className="messboard-player-label messboard-player-label--top">
            <span className="messboard-player-name">{topPlayerName}</span>
            {topPlayerElo && (
              <span className="messboard-player-elo">⭐ {topPlayerElo}</span>
            )}
          </div>
        )}
        
        <div className="board-decoration">
          {reviewMode && (
            <div className="review-mode-overlay">
              <div className="review-mode-indicator">
                🔍 Revisando jugada #{(reviewMoveIndex ?? 0) + 1}
              </div>
            </div>
          )}
          {isAIThinking && !reviewMode && (
            <div className="ai-thinking-overlay">
              <div className="ai-thinking-indicator">
                <span className="ai-thinking-icon">🤖</span>
                <span className="ai-thinking-text">La IA está pensando</span>
                <span className="ai-thinking-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}
          <div
            onMouseMove={handleMovePiece}
            onMouseDown={handleGrabPiece}
            onMouseUp={handleDropPiece}
            id="messboard"
            ref={messboardRef}
            className={reviewMode ? 'messboard--review-mode' : ''}
          >
            {generateBoard()}
            
            {/* Corner Player Cards - only show if cornerPlayers data is provided */}
            {cornerPlayers.length > 0 && cornerPlayers.map((player) => (
              <CornerPlayerCard 
                key={`${player.team}-${player.playerPosition}`}
                player={player}
              />
            ))}
          </div>
        </div>
        
        {/* Bottom player name (Our team) - hide if using corner cards */}
        {bottomPlayerName && cornerPlayers.length === 0 && (
          <div className="messboard-player-label messboard-player-label--bottom">
            <span className="messboard-player-name">{bottomPlayerName}</span>
            {bottomPlayerElo && (
              <span className="messboard-player-elo">⭐ {bottomPlayerElo}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}



// import React, { useRef, useState } from 'react';
// import './Messboard.css';
// import Tile from '../Tile/Tile';
// import Referee from "../../referee/Referee";
// import {
//   VERTICAL_AXIS,
//   HORIZONTAL_AXIS,
//   GRID_SIZE,
//   Piece,
//   PieceType,
//   TeamType,
//   initialBoardState,
//   Position,
//   samePosition,
// } from '../../Constants';


// // Lanza el tablero
// export default function Messboard() {
//   const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
//   const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
//   const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
//   const messboardRef = useRef<HTMLDivElement>(null);
//   const referee = new Referee();

//   // funcion agarrar piezas
//   function grabPiece(e: React.MouseEvent) {
//     const element = e.target as HTMLElement;
//     const messboard = messboardRef.current;
//     if (element.classList.contains("mess-piece") && messboard) {
//       const grabX = Math.floor((e.clientX - messboard.offsetLeft) / GRID_SIZE);
//       const grabY = Math.abs(Math.ceil((e.clientY - messboard.offsetTop - 800) / GRID_SIZE));
//       setGrabPosition({ x: grabX, y: grabY });

//       const x = e.clientX - GRID_SIZE / 2;
//       const y = e.clientY - GRID_SIZE / 2;
//       element.style.position = "absolute";
//       element.style.left = `${x}px`;
//       element.style.top = `${y}px`;
//       setActivePiece(element);
//     }
//   }

//   // funcion mover pieza junto al cursor
//   function movePiece(e: React.MouseEvent) {
//     const messboard = messboardRef.current;
//     if (activePiece && messboard) {
//       const minX = messboard.offsetLeft - 5; // limite left movimiento pieza
//       const minY = messboard.offsetTop - 5; // limite top movimiento pieza
//       const maxX = messboard.offsetLeft + messboard.clientWidth - 45; // limite right movimiento pieza
//       const maxY = messboard.offsetLeft + messboard.clientHeight + 170; // limite bottom movimiento pieza
//       const x = e.clientX - 25;
//       const y = e.clientY - 25;
//       activePiece.style.position = "absolute"; // posicion de la pieza con respecto al cursor, revisar para poner relative fix de zoom en browser

//       // Limitamos el movimiento de la pieza al tamaño del tablero
//       // si x es mas pequeño que el minimo
//       if (x < minX) {
//         activePiece.style.left = `${minX}px`;
//       }
//       // si x es mas grande que el maximo
//       else if (x > maxX) {
//         activePiece.style.left = `${maxX}px`;
//       }
//       // si x esta dentro del tablero
//       else {
//         activePiece.style.left = `${x}px`;
//       }

//       // lo mismo pero en eje Y vertical
//       if (y < minY) {
//         activePiece.style.top = `${minY}px`;
//       } else if (y > maxY) {
//         activePiece.style.top = `${maxY}px`;
//       } else {
//         activePiece.style.top = `${y}px`;
//       }

//     }
//   }

//   // funcion soltar pieza en casilla
//   function dropPiece(e: React.MouseEvent) {
//     const messboard = messboardRef.current;
//     // Estos math floor convierten cantidades de pixels (50 por casilla) a posiciones
//     if (activePiece && messboard) {
//       // Math.floor convierte pixeles a posicion en enteros
//       const x = Math.floor((e.clientX - messboard.offsetLeft) / GRID_SIZE);
//       // Math.abs nos convierte los negativos invertidos a posicion inversa de enteros para vertical
//       const y = Math.abs(
//         Math.ceil((e.clientY - messboard.offsetTop - 800) / GRID_SIZE)
//       );

//       const currentPiece = pieces.find((p) =>
//         samePosition(p.position, grabPosition)
//         // p.position.x === grabPosition.x && p.position.y === grabPosition.y
//       );

//       // Borrar la pieza que estaba ahi
//       if (currentPiece) {
//         const validMove = referee.isValidMove(
//           grabPosition,
//           { x, y },
//           currentPiece.type,
//           currentPiece.team,
//           pieces
//         );

//         // EnPassant function
//         const isEnPassantMove = referee.isEnPassantMove(
//           grabPosition,
//           { x, y },
//           currentPiece.type,
//           currentPiece.team,
//           pieces
//         );

//         const pawnDirection = currentPiece.team === TeamType.OUR ? 1 : -1;

//         if (isEnPassantMove) {
//           const updatedPieces = pieces.reduce((results, piece) => {
//             if (samePosition(piece.position, grabPosition)) {
//               piece.enPassant = false;
//               piece.position.x = x;
//               piece.position.y = y;
//               results.push(piece);
//             } else if (
//               !samePosition(piece.position, { x, y: y - pawnDirection })
//             ) {
//               if (piece.type === PieceType.FARMER || piece.type === PieceType.KING) {
//                 piece.enPassant = false;
//               }
//               results.push(piece);
//             }

//             return results;
//           }, [] as Piece[]);

//           setPieces(updatedPieces);
//         } else if (validMove) {
//           // ACTUALIZA LA POSICION DE LA PIEZA
//           // Si la pieza es atacada, eliminarla del tablero
//           const updatedPieces = pieces.reduce((results, piece) => {
//             if (samePosition(piece.position, grabPosition)) {
//               // SPECIAL MOVE
//               piece.enPassant =
//                 Math.abs(grabPosition.y - y) === 2 &&
//                 (piece.type === PieceType.FARMER || piece.type === PieceType.KING);

//               piece.position.x = x;
//               piece.position.y = y;
//               results.push(piece);
//             } else if (!(samePosition(piece.position, { x, y }))) {
//               if (piece.type === PieceType.FARMER || piece.type === PieceType.KING) {
//                 piece.enPassant = false;
//               }
//               results.push(piece);
//             }

//             return results;
//           }, [] as Piece[]);

//           setPieces(updatedPieces);
//         } else {
//           // RESETEA LA POSICION DE LA PIEZA
//           activePiece.style.position = 'relative';
//           activePiece.style.removeProperty('top');
//           activePiece.style.removeProperty('left');
//         }
//       }
//       setActivePiece(null);
//     }
//   }

//   let board = [];

//   for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
//     for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
//       const number = j + i + 2;
//       const piece = pieces.find((p) =>
//         samePosition(p.position, { x: i, y: j })
//       );
//       let image = piece ? piece.image : undefined;

//       board.push(<Tile key={`${j},${i}`} image={image} number={number} />);
//     }
//   }

//   // Asignamos las acciones de raton a las funciones
//   return (
//     <div className="board-decoration">
//       <div
//         onMouseMove={(e) => movePiece(e)}
//         onMouseDown={e => grabPiece(e)}
//         onMouseUp={(e) => dropPiece(e)}
//         id="messboard"
//         ref={messboardRef}
//       >
//         {board}
//       </div>
//     </div>
//   );
// }
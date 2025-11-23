import React, { useRef, useState, useMemo } from 'react';
import './Messboard.css';
import Tile from '../Tile/Tile';
import Referee from "../../referee/Referee";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
  Piece,
  PieceType,
  TeamType,
  initialBoardState,
  Position,
  samePosition,
} from '../../Constants';
import { Position as PositionClass } from '../../domain/core/Position';
import { screenToBoard, CoordinateOffsets, BoardConfig } from '../../domain/core/boardConfig';
import { calculateValidMoves } from '../../domain/core/moveIndicatorHelper';
import { useGame, useResetGame } from '../../context/GameContext';
import { PieceType as DomainPieceType, TeamType as DomainTeamType } from '../../domain/core/types';
import { Move } from '../../domain/core/Move';
import GameOverModal from '../GameOverModal/GameOverModal';

export default function Messboard() {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [ghostPiece, setGhostPiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [captureMoves, setCaptureMoves] = useState<Position[]>([]);
  const messboardRef = useRef<HTMLDivElement>(null);
  const referee = useMemo(() => new Referee(), []);
  const { gameState, dispatch } = useGame();
  const resetGame = useResetGame();
  const currentTurn = gameState.getCurrentTurn();
  const gameStatus = gameState.getStatus();
  
  // Helper functions for type conversion (defined before useMemo to avoid hoisting issues)
  
  // Map legacy TeamType to domain TeamType
  const mapTeamType = (legacyTeam: TeamType): DomainTeamType => {
    return legacyTeam === TeamType.OUR ? DomainTeamType.OUR : DomainTeamType.OPPONENT;
  };
  
  // Map legacy PieceType to domain PieceType
  const mapPieceType = (legacyType: PieceType): DomainPieceType => {
    const mapping: Record<number, string> = {
      [PieceType.FARMER]: 'FARMER',
      [PieceType.RAM]: 'RAM',
      [PieceType.TRAP]: 'TRAP',
      [PieceType.KNIGHT]: 'KNIGHT',
      [PieceType.TEMPLAR]: 'TEMPLAR',
      [PieceType.SCOUT]: 'SCOUT',
      [PieceType.TREBUCHET]: 'TREBUCHET',
      [PieceType.TREASURE]: 'TREASURE',
      [PieceType.KING]: 'KING',
    };
    return mapping[legacyType] as DomainPieceType;
  };
  
  // Map domain PieceType back to legacy (for Referee compatibility)
  const mapDomainPieceTypeToLegacy = (domainType: DomainPieceType): PieceType => {
    const mapping: Record<string, PieceType> = {
      'FARMER': PieceType.FARMER,
      'RAM': PieceType.RAM,
      'TRAP': PieceType.TRAP,
      'KNIGHT': PieceType.KNIGHT,
      'TEMPLAR': PieceType.TEMPLAR,
      'SCOUT': PieceType.SCOUT,
      'TREBUCHET': PieceType.TREBUCHET,
      'TREASURE': PieceType.TREASURE,
      'KING': PieceType.KING,
    };
    return mapping[domainType];
  };
  
  // Map piece type to image filename
  const mapPieceTypeToImage = (domainType: DomainPieceType): string => {
    // Special cases where domain name differs from asset filename
    const specialMapping: Record<string, string> = {
      'SCOUT': 'hunter',      // hunter_w.svg, hunter_b.svg
      'TREBUCHET': 'catapult'  // catapult_w.svg, catapult_b.svg
    };
    return specialMapping[domainType] || domainType.toLowerCase();
  };
  
  // Convert GameState pieces to legacy format for Referee
  const pieces: Piece[] = useMemo(() => {
    return gameState.getAllPieces().map(gamePiece => ({
      image: `assets/images/${mapPieceTypeToImage(gamePiece.type)}_${gamePiece.team === DomainTeamType.OUR ? 'w' : 'b'}.svg`,
      position: { x: gamePiece.position.x, y: gamePiece.position.y },
      type: mapDomainPieceTypeToLegacy(gamePiece.type),
      team: gamePiece.team === DomainTeamType.OUR ? TeamType.OUR : TeamType.OPPONENT,
      enPassant: gamePiece.enPassant,
    }));
  }, [gameState]);

  function handleGrabPiece(e: React.MouseEvent) {
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
        // Convert domain TeamType to legacy TeamType for comparison
        const currentTurnLegacy = currentTurn === DomainTeamType.OUR ? TeamType.OUR : TeamType.OPPONENT;
        if (currentPiece.team !== currentTurnLegacy) {
          console.warn(`Not your turn! Current turn: ${currentTurn}, Piece team: ${currentPiece.team}`);
          return; // Cannot grab opponent's piece
        }
        
        // Calculate valid moves for visual indicators
        const { validMoves: validMovesArray, captureMoves: captureMovesArray } = calculateValidMoves(
          currentPiece,
          pieces,
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
        const currentPieceTeam = mapTeamType(currentPiece.team);
        if (currentPieceTeam !== currentTurn) {
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
        
        const validMove = referee.isValidMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        const isEnPassantMove = referee.isEnPassantMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        const pawnDirection = currentPiece.team === TeamType.OUR ? 1 : -1;

        // CRITICAL: Detect if there's a piece at the destination (capture)
        const capturedPiece = pieces.find((p) => samePosition(p.position, { x, y }));
        const capturedPieceInfo = capturedPiece ? {
          type: mapPieceType(capturedPiece.type),
          position: new PositionClass(capturedPiece.position.x, capturedPiece.position.y)
        } : undefined;

        if (isEnPassantMove) {
          // Dispatch en passant move to GameContext
          // En passant captures the pawn that just moved 2 squares (behind the destination)
          const enPassantCaptureY = currentPiece.team === TeamType.OUR ? y - 1 : y + 1;
          const enPassantCapturedPiece = pieces.find((p) => 
            p.position.x === x && p.position.y === enPassantCaptureY
          );
          
          const move = new Move({
            from: new PositionClass(grabPosition.x, grabPosition.y),
            to: new PositionClass(x, y),
            pieceType: mapPieceType(currentPiece.type),
            team: currentPieceTeam,
            isEnPassant: true,
            capturedPiece: enPassantCapturedPiece ? {
              type: mapPieceType(enPassantCapturedPiece.type),
              position: new PositionClass(enPassantCapturedPiece.position.x, enPassantCapturedPiece.position.y)
            } : undefined
          });
          dispatch({ type: 'MAKE_MOVE', payload: { move } });
          
        } else if (validMove) {
          // Dispatch regular move to GameContext (with capture info if applicable)
          const move = new Move({
            from: new PositionClass(grabPosition.x, grabPosition.y),
            to: new PositionClass(x, y),
            pieceType: mapPieceType(currentPiece.type),
            team: currentPieceTeam,
            capturedPiece: capturedPieceInfo
          });
          dispatch({ type: 'MAKE_MOVE', payload: { move } });
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
          />
        );
      }
    }
    return board;
  }

  return (
    <>
      <GameOverModal gameStatus={gameStatus} onRestart={resetGame} />
      <div className="board-decoration">
        <div
          onMouseMove={handleMovePiece}
          onMouseDown={handleGrabPiece}
          onMouseUp={handleDropPiece}
          id="messboard"
          ref={messboardRef}
        >
          {generateBoard()}
        </div>
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
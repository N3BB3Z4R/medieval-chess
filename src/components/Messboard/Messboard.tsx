import React, { useRef, useState } from 'react';
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


// Lanza el tablero
export default function Messboard() {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>({x: -1, y: -1});
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const messboardRef = useRef<HTMLDivElement>(null);
  const referee = new Referee();

  // funcion agarrar piezas
  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const messboard = messboardRef.current;
    if (element.classList.contains("mess-piece") && messboard) {
      const grabX = Math.floor((e.clientX - messboard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(Math.ceil((e.clientY - messboard.offsetTop - 800) / GRID_SIZE));
      setGrabPosition({ x: grabX, y: grabY });

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      setActivePiece(element);
    }
  }

  // funcion mover pieza junto al cursor
  function movePiece(e: React.MouseEvent) {
    const messboard = messboardRef.current; 
    if (activePiece && messboard)  {
      const minX = messboard.offsetLeft - 5; // limite left movimiento pieza
      const minY = messboard.offsetTop - 5; // limite top movimiento pieza
      const maxX = messboard.offsetLeft + messboard.clientWidth -45; // limite right movimiento pieza
      const maxY = messboard.offsetLeft + messboard.clientHeight +170; // limite bottom movimiento pieza
      const x = e.clientX - 25;
      const y = e.clientY - 25;
      activePiece.style.position = "absolute"; // posicion de la pieza con respecto al cursor, revisar para poner relative fix de zoom en browser

      // Limitamos el movimiento de la pieza al tamaño del tablero
      // si x es mas pequeño que el minimo
      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      }
      // si x es mas grande que el maximo
      else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      }
      // si x esta dentro del tablero
      else {
        activePiece.style.left = `${x}px`;
      }

      // lo mismo pero en eje Y vertical
      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      } else {
        activePiece.style.top = `${y}px`;
      }

    }
  }

  // funcion soltar pieza en casilla
  function dropPiece(e: React.MouseEvent) {
    const messboard = messboardRef.current; 
    // Estos math floor convierten cantidades de pixels (50 por casilla) a posiciones
    if (activePiece && messboard) {
      // Math.floor convierte pixeles a posicion en enteros
      const x = Math.floor((e.clientX - messboard.offsetLeft) / GRID_SIZE);
      // Math.abs nos convierte los negativos invertidos a posicion inversa de enteros para vertical
      const y = Math.abs(
        Math.ceil((e.clientY - messboard.offsetTop - 800) / GRID_SIZE)
      );

      const currentPiece = pieces.find((p) => 
        samePosition(p.position, grabPosition)
          // p.position.x === grabPosition.x && p.position.y === grabPosition.y
      );

      // Borrar la pieza que estaba ahi
      if(currentPiece) {
        const validMove = referee.isValidMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        // EnPassant function
        const isEnPassantMove = referee.isEnPassantMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );
        
        const pawnDirection = currentPiece.team === TeamType.OUR ? 1 : -1;

        if (isEnPassantMove) {
          const updatedPieces = pieces.reduce((results, piece) => {
            if (samePosition(piece.position, grabPosition)) {
              piece.enPassant = false;
              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (
              !samePosition(piece.position, { x, y: y - pawnDirection })
            ) {
              if (piece.type === PieceType.FARMER || piece.type === PieceType.KING) {
                piece.enPassant = false;
              }
              results.push(piece);
            }

            return results;
          }, [] as Piece[]);

          setPieces(updatedPieces);
          } else if (validMove) {
          // ACTUALIZA LA POSICION DE LA PIEZA
          // Si la pieza es atacada, eliminarla del tablero
          const updatedPieces = pieces.reduce((results, piece) => {
            if(samePosition(piece.position, grabPosition)) {
              // SPECIAL MOVE
              piece.enPassant =
                Math.abs(grabPosition.y - y) === 2 &&
                (piece.type === PieceType.FARMER || piece.type === PieceType.KING);

              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (!(samePosition(piece.position, { x, y }))) {
              if (piece.type === PieceType.FARMER || piece.type === PieceType.KING) {
                piece.enPassant = false;
              }
              results.push(piece);
            }

            return results;
          }, [] as Piece[]);
        
          setPieces(updatedPieces);
        } else {
          // RESETEA LA POSICION DE LA PIEZA
          activePiece.style.position = 'relative';
          activePiece.style.removeProperty('top');
          activePiece.style.removeProperty('left');
        }
      }     
      setActivePiece(null);
    }
  }

  let board =[];

  for (let j = VERTICAL_AXIS.length-1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) =>
        samePosition(p.position, { x: i, y: j })
      );
      let image = piece ? piece.image : undefined;

      board.push(<Tile key={`${j},${i}`} image={image} number={number} />);
    }
  }

  // Asignamos las acciones de raton a las funciones
  return (
    <div 
      onMouseMove={(e) => movePiece(e)}
      onMouseDown={e => grabPiece(e)}
      onMouseUp={(e) => dropPiece(e)}
      id="messboard"
      ref={messboardRef}
    >
      {board}
    </div>
  );
}
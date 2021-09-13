import React, { useRef, useState } from 'react';
import Tile from '../Tile/Tile';
import './Messboard.css';
import Referee from "../../referee/Referee";

// Tablero 16x16 para 4 jugadores
const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"];

// Definimos las props de elementos Piece
export interface Piece {
  image: string;
  x: number;
  y: number;
  type: PieceType;
  team: TeamType;
}

// definimos los equipos
export enum TeamType {
  OPPONENT,
  OUR,
  // OPPONENT 2
  // OPPONENT 3
}

// definimos el tipo de piezas que hay en el juego
export enum PieceType {
  FARMER,
  RAM,
  TRAP,
  KNIGHT,
  TEMPLAR,
  SCOUT,
  TREBUCHET,
  TREASURE,
  KING,
  OPPONENT
}

const initialBoardState: Piece[] = [];

// Define Piezas y Color de piezas segun player · 2 players
  // Primera fila
  for (let p1 = 0; p1 < 2; p1++) {
    const teamType1 = (p1 === 0) ? TeamType.OPPONENT : TeamType.OUR;
    const type = (teamType1 === TeamType.OPPONENT) ? "b" : "w"; // b = black = topOponent / w = white = bottomYou
    const y = (teamType1 === TeamType.OPPONENT) ? 13 : 2;
    // Campesinos x8
    for (let i = 0; i < 8; i++) {
      initialBoardState.push({ image: `assets/images/farmer_${type}.svg`, x: i+4, y: y, type: PieceType.FARMER, team: teamType1 });
    }
  }
  // Segunda fila
  for (let p2 = 0; p2 < 2; p2++) {
    const teamType2 = (p2 === 0) ? TeamType.OPPONENT : TeamType.OUR;
    const type = (teamType2 === TeamType.OPPONENT) ? "b" : "w"; // b = black = topOponent / w = white = bottomYou
    const y = (teamType2 === TeamType.OPPONENT) ? 14 : 1;
    // Dragon / Ariete x2
    initialBoardState.push({ image: `assets/images/ram_${type}.svg`, x: 4, y: y, type: PieceType.RAM, team: teamType2 });
    initialBoardState.push({ image: `assets/images/ram_${type}.svg`, x: 11, y: y, type: PieceType.RAM, team: teamType2 });
    // Trampa x2
    initialBoardState.push({ image: `assets/images/trap_${type}.svg`, x: 5, y: y, type: PieceType.TRAP, team: teamType2 });
    initialBoardState.push({ image: `assets/images/trap_${type}.svg`, x: 10, y: y, type: PieceType.TRAP, team: teamType2 });
    // Caballero x2
    initialBoardState.push({ image: `assets/images/knight_${type}.svg`, x: 6, y: y, type: PieceType.KNIGHT, team: teamType2 });
    initialBoardState.push({ image: `assets/images/knight_${type}.svg`, x: 9, y: y, type: PieceType.KNIGHT, team: teamType2 });
    // Templario x2
    initialBoardState.push({ image: `assets/images/templar_${type}.svg`, x: 7, y: y, type: PieceType.TEMPLAR, team: teamType2 });
    initialBoardState.push({ image: `assets/images/templar_${type}.svg`, x: 8, y: y, type: PieceType.TEMPLAR, team: teamType2 });
  }
  // Tercera fila
  for (let p3 = 0; p3 < 2; p3++) {
    const teamType3 = (p3 === 0) ? TeamType.OPPONENT : TeamType.OUR;
    const type = (teamType3 === TeamType.OPPONENT) ? "b" : "w"; // b = black = topOponent / w = white = bottomYou
    const y = (teamType3 === TeamType.OPPONENT) ? 15 : 0;
    // Exploradores x4
    initialBoardState.push({ image: `assets/images/hunter_${type}.svg`, x: 5, y: y, type: PieceType.SCOUT, team: teamType3 });
    initialBoardState.push({ image: `assets/images/hunter_${type}.svg`, x: 6, y: y, type: PieceType.SCOUT, team: teamType3 });
    initialBoardState.push({ image: `assets/images/hunter_${type}.svg`, x: 9, y: y, type: PieceType.SCOUT, team: teamType3 });
    initialBoardState.push({ image: `assets/images/hunter_${type}.svg`, x: 10, y: y, type: PieceType.SCOUT, team: teamType3 });
    // Catapulta x2
    initialBoardState.push({ image: `assets/images/catapult_${type}.svg`, x: 4, y: y, type: PieceType.TREBUCHET, team: teamType3 });
    initialBoardState.push({ image: `assets/images/catapult_${type}.svg`, x: 11, y: y, type: PieceType.TREBUCHET, team: teamType3 });
    // Tesoro x1
    initialBoardState.push({ image: `assets/images/treasure_${type}.svg`, x: 8, y: y, type: PieceType.TREASURE, team: teamType3 });
    // Rey x1
    initialBoardState.push({ image: `assets/images/king_${type}.svg`, x: 7, y: y, type: PieceType.KING, team: teamType3 });
  }

// Lanza el tablero
export default function Messboard() {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const messboardRef = useRef<HTMLDivElement>(null);
  const referee = new Referee();

  // funcion agarrar piezas
  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const messboard = messboardRef.current;
    if (element.classList.contains("mess-piece") && messboard) {
      setGridX(Math.floor((e.clientX - messboard.offsetLeft) / 50));
      setGridY(Math.abs(Math.ceil((e.clientY - messboard.offsetTop - 800) / 50))); //Math.abs nos convierte los negativos invertidos a posicion inversa de enteros
      const x = e.clientX - 25;
      const y = e.clientY - 25;
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
      const x = Math.floor((e.clientX - messboard.offsetLeft) / 50);
      // Math.abs nos convierte los negativos invertidos a posicion inversa de enteros para vertical
      const y = Math.abs(
        Math.ceil((e.clientY - messboard.offsetTop - 800) / 50)
      );

      const currentPiece = pieces.find(p => p.x === gridX && p.y === gridY);
      // const attackedPiece = pieces.find(p => p.x === x && p.y === y);

      // Borrar la pieza que estaba ahi
      if(currentPiece) {
        const validMove = referee.isValidMove(
          gridX,
          gridY,
          x,
          y,
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        if(validMove) {
        // ACTUALIZA LA POSICION DE LA PIEZA
        // Si la pieza es atacada, eliminarla del tablero
        const updatedPieces = pieces.reduce((results, piece) => {
          // if(piece.x === currentPiece.x && piece.y === currentPiece.y) {
          if(piece.x === gridX && piece.y === gridY) {
            piece.x = x;
            piece.y = y;
            results.push(piece);
          } else if (!(piece.x === x && piece.y === y)) {
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

      // Actualiza la posicion de la pieza (viejo)
      // setPieces((value) => {
      //   const pieces = value.map((p) => {
      //     if (p.x === gridX && p.y === gridY) {
      //       // Esta pieza puede hacer este movimiento?
      //       const validMove = referee.isValidMove(
      //         gridX,
      //         gridY,
      //         x,
      //         y,
      //         p.type,
      //         p.team,
      //         value
      //       );

      //       if (validMove) {
      //       p.x = x;
      //       p.y = y;
      //       } else {
      //         activePiece.style.position = 'relative';
      //         activePiece.style.removeProperty('top');
      //         activePiece.style.removeProperty('left');
      //       }
      //     }
      //     return p;
      //   });
      //   return pieces;
      // });
      setActivePiece(null);
    }
  }

  let board =[];

  for (let j = verticalAxis.length-1; j >= 0; j--) {
    for (let i = 0; i < horizontalAxis.length; i++) {
      const number = j + i + 2;
      let image = undefined;

      pieces.forEach((p) => {
        if (p.x === i && p.y === j) {
          image = p.image;
        }
      });

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
    </div>);
}
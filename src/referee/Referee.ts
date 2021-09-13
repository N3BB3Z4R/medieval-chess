import { PieceType, TeamType, Piece } from "../components/Messboard/Messboard";

export default class Referee {
  // funcion de chequear si tile esta ocupada, y ponernos si la pieza que hay es un enemigo
  tileIsOccupied(
    x: number,
    y: number,
    boardState: Piece[]
  ): boolean {
    // console.log("Check if tile has piece...")
    const piece = boardState.find(
      p => p.x === x && p.y === y
    );

    // modo original simple usando tileIsOccupiedByOpponent que no chuta
    // if(piece) {
    //   return true;
    // } else {
    //   return false;
    // }

    // ATTACK LOGIC chapuzaca saltandonos tileIsOccupiedByOpponent function
    if (piece) {      
      if (piece.team === TeamType.OPPONENT) {
        console.log("Hay un enemigo", piece.team); // hay enemigo, permitimos mover nuestra ficha.
        return false; // deja ponerse ahi
      } else if (piece.team === TeamType.OUR) {
        console.log("Hay una pieza nuestra", piece.team); // hay enemigo, permitimos mover nuestra ficha.
        return true; // no deja ponerse ahi
      } else {
      return true; // no deja ponerse ahi
      }
    } else { // si no hay pieza
      return false; // deja ponerse ahi
    }

}

  // Funcion de chequeo de tiles para atacar, para la catapulta
  tileIsOccupiedByOpponent(
    x: number,
    y: number,
    boardState: Piece[],
    team: TeamType
  ): boolean {
    const piece = boardState.find(
      (p) => p.x === x && p.y === y && p.team !== team
    );

    if(piece) {
    return true;
    } else {
      return false;
    }
  }

  isValidMove(
    px: number,
    py: number,
    x: number,
    y: number,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {
    // console.log("Referee is checking the move...");
    // console.log(`Previous location: (${px},${py})`);
    // console.log(`Current location: (${x},${y})`);
    // console.log(`Piece Type: ${type}`);
    // console.log(`Team: ${team}`);


    // Hacer una funcion que detecte direccion y casillas desplazadas
    // x, y, px, py, 1 o 2 casillas, -x es izquierda +x es derecha -y es abajo y +y es arriba
    // function pieceDirection(x, y, px, py, direction) {
      
    //   switch(x - px || y - py) {
    //     case  1 : !this.tileIsOccupied(x+1, y, boardState) && !this.tileIsOccupied(x, y, boardState) ; break;
    //     case  2 : ; break;
    //     case  3 : 
    //     case -1 : ; break;
    //     case -2 : ; break;
    //   }
    //   console.log(direction);
    // }

    // reglas de movimiento para Campesino
    if (type === PieceType.FARMER) {

      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( x === px || y === py) {
          if (
            ((x === px) && y - py === 1) ||
            ((y === py) && x - px === 1) ||
            ((x === px) && y - py === -1) ||
            ((y === py) && x - px === -1)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {
        if (this.tileIsOccupiedByOpponent(x, y, boardState, team)) {
          console.log("Strike The Enemy!");
          return true;
        }
      }
    }



    // reglas de movimiento para Templario
    if (type === PieceType.TEMPLAR) {
        
      // Refactorizado Nuevo intento de reglas detectando piezas en medio
      // MOVEMENT LOGIC
      if (y === py) { // Si y es igual a py entonces ha movido x
        if (x - px === -2) {  // x menos px da -2 entonces ha ido a la izquieda 2 casillas
          if (!this.tileIsOccupied(x+1, y, boardState) && !this.tileIsOccupied(x, y, boardState)) { // Checkea nueva posicion y derecha 
            console.log("Valid Move!")
            return true;
          }
        } else if (x - px === 2) { // si no ha ido a derecha entonces ha ido izquierda
          if (!this.tileIsOccupied(x-1, y, boardState) && !this.tileIsOccupied(x, y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else if (x - px === -1 || x - px === 1) { // x menos px da negativo o positivo en 1 hemos ido a la izquierda o la derecha 1 casilla
          if (!this.tileIsOccupied(x, y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else {
          return false;
        }
      } else if (x === px) { // Si x no es igual a px entonces es y la que se ha movido
        if (y - py === -2) {  // y menos py da negativo en dos entonces ha ido abajo 2 casillas
          if (!this.tileIsOccupied(x, y+1, boardState) && !this.tileIsOccupied(x, y, boardState)) { // Checkea la contigua abajo
            console.log("Valid Move!")
            return true;
          }
        } else if (y - py === 2) { // si no ha ido abajo entonces ha ido arriba 2 casillas
          if (!this.tileIsOccupied(x, y-1, boardState) && !this.tileIsOccupied(x, y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else if (y - py === -1 || y - py === 1) { // y menos py da negativo o positivo en 1 hemos ido abajo o arriba 1 casilla
          if (!this.tileIsOccupied(x, y, boardState)) { // Checkea la casilla destino
            console.log("Valid Move!")
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
      
      // ATTACK LOGIC
      // if (this.tileIsOccupiedByOpponent(x, y, boardState, team)) {
      //   console.log("Strike the Enemy!")
      // }
    }



    // reglas de movimiento para Ariete
    if (type === PieceType.RAM) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Mueve 1 o 2 casillas, si en su camino hay uno o dos enemigos los eliminara.
        if ( x === px || y === py) {
          if (
            ((x === px) && y - py === 1) ||
            ((y === py) && x - px === 1) ||
            ((x === px) && y - py === -1) ||
            ((y === py) && x - px === -1) ||
            ((x === px) && y - py === 2) ||
            ((y === py) && x - px === 2) ||
            ((x === px) && y - py === -2) ||
            ((y === py) && x - px === -2)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {}
    }

    // reglas de movimiento para Caballero
    if (type === PieceType.KNIGHT) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        //  Mueve 3 casillas recto o 2 en diagonal, las fichas no bloquean su movimiento.
        if (
          ((x === px) && y - py === 3) ||
          ((y === py) && x - px === 3) ||
          ((x === px) && y - py === -3) ||
          ((y === py) && x - px === -3) ||
          ((x - px === 2) && y - py === 2) ||
          ((y - py === 2) && x - px === 2) ||
          ((x - px === -2) && y - py === -2) ||
          ((y - py === -2) && x - px === -2) ||
          ((x - px === -2) && y - py === 2) ||
          ((y - py === -2) && x - px === 2) ||
          ((x - px === 2) && y - py === -2) ||
          ((y - py === 2) && x - px === -2)
          ) {
          // Si la casilla esta ocupada no permite mover
          if (!this.tileIsOccupied(x, y, boardState)) {
            console.log("Valid Move!")
            return true;
          }
        }
      } else {}
    }

    // reglas de movimiento para Trampa
    if (type === PieceType.TRAP) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Mueve 1 o 2 casillas en diagonal, es invisible para el oponente, los cazadores y el rey desactivan la trampa, al usarse desaparece.
        if (
          ((x - px === 1) && y - py === 1) ||
          ((y - py === 1) && x - px === 1) ||
          ((x - px === -1) && y - py === -1) ||
          ((y - py === -1) && x - px === -1) ||
          ((x - px === -1) && y - py === 1) ||
          ((y - py === -1) && x - px === 1) ||
          ((x - px === 1) && y - py === -1) ||
          ((y - py === 1) && x - px === -1) ||
          ((x - px === 2) && y - py === 2) ||
          ((y - py === 2) && x - px === 2) ||
          ((x - px === -2) && y - py === -2) ||
          ((y - py === -2) && x - px === -2) ||
          ((x - px === -2) && y - py === 2) ||
          ((y - py === -2) && x - px === 2) ||
          ((x - px === 2) && y - py === -2) ||
          ((y - py === 2) && x - px === -2)
          ) {
          // Si la casilla esta ocupada no permite mover
          if (!this.tileIsOccupied(x, y, boardState)) {
            console.log("Valid Move!")
            return true;
          }
        }
      } else {}
    }

    // reglas de movimiento para Explorador / Cazador / Nobles?
    if (type === PieceType.SCOUT) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( x === px || y === py) {
          if (
            // ((x === px) && y - py === 1) || // Elimino que solo puedan mover 1?
            // ((y === py) && x - px === 1) ||
            // ((x === px) && y - py === -1) ||
            // ((y === py) && x - px === -1) ||
            ((x === px) && y - py === 2) ||
            ((y === py) && x - px === 2) ||
            ((x === px) && y - py === -2) ||
            ((y === py) && x - px === -2) ||
            ((x === px) && y - py === 3) ||
            ((y === py) && x - px === 3) ||
            ((x === px) && y - py === -3) ||
            ((y === py) && x - px === -3) 
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {}
    }

    // reglas de movimiento para Catapulta
    if (type === PieceType.TREBUCHET) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( x === px || y === py) {
          if (
            ((x === px) && y - py === 1) ||
            ((y === py) && x - px === 1) ||
            ((x === px) && y - py === -1) ||
            ((y === py) && x - px === -1) ||
            ((x === px) && y - py === 2) ||
            ((y === py) && x - px === 2) ||
            ((x === px) && y - py === -2) ||
            ((y === py) && x - px === -2)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {}
    }

    // reglas de movimiento para Tesoro
    if (type === PieceType.TREASURE) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( x === px || y === py) {
          if (
            ((x === px) && y - py === 1) ||
            ((y === py) && x - px === 1) ||
            ((x === px) && y - py === -1) ||
            ((y === py) && x - px === -1)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {}
    }

    // reglas de movimiento para Rey
    if (type === PieceType.KING) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( x === px || y === py) {
          if (
            ((x === px) && y - py === 2) ||
            ((y === py) && x - px === 2) ||
            ((x === px) && y - py === -2) ||
            ((y === py) && x - px === -2) ||
            ((x === px) && y - py === 3) ||
            ((y === py) && x - px === 3) ||
            ((x === px) && y - py === -3) ||
            ((y === py) && x - px === -3)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(x, y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {}
    }

    return false;
  }
}
import { PieceType, TeamType, Piece, Position } from "../Constants";

export default class Referee {
  // tileIsEmptyOrOccupiedByOpponent()

  // funcion de chequear si tile esta ocupada, y ponernos si la pieza que hay es un enemigo
  tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
    // console.log("Check if tile has piece...")
    const piece = boardState.find(
      (p) => p.position.x === x && p.position.y === y
    );

    // modo original simple usando tileIsOccupiedByOpponent
    if(piece) {
      return true;
    } else {
      return false;
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
      (p) => p.position.x === x && p.position.y === y && p.team !== team
    );

    // SI ATACAMOS A UNA TRAMPA MORIMOS TAMBIEN
    if (piece?.type === PieceType.TRAP) {
      console.log("el atacante esta muerto"); // cambiar por codigo para eliminar al atacante.
      return true;
    } else {
      if(piece) {
      return true;
      } else {
        return false;
      }
    }
  }

  isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type:PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {
    const farmerDirection = team === TeamType.OUR ? 1 : -1;

    if (
      type === PieceType.FARMER ||
      type === PieceType.KING
    ) {
      if (
        (desiredPosition.x - initialPosition.x === -1 ||
        desiredPosition.x - initialPosition.x === 1) &&
        desiredPosition.y - initialPosition.y === farmerDirection
      ) {
        const piece = boardState.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - farmerDirection &&
            p.enPassant
        );
        if (piece) {
          return true;
        }
      }
    }

    return false;
  }

  isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {

    // reglas de movimiento para Campesino / Samurai
    if (type === PieceType.FARMER) {
      const specialRow = team === TeamType.OUR ? 2 : 13;//2 : 13;
      const farmerDirection = team === TeamType.OUR ? 1 : -1; // hacer 360

      // MOVEMENT LOGIC PAWN REFERENCIA
      if ( // si mueve 2 en vertical en direccion de ataque, desde la specialRow...
        initialPosition.x === desiredPosition.x &&
        initialPosition.y === specialRow &&
        desiredPosition.y - initialPosition.y === 2 * farmerDirection
      ) {
        if ( // Comprobamos si no estan ocupadas las celdas
          !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState) &&
          !this.tileIsOccupied(desiredPosition.x, desiredPosition.y - farmerDirection, boardState)
        ) {
          return true;
        }
      } else if ( // si no mueve dos, mueve una casilla en cualquier direccion
        // (initialPosition.x === desiredPosition.x &&
        // desiredPosition.y - initialPosition.y === farmerDirection) ||
        // (initialPosition.y === desiredPosition.y &&
        // desiredPosition.x - initialPosition.x === farmerDirection)
        ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 1) || // derecha
        ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -1) || // izquierda
        ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 1) || // abajo    
        ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -1) // arriba
      ) {
        console.log("uno de cuatro en cruz");
        if (
          // this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)
          !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)          
        ) {
          return true;                    
        }
      } else if (
      // ATTACK DIAGONAL LOGIC PAWN INTO FARMER
        (desiredPosition.x - initialPosition.x === -1 &&
        desiredPosition.y - initialPosition.y === 1) ||
        (desiredPosition.x - initialPosition.x === -1 &&
        desiredPosition.y - initialPosition.y === -1) ||
        (desiredPosition.x - initialPosition.x === 1 &&
        desiredPosition.y - initialPosition.y === 1) ||
        (desiredPosition.x - initialPosition.x === 1 &&
        desiredPosition.y - initialPosition.y === -1)
      ) {
        //ATTACK DIAGONAL IN THE UPPER OR BOTTOM LEFT & RIGHT CORNER
        console.log("diagonal attack");
        if (
          this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)
        ) {
          return true;
        }
      } 
    }


    // reglas de movimiento para Templario
    else if (type === PieceType.TEMPLAR) {
        
      // Refactorizado Nuevo intento de reglas detectando piezas en medio
      // MOVEMENT LOGIC
      if (desiredPosition.y === initialPosition.y) { // Si y es igual a py entonces ha movido x
        if (desiredPosition.x - initialPosition.x === -2) {  // x menos px da -2 entonces ha ido a la izquieda 2 casillas
          if (!this.tileIsOccupied(desiredPosition.x+1, desiredPosition.y, boardState) && !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea nueva posicion y derecha 
            console.log("Valid Move!")
            return true;
          }
        } else if (desiredPosition.x - initialPosition.x === 2) { // si no ha ido a derecha entonces ha ido izquierda
          if (!this.tileIsOccupied(desiredPosition.x-1, desiredPosition.y, boardState) && !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else if (desiredPosition.x - initialPosition.x === -1 || desiredPosition.x - initialPosition.x === 1) { // x menos px da negativo o positivo en 1 hemos ido a la izquierda o la derecha 1 casilla
          if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else {
          return false;
        }
      } else if (desiredPosition.x === initialPosition.x) { // Si x no es igual a px entonces es y la que se ha movido
        if (desiredPosition.y - initialPosition.y === -2) {  // y menos py da negativo en dos entonces ha ido abajo 2 casillas
          if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y+1, boardState) && !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la contigua abajo
            console.log("Valid Move!")
            return true;
          }
        } else if (desiredPosition.y - initialPosition.y === 2) { // si no ha ido abajo entonces ha ido arriba 2 casillas
          if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y-1, boardState) && !this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la contigua a la derecha
            console.log("Valid Move!")
            return true;
          }
        } else if (desiredPosition.y - initialPosition.y === -1 || desiredPosition.y - initialPosition.y === 1) { // y menos py da negativo o positivo en 1 hemos ido abajo o arriba 1 casilla
          if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
            console.log("Valid Move!")
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }



    // reglas de movimiento para Ariete / RAM
    if (type === PieceType.RAM) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Mueve 1 o 2 casillas, si en su camino hay uno o dos enemigos los eliminara.
        if ( desiredPosition.x === initialPosition.x || desiredPosition.y === initialPosition.y) {
          if (
              // ATTACK FRONTAL LOGIC RAM 1
              (desiredPosition.x - initialPosition.x === -1 &&
              desiredPosition.y - initialPosition.y === 0) ||
              (desiredPosition.x - initialPosition.x === 1 &&
                desiredPosition.y - initialPosition.y === 0) ||
              (desiredPosition.x - initialPosition.x === 0 &&
              desiredPosition.y - initialPosition.y === -1) ||
              (desiredPosition.x - initialPosition.x === 0 &&
              desiredPosition.y - initialPosition.y === 1)
            ) {
              //ATTACK 1
              if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                console.log("Valid Move!")
                return true;
              } else if (this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
                console.log("Valid Move!")
                if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) { // Checkea la casilla destino
                  return true;
                }
              }
            } else if ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 2) { // mueve a la arriba, casilla 1 izquierda
              //ATTACK 2 A
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            } else if ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 2) { // mueve a derecha
              //ATTACK 2 B
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            } else if ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -2) { // mueve a abajo
              //ATTACK 2 C
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            } else if ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -2) { // mueve izquierda
              //ATTACK 2 D
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            }
              
              
              
          //   ) {
          //   // Si la casilla esta ocupada no permite mover
          //     //ATTACK 2
          //     if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
          //       return true;
          //     } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
          //         console.log("Valid Move!")
          //         return true;
          //     }
          // }
        } else {
          return false;
        }
      }
    }

    // Refactor Reglas Caballeros
    if (type === PieceType.KNIGHT) {
      for (let i = -1; i < 2; i += 2) {
        for (let j = -1; j < 2; j += 2) {
          // MOVIMIENTO EN ELE
          if (desiredPosition.y - initialPosition.y === 2 * i) {          
            if(desiredPosition.x - initialPosition.x === 2 * j) {
              console.log("bottom top movement");  
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            }
          }
          // STRAIGHT HORIZONTAL
          if (desiredPosition.y - initialPosition.y === 0) {
            if (desiredPosition.x - initialPosition.x === 3 * j) {
              console.log("horizontal movement");  
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            }
          }
          // STRAIGHT VERTICAL
          if (desiredPosition.x - initialPosition.x === 0) {
            if (desiredPosition.y - initialPosition.y === 3 * j) {
              console.log("vertical movement", j);  
              if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
                return true;
              } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
                  console.log("Valid Move!")
                  return true;
              }
            }
          }
        }
      }
    }

    // reglas de movimiento para Caballero clasica
    // if (type === PieceType.KNIGHT) {
    //   if (team === TeamType.OUR || team === TeamType.OPPONENT) {
    //     //  Mueve 3 casillas recto o 2 en diagonal, las fichas no bloquean su movimiento.
    //     if (
    //       ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 3) ||
    //       ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 3) ||
    //       ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -3) ||
    //       ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -3) ||
    //       ((desiredPosition.x - initialPosition.x === 2) && desiredPosition.y - initialPosition.y === 2) ||
    //       ((desiredPosition.y - initialPosition.y === 2) && desiredPosition.x - initialPosition.x === 2) ||
    //       ((desiredPosition.x - initialPosition.x === -2) && desiredPosition.y - initialPosition.y === -2) ||
    //       ((desiredPosition.y - initialPosition.y === -2) && desiredPosition.x - initialPosition.x === -2) ||
    //       ((desiredPosition.x - initialPosition.x === -2) && desiredPosition.y - initialPosition.y === 2) ||
    //       ((desiredPosition.y - initialPosition.y === -2) && desiredPosition.x - initialPosition.x === 2) ||
    //       ((desiredPosition.x - initialPosition.x === 2) && desiredPosition.y - initialPosition.y === -2) ||
    //       ((desiredPosition.y - initialPosition.y === 2) && desiredPosition.x - initialPosition.x === -2)
    //       ) {
    //       // Si la casilla esta ocupada no permite mover
    //       if (this.tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team)) {
    //         return true;
    //       } else if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) { // Checkea la casilla destino
    //           console.log("Valid Move!")
    //           return true;
    //       }
    //     }
    //   } else {}
    // }

    // reglas de movimiento para Trampa
    if (type === PieceType.TRAP) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Mueve 1 o 2 casillas en diagonal, es invisible para el oponente, los cazadores y el rey desactivan la trampa, al usarse desaparece.
        if (
          ((desiredPosition.x - initialPosition.x === 1) && desiredPosition.y - initialPosition.y === 1) ||
          ((desiredPosition.y - initialPosition.y === 1) && desiredPosition.x - initialPosition.x === 1) ||
          ((desiredPosition.x - initialPosition.x === -1) && desiredPosition.y - initialPosition.y === -1) ||
          ((desiredPosition.y - initialPosition.y === -1) && desiredPosition.x - initialPosition.x === -1) ||
          ((desiredPosition.x - initialPosition.x === -1) && desiredPosition.y - initialPosition.y === 1) ||
          ((desiredPosition.y - initialPosition.y === -1) && desiredPosition.x - initialPosition.x === 1) ||
          ((desiredPosition.x - initialPosition.x === 1) && desiredPosition.y - initialPosition.y === -1) ||
          ((desiredPosition.y - initialPosition.y === 1) && desiredPosition.x - initialPosition.x === -1) ||
          ((desiredPosition.x - initialPosition.x === 2) && desiredPosition.y - initialPosition.y === 2) ||
          ((desiredPosition.y - initialPosition.y === 2) && desiredPosition.x - initialPosition.x === 2) ||
          ((desiredPosition.x - initialPosition.x === -2) && desiredPosition.y - initialPosition.y === -2) ||
          ((desiredPosition.y - initialPosition.y === -2) && desiredPosition.x - initialPosition.x === -2) ||
          ((desiredPosition.x - initialPosition.x === -2) && desiredPosition.y - initialPosition.y === 2) ||
          ((desiredPosition.y - initialPosition.y === -2) && desiredPosition.x - initialPosition.x === 2) ||
          ((desiredPosition.x - initialPosition.x === 2) && desiredPosition.y - initialPosition.y === -2) ||
          ((desiredPosition.y - initialPosition.y === 2) && desiredPosition.x - initialPosition.x === -2)
          ) {
          // Si la casilla esta ocupada no permite mover
          if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
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
        if ( desiredPosition.x === initialPosition.x || desiredPosition.y === initialPosition.y) {
          if (
            // ((x === px) && y - py === 1) || // Elimino que solo puedan mover 1?
            // ((y === py) && x - px === 1) ||
            // ((x === px) && y - py === -1) ||
            // ((y === py) && x - px === -1) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 2) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -2) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 3) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 3) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -3) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -3) 
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
              console.log("Valid Move!")
              return true;
            }
          }
        }
      } else {} // ?? pa que?
    }

    // reglas de movimiento para Catapulta
    if (type === PieceType.TREBUCHET) {
      if (team === TeamType.OUR || team === TeamType.OPPONENT) {
        // Permite mover la pieza una casilla en cualquier direccion
        if ( desiredPosition.x === initialPosition.x || desiredPosition.y === initialPosition.y) {
          if (
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 1) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 1) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -1) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -1) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 2) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -2)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
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
        if ( desiredPosition.x === initialPosition.x || desiredPosition.y === initialPosition.y) {
          if (
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 1) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 1) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -1) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -1)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
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
        if ( desiredPosition.x === initialPosition.x || desiredPosition.y === initialPosition.y) {
          if (
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 2) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -2) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -2) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === 3) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === 3) ||
            ((desiredPosition.x === initialPosition.x) && desiredPosition.y - initialPosition.y === -3) ||
            ((desiredPosition.y === initialPosition.y) && desiredPosition.x - initialPosition.x === -3)
            ) {
            // Si la casilla esta ocupada no permite mover
            if (!this.tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
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
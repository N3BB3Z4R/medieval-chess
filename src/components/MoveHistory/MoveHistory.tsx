import React from 'react';
import './MoveHistory.css';
import { Move } from '../../domain/core/Move';
import { PieceType } from '../../domain/core/types';
import { useGame } from '../../context/GameContext';

interface MoveHistoryProps {
  moves: readonly Move[];
}

/**
 * Displays the history of moves in algebraic notation.
 * Similar to Chess.com's move list with time travel functionality.
 */
const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const { dispatch, reviewMode, reviewMoveIndex } = useGame();
  
  const handleMoveClick = (moveIndex: number) => {
    dispatch({ type: 'REVIEW_MOVE', payload: { index: moveIndex } });
  };
  
  const handleExitReview = () => {
    dispatch({ type: 'REVIEW_MOVE', payload: { index: null } });
  };
  
  /**
   * Convert piece type to algebraic notation
   */
  const getPieceSymbol = (pieceType: PieceType): string => {
    switch (pieceType) {
      case PieceType.KING:
        return 'K';
      case PieceType.KNIGHT:
        return 'N';
      case PieceType.SCOUT:
        return 'S';
      case PieceType.TEMPLAR:
        return 'T';
      case PieceType.TREBUCHET:
        return 'C'; // Catapult
      case PieceType.RAM:
        return 'R';
      case PieceType.TRAP:
        return 'Tr';
      case PieceType.TREASURE:
        return 'Ts'; // Treasure
      case PieceType.FARMER:
        return ''; // Farmers don't have symbol (like pawns)
      default:
        return '?';
    }
  };

  /**
   * Convert position to algebraic notation (a1, b2, etc.)
   */
  const positionToAlgebraic = (x: number, y: number): string => {
    const files = 'abcdefghijklmnop'; // 16 files for 16x16 board
    const file = files[x];
    const rank = y + 1; // Ranks are 1-indexed
    return `${file}${rank}`;
  };

  /**
   * Format move in algebraic notation
   * Examples: e4, Nf3, Bxc4, O-O, e8=Q
   */
  const formatMove = (move: Move, moveNumber: number): string => {
    const piece = getPieceSymbol(move.pieceType);
    const from = positionToAlgebraic(move.from.x, move.from.y);
    const to = positionToAlgebraic(move.to.x, move.to.y);
    
    let notation = piece;
    
    // Add capture indicator
    if (move.capturedPiece) {
      // Farmers use their file when capturing
      if (move.pieceType === PieceType.FARMER) {
        notation = from[0] + 'x';
      } else {
        notation += 'x';
      }
    }
    
    notation += to;
    
    // Add special move indicators
    if (move.isEnPassant) {
      notation += ' e.p.';
    }
    
    // Add check/checkmate indicators (future implementation)
    // if (move.isCheck) notation += '+';
    // if (move.isCheckmate) notation += '#';
    
    return notation;
  };

  /**
   * Group moves by pairs (white/black turns)
   */
  const groupedMoves: Array<{ moveNumber: number; ourMove?: Move; opponentMove?: Move }> = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      ourMove: moves[i],
      opponentMove: moves[i + 1],
    });
  }

  return (
    <div className="move-history">
      <div className="move-history__header">
        <h3 className="move-history__title">📜 Historial de Jugadas</h3>
        <span className="move-history__count">{moves.length} movimientos</span>
      </div>
      
      {reviewMode && (
        <div className="move-history__review-banner">
          <span>🔍 Modo revisión activo</span>
          <button 
            className="move-history__exit-review"
            onClick={handleExitReview}
          >
            ⬅️ Volver a partida actual
          </button>
        </div>
      )}
      
      <div className="move-history__list">
        {groupedMoves.length === 0 ? (
          <div className="move-history__empty">
            <span className="move-history__empty-icon">♟️</span>
            <p>Aún no hay movimientos</p>
          </div>
        ) : (
          groupedMoves.map((group, index) => {
            const ourMoveIndex = (group.moveNumber - 1) * 2;
            const opponentMoveIndex = ourMoveIndex + 1;
            const isOurMoveReviewed = reviewMode && reviewMoveIndex === ourMoveIndex;
            const isOpponentMoveReviewed = reviewMode && reviewMoveIndex === opponentMoveIndex;
            
            return (
              <div key={index} className="move-history__row">
                <span className="move-history__number">{group.moveNumber}.</span>
                {group.ourMove && (
                  <span 
                    className={`move-history__move move-history__move--our ${
                      isOurMoveReviewed ? 'move-history__move--reviewed' : ''
                    }`}
                    onClick={() => handleMoveClick(ourMoveIndex)}
                    title="Click para revisar esta jugada"
                  >
                    {formatMove(group.ourMove, group.moveNumber)}
                  </span>
                )}
                {group.opponentMove && (
                  <span 
                    className={`move-history__move move-history__move--opponent ${
                      isOpponentMoveReviewed ? 'move-history__move--reviewed' : ''
                    }`}
                    onClick={() => handleMoveClick(opponentMoveIndex)}
                    title="Click para revisar esta jugada"
                  >
                    {formatMove(group.opponentMove, group.moveNumber)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {moves.length > 0 && !reviewMode && (
        <div className="move-history__footer">
          <button 
            className="move-history__button"
            onClick={() => {
              const list = document.querySelector('.move-history__list');
              if (list) list.scrollTop = list.scrollHeight;
            }}
          >
            ⬇️ Ir al final
          </button>
        </div>
      )}
    </div>
  );
};

export default MoveHistory;

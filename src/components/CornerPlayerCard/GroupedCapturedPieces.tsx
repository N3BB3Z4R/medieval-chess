import React from 'react';
import { PieceType } from '../../domain/core/types';
import './GroupedCapturedPieces.css';

interface CapturedPieceGroup {
  type: PieceType;
  count: number;
  image: string;
}

interface GroupedCapturedPiecesProps {
  pieces: Array<{ type: PieceType; image: string }>;
}

// Valores de las piezas para el cálculo de puntos
const pieceValues: Record<PieceType, number> = {
  [PieceType.FARMER]: 1,
  [PieceType.RAM]: 3,
  [PieceType.TRAP]: 2,
  [PieceType.KNIGHT]: 4,
  [PieceType.TEMPLAR]: 5,
  [PieceType.SCOUT]: 3,
  [PieceType.TREBUCHET]: 4,
  [PieceType.TREASURE]: 0,
  [PieceType.KING]: 0,
};

// Nombres en español para los tooltips
const pieceNames: Record<PieceType, string> = {
  [PieceType.FARMER]: 'Granjero',
  [PieceType.RAM]: 'Ariete',
  [PieceType.TRAP]: 'Trampa',
  [PieceType.KNIGHT]: 'Caballero',
  [PieceType.TEMPLAR]: 'Templario',
  [PieceType.SCOUT]: 'Explorador',
  [PieceType.TREBUCHET]: 'Trabuco',
  [PieceType.TREASURE]: 'Tesoro',
  [PieceType.KING]: 'Rey',
};

/**
 * Groups captured pieces by type and shows count multiplier.
 * Much more space-efficient than showing individual pieces.
 * 
 * Example: ♞x3 ♜x2 ♟x5
 */
const GroupedCapturedPieces: React.FC<GroupedCapturedPiecesProps> = ({ pieces }) => {
  // Group pieces by type and calculate total points
  const { groupedPieces, totalPoints } = React.useMemo(() => {
    const groups = new Map<PieceType, CapturedPieceGroup>();
    let points = 0;
    
    for (const piece of pieces) {
      const existing = groups.get(piece.type);
      points += pieceValues[piece.type];
      
      if (existing) {
        existing.count++;
      } else {
        groups.set(piece.type, {
          type: piece.type,
          count: 1,
          image: piece.image
        });
      }
    }
    
    // Convert to array and sort by piece value (most valuable first)
    const pieceOrder: Record<PieceType, number> = {
      [PieceType.KING]: 9,
      [PieceType.TREASURE]: 8,
      [PieceType.TEMPLAR]: 7,
      [PieceType.TREBUCHET]: 6,
      [PieceType.KNIGHT]: 5,
      [PieceType.SCOUT]: 4,
      [PieceType.RAM]: 3,
      [PieceType.TRAP]: 2,
      [PieceType.FARMER]: 1,
    };
    
    return {
      groupedPieces: Array.from(groups.values()).sort((a, b) => 
        pieceOrder[b.type] - pieceOrder[a.type]
      ),
      totalPoints: points
    };
  }, [pieces]);

  if (groupedPieces.length === 0) {
    return null;
  }

  return (
    <div className="grouped-captured-pieces">
      {groupedPieces.map((group) => {
        const pieceName = pieceNames[group.type];
        const pieceValue = pieceValues[group.type];
        const totalValue = pieceValue * group.count;
        const tooltip = group.count > 1 
          ? `${pieceName} x${group.count} (${totalValue} pts)`
          : `${pieceName} (${pieceValue} pts)`;
        
        return (
          <div key={group.type} className="grouped-captured-piece" title={tooltip}>
            <img 
              src={group.image} 
              alt={pieceName}
              className="grouped-captured-piece__icon"
            />
            {group.count > 1 && (
              <span className="grouped-captured-piece__count">
                x{group.count}
              </span>
            )}
          </div>
        );
      })}
      {totalPoints > 0 && (
        <div className="grouped-captured-pieces__total">
          +{totalPoints}
        </div>
      )}
    </div>
  );
};

export default GroupedCapturedPieces;

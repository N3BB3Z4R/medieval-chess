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

/**
 * Groups captured pieces by type and shows count multiplier.
 * Much more space-efficient than showing individual pieces.
 * 
 * Example: ♞x3 ♜x2 ♟x5
 */
const GroupedCapturedPieces: React.FC<GroupedCapturedPiecesProps> = ({ pieces }) => {
  // Group pieces by type
  const groupedPieces = React.useMemo(() => {
    const groups = new Map<PieceType, CapturedPieceGroup>();
    
    for (const piece of pieces) {
      const existing = groups.get(piece.type);
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
    
    return Array.from(groups.values()).sort((a, b) => 
      pieceOrder[b.type] - pieceOrder[a.type]
    );
  }, [pieces]);

  if (groupedPieces.length === 0) {
    return null;
  }

  return (
    <div className="grouped-captured-pieces">
      {groupedPieces.map((group) => (
        <div key={group.type} className="grouped-captured-piece">
          <img 
            src={group.image} 
            alt={group.type}
            className="grouped-captured-piece__icon"
            title={`${group.type} x${group.count}`}
          />
          {group.count > 1 && (
            <span className="grouped-captured-piece__count">
              x{group.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedCapturedPieces;

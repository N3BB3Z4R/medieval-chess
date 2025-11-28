import React from 'react';
import './CapturedPieces.css';
import { PieceType } from '../../domain/core/types';

export interface CapturedPiece {
  type: PieceType;
  image: string;
}

interface CapturedPiecesProps {
  pieces: CapturedPiece[];
  materialAdvantage?: number; // Positive = ahead, negative = behind
  compact?: boolean; // For mobile/thin cards
}

/**
 * Displays captured pieces for a player.
 * Shows material advantage like Chess.com
 */
const CapturedPieces: React.FC<CapturedPiecesProps> = ({ 
  pieces, 
  materialAdvantage = 0,
  compact = false 
}) => {
  // Group pieces by type for compact display
  const groupedPieces = pieces.reduce((acc, piece) => {
    const key = piece.type;
    if (!acc[key]) {
      acc[key] = { piece, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<PieceType, { piece: CapturedPiece; count: number }>);

  const hasAdvantage = materialAdvantage > 0;
  const showAdvantage = materialAdvantage !== 0;

  return (
    <div className={`captured-pieces ${compact ? 'captured-pieces--compact' : ''}`}>
      <div className="captured-pieces__header">
        <span className="captured-pieces__icon">⚔️</span>
        <span className="captured-pieces__title">Capturadas</span>
        {showAdvantage && (
          <span 
            className={`captured-pieces__advantage ${
              hasAdvantage ? 'captured-pieces__advantage--positive' : 'captured-pieces__advantage--negative'
            }`}
          >
            {hasAdvantage ? '+' : ''}{materialAdvantage}
          </span>
        )}
      </div>
      
      <div className="captured-pieces__list">
        {pieces.length === 0 ? (
          <span className="captured-pieces__empty">Ninguna</span>
        ) : (
          Object.values(groupedPieces).map(({ piece, count }) => (
            <div key={piece.type} className="captured-pieces__item">
              <img 
                src={piece.image} 
                alt={piece.type}
                className="captured-pieces__image"
              />
              {count > 1 && (
                <span className="captured-pieces__count">×{count}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CapturedPieces;

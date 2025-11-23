import './Tile.css';
import { TeamType as DomainTeamType, PieceType as DomainPieceType } from '../../domain/core/types';

interface Props {
  image?: string;
  number: number;
  x: number;
  y: number;
  isSelected?: boolean;
  isValidMove?: boolean;
  isCaptureMove?: boolean;
  isUnderAttack?: boolean;
  isSpecialAbility?: boolean;
  currentTurn?: DomainTeamType;
  pieceType?: DomainPieceType;
  pieceTeam?: DomainTeamType;
}

export default function Tile({ 
  number, 
  image, 
  x, 
  y,
  isSelected = false,
  isValidMove = false,
  isCaptureMove = false,
  isUnderAttack = false,
  isSpecialAbility = false,
  currentTurn,
  pieceType,
  pieceTeam
}: Props) {
    // Build CSS classes array
    const classes = ['tile'];
    
    // Add color class
    const isDark = number % 2 === 0;
    classes.push(isDark ? 'tile--dark' : 'tile--light');
    
    // Add state classes
    if (isSelected) classes.push('tile--selected');
    if (isValidMove) classes.push('tile--valid-move');
    if (isCaptureMove) classes.push('tile--capture-move');
    if (isUnderAttack) classes.push('tile--under-attack');
    if (isSpecialAbility) classes.push('tile--special-ability');
    
    // TRAP INVISIBILITY: Hide opponent's TRAPs
    // Rule: "es invisible para el oponente"
    let shouldRenderPiece = true;
    if (pieceType === DomainPieceType.TRAP && currentTurn && pieceTeam) {
      // Hide TRAP if it belongs to opponent (not current turn's team)
      if (pieceTeam !== currentTurn) {
        shouldRenderPiece = false;
      }
    }
    
    return (
      <div className={classes.join(' ')} data-x={x} data-y={y}>
        {image && shouldRenderPiece && (
          <div 
            style={{backgroundImage: `url(${image})`}} 
            className={`mess-piece ${isSelected ? 'mess-piece--selected' : ''}`}
            data-piece-type={pieceType}
            data-piece-team={pieceTeam}
          />
        )}
      </div>
    );
}
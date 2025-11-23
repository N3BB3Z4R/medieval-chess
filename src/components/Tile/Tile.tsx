import './Tile.css';

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
  isSpecialAbility = false
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
    
    return (
      <div className={classes.join(' ')} data-x={x} data-y={y}>
        {image && (
          <div 
            style={{backgroundImage: `url(${image})`}} 
            className={`mess-piece ${isSelected ? 'mess-piece--selected' : ''}`}
          />
        )}
      </div>
    );
}
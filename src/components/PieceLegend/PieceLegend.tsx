import React, { useState } from 'react';
import './PieceLegend.css';
import { PieceType } from '../../domain/core/types';

/**
 * Collapsible legend showing all medieval chess pieces with their names and abilities.
 * Helps users understand the unique piece types in this variant.
 */
const PieceLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pieces = [
    {
      type: PieceType.FARMER,
      name: 'Campesino',
      image: 'assets/images/farmer_w.svg',
      description: 'Mueve 1 casilla adelante. Ataca en diagonal.',
      specialAbility: null
    },
    {
      type: PieceType.RAM,
      name: 'Ariete',
      image: 'assets/images/ram_w.svg',
      description: 'Mueve 1-2 casillas ortogonales.',
      specialAbility: { icon: '💥', text: 'Elimina enemigos en el camino y destino' }
    },
    {
      type: PieceType.TRAP,
      name: 'Trampa',
      image: 'assets/images/trap_w.svg',
      description: 'Mueve 1-2 casillas en diagonal.',
      specialAbility: { icon: '👁️', text: 'Invisible al oponente. Se autodestruye al usarse' }
    },
    {
      type: PieceType.KNIGHT,
      name: 'Caballero',
      image: 'assets/images/knight_w.svg',
      description: 'Mueve 3 recto o 2 diagonal.',
      specialAbility: { icon: '🐴', text: 'Salta sobre otras piezas' }
    },
    {
      type: PieceType.TEMPLAR,
      name: 'Templario',
      image: 'assets/images/templar_w.svg',
      description: 'Mueve 1-2 casillas ortogonales.',
      specialAbility: { icon: '⚔️', text: 'Contraataca: ambas piezas mueren si es atacado' }
    },
    {
      type: PieceType.SCOUT,
      name: 'Explorador',
      image: 'assets/images/hunter_w.svg',
      description: 'Mueve 2-3 casillas ortogonales.',
      specialAbility: { icon: '🔍', text: 'Desactiva trampas enemigas adyacentes' }
    },
    {
      type: PieceType.TREBUCHET,
      name: 'Catapulta',
      image: 'assets/images/catapult_w.svg',
      description: 'Mueve 1-2 casillas ortogonales.',
      specialAbility: { icon: '🎯', text: 'Puede saltar turno y atacar a distancia (1-2 casillas)' }
    },
    {
      type: PieceType.TREASURE,
      name: 'Tesoro',
      image: 'assets/images/treasure_w.svg',
      description: 'Mueve 1 casilla ortogonal.',
      specialAbility: { icon: '💎', text: '¡Protégelo a toda costa!' }
    },
    {
      type: PieceType.KING,
      name: 'Rey',
      image: 'assets/images/king_w.svg',
      description: 'Mueve 2-3 casillas ortogonales. Hace EnPassant.',
      specialAbility: { icon: '👑', text: 'Desactiva trampas. Si muere, todas tus piezas mueven -1 casilla (excepto Tesoro)' }
    }
  ];

  return (
    <div className={`piece-legend ${isExpanded ? 'piece-legend--expanded' : ''}`}>
      <button 
        className="piece-legend__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Ocultar leyenda' : 'Mostrar leyenda de piezas'}
      >
        {isExpanded ? (
          <>
            <span className="piece-legend__icon">✖️</span>
            <span>Ocultar Leyenda</span>
          </>
        ) : (
          <>
            <span className="piece-legend__icon">📖</span>
            <span>Leyenda de Piezas</span>
          </>
        )}
      </button>

      {isExpanded && (
        <div className="piece-legend__content">
          <h3 className="piece-legend__title">🏰 Piezas Medievales</h3>
          <div className="piece-legend__grid">
            {pieces.map((piece) => (
              <div 
                key={piece.type} 
                className={`piece-legend__item ${piece.specialAbility ? 'piece-legend__item--special' : ''}`}
              >
                <div className="piece-legend__image-container">
                  <img 
                    src={piece.image} 
                    alt={piece.name}
                    className="piece-legend__image"
                  />
                </div>
                <div className="piece-legend__info">
                  <h4 className="piece-legend__name">{piece.name}</h4>
                  <p className="piece-legend__description">{piece.description}</p>
                  {piece.specialAbility && (
                    <div className="piece-legend__special">
                      <span className="piece-legend__special-icon">{piece.specialAbility.icon}</span>
                      <span className="piece-legend__special-text">{piece.specialAbility.text}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PieceLegend;

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
      description: 'Mueve 1 casilla adelante. Ataca en diagonal.'
    },
    {
      type: PieceType.RAM,
      name: 'Ariete',
      image: 'assets/images/ram_w.svg',
      description: 'Mueve 1-2 casillas. Elimina enemigos en su camino.'
    },
    {
      type: PieceType.TRAP,
      name: 'Trampa',
      image: 'assets/images/trap_w.svg',
      description: 'Mueve 1-2 diagonal. Invisible al oponente.'
    },
    {
      type: PieceType.KNIGHT,
      name: 'Caballero',
      image: 'assets/images/knight_w.svg',
      description: 'Mueve 3 recto o 2 diagonal. Salta piezas.'
    },
    {
      type: PieceType.TEMPLAR,
      name: 'Templario',
      image: 'assets/images/templar_w.svg',
      description: 'Mueve 1-2 casillas. Contraataca si es atacado.'
    },
    {
      type: PieceType.SCOUT,
      name: 'Explorador',
      image: 'assets/images/hunter_w.svg',
      description: 'Mueve 2-3 casillas. Desactiva trampas.'
    },
    {
      type: PieceType.TREBUCHET,
      name: 'Catapulta',
      image: 'assets/images/catapult_w.svg',
      description: 'Mueve 1-2 casillas. Ataque a distancia.'
    },
    {
      type: PieceType.TREASURE,
      name: 'Tesoro',
      image: 'assets/images/treasure_w.svg',
      description: 'Mueve 1 casilla. ¡Protégelo!'
    },
    {
      type: PieceType.KING,
      name: 'Rey',
      image: 'assets/images/king_w.svg',
      description: 'Mueve 2-3 casillas. Hace EnPassant.'
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
              <div key={piece.type} className="piece-legend__item">
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

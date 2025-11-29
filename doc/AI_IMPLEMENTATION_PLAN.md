# Plan de Implementación de IA para Medieval Chess

## 🎯 Objetivo
Implementar un motor de IA capaz de jugar Medieval Chess respetando las reglas no estándar del juego (9 tipos de piezas únicas, tablero 16×16, 4 jugadores, habilidades especiales).

---

## 📋 Estado Actual

### ✅ Ya Implementado
- Arquitectura Clean Architecture con separación de capas
- Domain Layer con reglas de movimiento (RuleEngine + validators)
- Validadores por tipo de pieza (Farmer, Knight, Templar, etc.)
- Tipos y interfaces en `domain/core/types.ts`
- GameState inmutable con métodos de consulta
- TurnManager para gestión de turnos

### ❌ Pendiente de Implementar
- Motor de IA (Minimax con alpha-beta pruning)
- Evaluador de posiciones (heurísticas específicas del juego)
- Generación de movimientos legales
- Integración con UI (selector de oponente IA)
- Niveles de dificultad ajustables

---

## 🏗️ Arquitectura Propuesta

```
src/
├── domain/
│   └── ai/
│       ├── interfaces.ts              # Interfaces para IA
│       │   ├── IAIPlayer              # Contrato principal
│       │   ├── IPositionEvaluator     # Evaluación de posiciones
│       │   └── IMoveGenerator         # Generación de movimientos
│       │
│       ├── MinimaxAI.ts               # Implementación principal
│       ├── PositionEvaluator.ts       # Heurísticas del juego
│       ├── MoveGenerator.ts           # Generador de movimientos legales
│       │
│       └── evaluators/                # Evaluadores especializados
│           ├── MaterialEvaluator.ts   # Valor de piezas
│           ├── PositionEvaluator.ts   # Control del tablero
│           ├── MobilityEvaluator.ts   # Movilidad de piezas
│           ├── KingSafetyEvaluator.ts # Seguridad del rey
│           └── TrapEvaluator.ts       # Evaluación de trampas
│
└── application/
    └── usecases/
        ├── CalculateAIMove.ts         # Caso de uso para calcular movimiento
        └── ConfigureAIOpponent.ts     # Configurar oponente IA
```

---

## 🧩 Fase 1: Interfaces y Tipos Base (2-3 horas)

### 1.1 Definir interfaces principales
**Archivo**: `src/domain/ai/interfaces.ts`

```typescript
export enum AIDifficulty {
  EASY = 'EASY',       // Profundidad 1, errores aleatorios
  MEDIUM = 'MEDIUM',   // Profundidad 2, heurísticas básicas
  HARD = 'HARD',       // Profundidad 3, todas las heurísticas
  EXPERT = 'EXPERT'    // Profundidad 4+, optimizaciones avanzadas
}

export interface AIConfig {
  difficulty: AIDifficulty;
  maxThinkTime?: number; // Tiempo máximo en ms
  randomness?: number;   // 0-100, para humanizar jugadas
}

export interface IAIPlayer {
  calculateMove(gameState: GameState, config: AIConfig): Move | null;
  getName(): string;
  getDifficulty(): AIDifficulty;
}

export interface IPositionEvaluator {
  evaluate(gameState: GameState, forTeam: TeamType): number;
}

export interface IMoveGenerator {
  generateLegalMoves(gameState: GameState, forTeam: TeamType): Move[];
}

export interface EvaluationWeights {
  material: number;        // Peso del valor de piezas (default: 100)
  position: number;        // Control del centro (default: 20)
  mobility: number;        // Número de movimientos legales (default: 10)
  kingSafety: number;      // Distancia del rey a amenazas (default: 50)
  trapControl: number;     // Valor de trampas activas (default: 15)
  specialAbilities: number; // Uso de habilidades especiales (default: 25)
}
```

### 1.2 Valores de piezas
**Archivo**: `src/domain/ai/PieceValues.ts`

```typescript
export const PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.FARMER]: 10,      // Peón básico
  [PieceType.RAM]: 30,          // Destruye en línea
  [PieceType.TRAP]: 25,         // Invisible, táctico
  [PieceType.KNIGHT]: 35,       // Salto + diagonal
  [PieceType.TEMPLAR]: 50,      // Contraataca
  [PieceType.SCOUT]: 40,        // Desactiva trampas
  [PieceType.TREBUCHET]: 60,    // Ataque a distancia
  [PieceType.TREASURE]: 15,     // Objetivo de captura
  [PieceType.KING]: 1000        // Pieza crítica
};

export const POSITION_BONUS: Record<string, number> = {
  // Centro del tablero (8,8) tiene mayor valor
  CENTER: 20,
  NEAR_CENTER: 10,
  EDGE: -5,
  FORBIDDEN_ZONE_ADJACENT: 15  // Controlar accesos
};
```

---

## 🧮 Fase 2: Generación de Movimientos Legales (3-4 horas)

### 2.1 Implementar MoveGenerator
**Archivo**: `src/domain/ai/MoveGenerator.ts`

```typescript
import { GameState } from '../game/GameState';
import { Move } from '../core/Move';
import { TeamType, PieceType } from '../core/types';
import { Position } from '../core/Position';
import { RuleEngine } from '../rules/RuleEngine';
import { IMoveGenerator } from './interfaces';

export class MoveGenerator implements IMoveGenerator {
  constructor(private ruleEngine: RuleEngine) {}

  /**
   * Genera todos los movimientos legales para un equipo.
   * Usa los validators existentes para validar cada movimiento.
   */
  generateLegalMoves(gameState: GameState, forTeam: TeamType): Move[] {
    const pieces = gameState.getPiecesForTeam(forTeam);
    const allMoves: Move[] = [];

    for (const piece of pieces) {
      const pieceMoves = this.generateMovesForPiece(piece, gameState);
      allMoves.push(...pieceMoves);
    }

    return allMoves;
  }

  private generateMovesForPiece(piece: Piece, gameState: GameState): Move[] {
    const moves: Move[] = [];
    const from = piece.position;

    // Generar candidatos según tipo de pieza
    const candidates = this.generateCandidateDestinations(piece);

    for (const to of candidates) {
      // Validar usando RuleEngine existente
      const move: Move = { from, to, piece };
      const validation = this.ruleEngine.validateMove(move, gameState.pieces);

      if (validation.isValid) {
        moves.push(move);
      }
    }

    return moves;
  }

  /**
   * Genera posiciones candidatas según tipo de pieza.
   * Reutiliza la lógica de los validators existentes.
   */
  private generateCandidateDestinations(piece: Piece): Position[] {
    const { position, type, team } = piece;
    const candidates: Position[] = [];

    switch (type) {
      case PieceType.FARMER:
        candidates.push(...this.generateFarmerMoves(position, team));
        break;
      case PieceType.KNIGHT:
        candidates.push(...this.generateKnightMoves(position));
        break;
      case PieceType.KING:
        candidates.push(...this.generateKingMoves(position));
        break;
      // ... resto de piezas
    }

    // Filtrar posiciones fuera del tablero
    return candidates.filter(pos => this.isWithinBounds(pos));
  }

  private generateFarmerMoves(pos: Position, team: TeamType): Position[] {
    const direction = DirectionCalculator.forTeam(team);
    return [
      new Position(pos.x, pos.y + direction.y),           // Forward
      new Position(pos.x + 1, pos.y + direction.y),       // Diagonal right
      new Position(pos.x - 1, pos.y + direction.y)        // Diagonal left
    ];
  }

  private generateKnightMoves(pos: Position): Position[] {
    // 3 rectos o 2 diagonales
    const moves: Position[] = [];
    
    // 3 rectos (4 direcciones)
    for (const delta of [{x:0,y:3}, {x:0,y:-3}, {x:3,y:0}, {x:-3,y:0}]) {
      moves.push(new Position(pos.x + delta.x, pos.y + delta.y));
    }

    // 2 diagonales (4 direcciones)
    for (const delta of [{x:2,y:2}, {x:2,y:-2}, {x:-2,y:2}, {x:-2,y:-2}]) {
      moves.push(new Position(pos.x + delta.x, pos.y + delta.y));
    }

    return moves;
  }

  // ... implementar resto de piezas

  private isWithinBounds(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 16 && pos.y >= 0 && pos.y < 16;
  }
}
```

### 2.2 Tests para MoveGenerator
**Archivo**: `src/domain/ai/__tests__/MoveGenerator.test.ts`

```typescript
describe('MoveGenerator', () => {
  let generator: MoveGenerator;
  let ruleEngine: RuleEngine;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    // Registrar todos los validators
    generator = new MoveGenerator(ruleEngine);
  });

  it('should generate all legal farmer moves', () => {
    const gameState = createGameState({
      pieces: [
        createPiece(new Position(4, 4), PieceType.FARMER, TeamType.OUR)
      ]
    });

    const moves = generator.generateLegalMoves(gameState, TeamType.OUR);

    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(m => m.piece.type === PieceType.FARMER)).toBe(true);
  });

  it('should respect forbidden zones', () => {
    // Test que las piezas no pueden moverse a zonas prohibidas
  });

  it('should not generate moves through blocked paths', () => {
    // Test que las piezas no pasan a través de otras
  });
});
```

---

## 🧠 Fase 3: Evaluador de Posiciones (4-5 horas)

### 3.1 Evaluador de Material
**Archivo**: `src/domain/ai/evaluators/MaterialEvaluator.ts`

```typescript
export class MaterialEvaluator implements IPositionEvaluator {
  evaluate(gameState: GameState, forTeam: TeamType): number {
    let score = 0;

    for (const piece of gameState.pieces) {
      const value = PIECE_VALUES[piece.type];
      
      if (piece.team === forTeam) {
        score += value;
      } else {
        score -= value;
      }
    }

    return score;
  }
}
```

### 3.2 Evaluador de Posición
**Archivo**: `src/domain/ai/evaluators/PositionEvaluator.ts`

```typescript
export class PositionEvaluator implements IPositionEvaluator {
  private readonly CENTER = new Position(8, 8);

  evaluate(gameState: GameState, forTeam: TeamType): number {
    let score = 0;

    for (const piece of gameState.getPiecesForTeam(forTeam)) {
      score += this.evaluatePiecePosition(piece);
    }

    return score;
  }

  private evaluatePiecePosition(piece: Piece): number {
    const distanceToCenter = Position.manhattanDistance(piece.position, this.CENTER);
    
    // Piezas más cerca del centro tienen mayor valor
    const centerBonus = Math.max(0, 16 - distanceToCenter) * 2;

    // Knights y Scouts valoran más el centro
    if (piece.type === PieceType.KNIGHT || piece.type === PieceType.SCOUT) {
      return centerBonus * 1.5;
    }

    // King debe estar protegido (lejos del centro al inicio)
    if (piece.type === PieceType.KING) {
      return distanceToCenter > 10 ? 10 : -10;
    }

    return centerBonus;
  }
}
```

### 3.3 Evaluador de Movilidad
**Archivo**: `src/domain/ai/evaluators/MobilityEvaluator.ts`

```typescript
export class MobilityEvaluator implements IPositionEvaluator {
  constructor(private moveGenerator: IMoveGenerator) {}

  evaluate(gameState: GameState, forTeam: TeamType): number {
    const ourMoves = this.moveGenerator.generateLegalMoves(gameState, forTeam);
    
    // Más opciones = mejor posición
    return ourMoves.length * 5;
  }
}
```

### 3.4 Evaluador Combinado
**Archivo**: `src/domain/ai/PositionEvaluator.ts`

```typescript
export class PositionEvaluator implements IPositionEvaluator {
  private readonly weights: EvaluationWeights;

  constructor(
    private materialEvaluator: MaterialEvaluator,
    private positionEvaluator: PositionEvaluator,
    private mobilityEvaluator: MobilityEvaluator,
    private kingSafetyEvaluator: KingSafetyEvaluator,
    private trapEvaluator: TrapEvaluator,
    weights?: Partial<EvaluationWeights>
  ) {
    this.weights = {
      material: 100,
      position: 20,
      mobility: 10,
      kingSafety: 50,
      trapControl: 15,
      specialAbilities: 25,
      ...weights
    };
  }

  evaluate(gameState: GameState, forTeam: TeamType): number {
    let totalScore = 0;

    totalScore += this.materialEvaluator.evaluate(gameState, forTeam) * this.weights.material;
    totalScore += this.positionEvaluator.evaluate(gameState, forTeam) * this.weights.position;
    totalScore += this.mobilityEvaluator.evaluate(gameState, forTeam) * this.weights.mobility;
    totalScore += this.kingSafetyEvaluator.evaluate(gameState, forTeam) * this.weights.kingSafety;
    totalScore += this.trapEvaluator.evaluate(gameState, forTeam) * this.weights.trapControl;

    return totalScore;
  }
}
```

---

## 🎮 Fase 4: Motor Minimax (5-6 horas)

### 4.1 Implementar Minimax con Alpha-Beta Pruning
**Archivo**: `src/domain/ai/MinimaxAI.ts`

```typescript
export class MinimaxAI implements IAIPlayer {
  private readonly difficulty: AIDifficulty;
  private readonly maxDepth: number;
  private nodesEvaluated: number = 0;

  constructor(
    private moveGenerator: IMoveGenerator,
    private positionEvaluator: IPositionEvaluator,
    difficulty: AIDifficulty = AIDifficulty.MEDIUM
  ) {
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthForDifficulty(difficulty);
  }

  calculateMove(gameState: GameState, config: AIConfig): Move | null {
    this.nodesEvaluated = 0;
    const startTime = Date.now();

    const moves = this.moveGenerator.generateLegalMoves(gameState, gameState.currentTurn);
    
    if (moves.length === 0) return null;

    // Caso fácil: jugada aleatoria con sesgo
    if (this.difficulty === AIDifficulty.EASY) {
      return this.selectEasyMove(moves, gameState);
    }

    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of moves) {
      const newState = this.applyMove(gameState, move);
      const score = this.minimax(
        newState, 
        this.maxDepth - 1, 
        alpha, 
        beta, 
        false, // Siguiente turno es del oponente
        gameState.currentTurn
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`AI evaluated ${this.nodesEvaluated} nodes in ${elapsedTime}ms`);

    return bestMove;
  }

  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiTeam: TeamType
  ): number {
    this.nodesEvaluated++;

    // Condiciones de parada
    if (depth === 0 || gameState.isGameOver()) {
      return this.positionEvaluator.evaluate(gameState, aiTeam);
    }

    const currentTeam = gameState.currentTurn;
    const moves = this.moveGenerator.generateLegalMoves(gameState, currentTeam);

    if (moves.length === 0) {
      // Sin movimientos legales = pierde
      return isMaximizing ? -10000 : 10000;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;

      for (const move of moves) {
        const newState = this.applyMove(gameState, move);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, false, aiTeam);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Poda beta
        }
      }

      return maxEval;
    } else {
      let minEval = Infinity;

      for (const move of moves) {
        const newState = this.applyMove(gameState, move);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, true, aiTeam);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Poda alpha
        }
      }

      return minEval;
    }
  }

  private applyMove(gameState: GameState, move: Move): GameState {
    // Crear nuevo estado inmutable con el movimiento aplicado
    const newPieces = gameState.pieces.map(p => 
      Position.equals(p.position, move.from) 
        ? { ...p, position: move.to }
        : p
    ).filter(p => !Position.equals(p.position, move.to) || p === move.piece);

    return new GameState({
      ...gameState,
      pieces: newPieces,
      currentTurn: this.getNextTeam(gameState.currentTurn)
    });
  }

  private selectEasyMove(moves: Move[], gameState: GameState): Move {
    // Dificultad fácil: 70% random, 30% mejor movimiento
    if (Math.random() < 0.7) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Evaluar solo 1 nivel de profundidad
    return moves.reduce((best, move) => {
      const newState = this.applyMove(gameState, move);
      const score = this.positionEvaluator.evaluate(newState, gameState.currentTurn);
      return score > best.score ? { move, score } : best;
    }, { move: moves[0], score: -Infinity }).move;
  }

  private getDepthForDifficulty(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case AIDifficulty.EASY: return 1;
      case AIDifficulty.MEDIUM: return 2;
      case AIDifficulty.HARD: return 3;
      case AIDifficulty.EXPERT: return 4;
    }
  }

  private getNextTeam(currentTeam: TeamType): TeamType {
    // Implementar lógica de rotación de equipos (2 o 4 jugadores)
    // Por ahora asumimos 2 jugadores
    return currentTeam === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
  }

  getName(): string {
    return `MinimaxAI (${this.difficulty})`;
  }

  getDifficulty(): AIDifficulty {
    return this.difficulty;
  }
}
```

---

## 🔌 Fase 5: Integración con UI (3-4 horas)

### 5.1 Modificar GameSetupModal
**Archivo**: `src/components/GameSetupModal/GameSetupModal.tsx`

```typescript
interface PlayerSetup {
  type: 'human' | 'ai';
  difficulty?: AIDifficulty;
  name: string;
}

interface GameSetupData {
  playerCount: 2 | 4;
  players: [PlayerSetup, PlayerSetup, PlayerSetup?, PlayerSetup?];
  timeControl?: TimeControl;
}

const GameSetupModal: React.FC<Props> = ({ onStartGame, onClose }) => {
  const [playerCount, setPlayerCount] = useState<2 | 4>(2);
  const [player1Type, setPlayer1Type] = useState<'human' | 'ai'>('human');
  const [player2Type, setPlayer2Type] = useState<'human' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);

  return (
    <div className="game-setup-modal">
      {/* Jugador 1 (siempre humano) */}
      <div className="player-setup">
        <label>Jugador 1</label>
        <select disabled value="human">
          <option value="human">👤 Humano</option>
        </select>
      </div>

      {/* Jugador 2 */}
      <div className="player-setup">
        <label>Jugador 2</label>
        <select value={player2Type} onChange={e => setPlayer2Type(e.target.value as 'human' | 'ai')}>
          <option value="human">👤 Humano</option>
          <option value="ai">🤖 IA</option>
        </select>

        {player2Type === 'ai' && (
          <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value as AIDifficulty)}>
            <option value={AIDifficulty.EASY}>Fácil</option>
            <option value={AIDifficulty.MEDIUM}>Medio</option>
            <option value={AIDifficulty.HARD}>Difícil</option>
            <option value={AIDifficulty.EXPERT}>Experto</option>
          </select>
        )}
      </div>

      <button onClick={() => handleStartGame()}>Iniciar Partida</button>
    </div>
  );
};
```

### 5.2 Modificar App.tsx para IA
**Archivo**: `src/App.tsx`

```typescript
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [aiPlayer, setAiPlayer] = useState<IAIPlayer | null>(null);

  // Ejecutar turno de IA automáticamente
  useEffect(() => {
    if (!aiPlayer || gameState.currentTurn !== TeamType.OPPONENT) return;

    // Esperar 500ms para humanizar
    const timeoutId = setTimeout(() => {
      const move = aiPlayer.calculateMove(gameState, { difficulty: AIDifficulty.MEDIUM });
      
      if (move) {
        handleMove(move);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [gameState.currentTurn, aiPlayer]);

  const handleStartGame = (setup: GameSetupData) => {
    if (setup.players[1].type === 'ai') {
      const ai = new MinimaxAI(
        moveGenerator,
        positionEvaluator,
        setup.players[1].difficulty
      );
      setAiPlayer(ai);
    } else {
      setAiPlayer(null);
    }

    // Iniciar juego...
  };

  return (
    // ...
  );
};
```

---

## 🧪 Fase 6: Testing y Optimización (4-5 horas)

### 6.1 Tests de Integración
```typescript
describe('MinimaxAI Integration', () => {
  it('should not crash on complex positions', () => {
    const gameState = createComplexGameState(); // 30+ piezas
    const ai = new MinimaxAI(moveGenerator, positionEvaluator, AIDifficulty.MEDIUM);

    expect(() => ai.calculateMove(gameState, {})).not.toThrow();
  });

  it('should find checkmate in 2 moves', () => {
    const gameState = createCheckmateIn2Position();
    const ai = new MinimaxAI(moveGenerator, positionEvaluator, AIDifficulty.HARD);

    const move = ai.calculateMove(gameState, {});
    
    // Verificar que la IA encuentra la jugada ganadora
    expect(move).not.toBeNull();
  });

  it('should complete move within time limit', () => {
    const gameState = createGameState();
    const ai = new MinimaxAI(moveGenerator, positionEvaluator, AIDifficulty.MEDIUM);

    const startTime = Date.now();
    ai.calculateMove(gameState, { maxThinkTime: 5000 });
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(5000);
  });
});
```

### 6.2 Optimizaciones
- **Transposition Tables**: Cachear posiciones evaluadas
- **Move Ordering**: Evaluar primero capturas y amenazas
- **Quiescence Search**: Extender búsqueda en capturas
- **Iterative Deepening**: Buscar profundidad incremental con timeout

---

## 📊 Estimación de Tiempos

| Fase | Descripción | Horas Estimadas |
|------|-------------|----------------|
| 1 | Interfaces y tipos base | 2-3h |
| 2 | Generación de movimientos | 3-4h |
| 3 | Evaluador de posiciones | 4-5h |
| 4 | Motor Minimax | 5-6h |
| 5 | Integración con UI | 3-4h |
| 6 | Testing y optimización | 4-5h |
| **Total** | | **21-27 horas** |

---

## 🎯 Criterios de Aceptación

### ✅ MVP (Fase 1-5)
- [ ] IA puede jugar una partida completa sin errores
- [ ] IA respeta todas las reglas del juego (validadas por RuleEngine)
- [ ] IA hace jugadas razonables (no suicidas)
- [ ] UI permite seleccionar oponente IA con dificultad
- [ ] Tiempo de respuesta < 3 segundos en dificultad Media

### 🚀 Optimizaciones Opcionales (Fase 6)
- [ ] Dificultad Experto funcional (profundidad 4)
- [ ] Transposition tables implementadas
- [ ] IA detecta checkmate en 3 movimientos
- [ ] Opening book para primeros 5 movimientos

---

## 🔧 Comandos de Desarrollo

```bash
# Ejecutar tests de IA
npm test -- --testPathPattern=ai

# Ejecutar tests con coverage
npm test -- --coverage --testPathPattern=ai

# Benchmark de IA
npm run benchmark:ai

# Profile de rendimiento
npm run profile:ai
```

---

## 📚 Referencias

- **Minimax Algorithm**: [Wikipedia](https://en.wikipedia.org/wiki/Minimax)
- **Alpha-Beta Pruning**: [Chess Programming Wiki](https://www.chessprogramming.org/Alpha-Beta)
- **Evaluation Functions**: [Chess Programming - Evaluation](https://www.chessprogramming.org/Evaluation)
- **Move Generation**: [Chess Programming - Move Generation](https://www.chessprogramming.org/Move_Generation)

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar este plan** con el equipo
2. **Crear issues** en GitHub para cada fase
3. **Comenzar con Fase 1** (interfaces base)
4. **Implementar tests primero** (TDD approach)
5. **Refactorizar** código legacy si necesario

---

**Autor**: GitHub Copilot  
**Fecha**: 29 de noviembre de 2025  
**Versión**: 1.0

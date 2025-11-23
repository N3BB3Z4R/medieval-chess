# MESS - Medieval Chess: AI Agent Instructions

## Project Overview
This is a **React + TypeScript** project implementing a custom 4-player medieval chess variant on a 16x16 board. The game features 9 unique piece types with non-standard movement rules and special abilities.

**Technology Stack**: React 17.0.2, TypeScript 4.4.2, Canvas rendering (migrating from CSS Grid)  
**Architecture Pattern**: Clean Architecture with SOLID principles  
**State Management**: Context API + useReducer (refactoring from local useState)  
**Rendering**: Canvas 2D API for 60 FPS performance  
**AI Engine**: Minimax with alpha-beta pruning (depth 3)

## Architecture Principles

### SOLID Compliance (MANDATORY)
All new code MUST follow SOLID principles:

1. **Single Responsibility Principle**: Each class/module has ONE reason to change
   - ✅ Good: `GameState` only manages game state
   - ❌ Bad: `Messboard` handling state + rendering + events (legacy code)

2. **Open/Closed Principle**: Extend via plugins, not modifications
   - Use Strategy Pattern for piece validators
   - Use Observer Pattern for game events
   - Register new features via dependency injection

3. **Liskov Substitution**: All implementations interchangeable
   - All `MoveValidator` implementations must honor same contract
   - Mock implementations for testing without side effects

4. **Interface Segregation**: Thin, focused interfaces
   - Separate `GameStateReader` and `GameStateWriter` interfaces
   - UI components depend only on readers

5. **Dependency Inversion**: Depend on abstractions
   - Inject dependencies via Context API or constructor
   - Never use `new ClassName()` inside components/classes

### Target Architecture (Clean Architecture)

```
src/
├── domain/                    # Business logic (no React dependencies)
│   ├── core/
│   │   ├── Position.ts       # Value object with static helpers
│   │   ├── Move.ts           # Value object
│   │   ├── GameState.ts      # Immutable game state entity
│   │   └── interfaces.ts     # Core interfaces
│   ├── rules/
│   │   ├── MoveValidator.ts  # Interface
│   │   ├── RuleEngine.ts     # Orchestrator with plugin system
│   │   └── validators/       # One file per piece type
│   │       ├── FarmerMoveValidator.ts
│   │       ├── KnightMoveValidator.ts
│   │       └── ...
│   ├── game/
│   │   ├── TurnManager.ts
│   │   ├── WinConditionChecker.ts
│   │   ├── MatchController.ts
│   │   └── GameEngine.ts
│   ├── ai/
│   │   ├── AIPlayer.ts       # Interface
│   │   ├── MinimaxAI.ts      # Implementation
│   │   └── PositionEvaluator.ts
│   └── board/
│       ├── BoardGeometry.ts  # Forbidden zones, bounds checking
│       └── CoordinateMapper.ts
├── application/               # Use cases
│   ├── usecases/
│   │   ├── MakeMove.ts
│   │   ├── StartMatch.ts
│   │   └── CalculateAIMove.ts
│   └── services/
├── infrastructure/            # External dependencies
│   ├── storage/
│   │   └── LocalStorageRepository.ts
│   ├── logging/
│   │   └── Logger.ts
│   └── rendering/
│       ├── CanvasRenderer.ts
│       └── effects/
│           └── ParticleSystem.ts
├── presentation/              # React components
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx
│   │   │   ├── CanvasBoard.tsx
│   │   │   └── hooks/
│   │   │       ├── useDragAndDrop.ts
│   │   │       └── useAnimationFrame.ts
│   │   ├── PlayerCounter/
│   │   └── MoveHistory/
│   ├── context/
│   │   ├── GameContext.tsx
│   │   └── DependencyContext.tsx
│   └── hooks/
└── core/                      # DI container, bootstrap
    └── DependencyContainer.ts
```

### Legacy Code (DO NOT EXTEND)
These files are being phased out:
- ❌ `src/components/Messboard/Messboard.tsx` (374 lines, violates SRP)
- ❌ `src/referee/Referee.ts` (God object, violates OCP)
- ❌ `src/Constants.ts` (mixed concerns: types + state + helpers)

When modifying legacy code:
1. **Extract before modifying**: Create new clean module first
2. **Add feature flags**: Toggle between old/new implementations
3. **Write characterization tests**: Capture current behavior
4. **Migrate incrementally**: One component at a time

### Component Structure
- **`Messboard.tsx`**: Main game board (374 lines)
  - Manages piece state with `useState<Piece[]>`
  - Implements drag-and-drop via mouse events (`handleGrabPiece`, `handleMovePiece`, `handleDropPiece`)
  - Coordinate calculation: `Math.floor((e.clientX - messboard.offsetLeft) / GRID_SIZE)` for x-axis, inverted calculation for y-axis
  - Renders 256 `Tile` components (16×16 grid)
  - **Critical**: Uses `samePosition()` helper extensively for piece lookups

- **`Tile.tsx`**: Individual square renderer
  - Alternates colors based on `number % 2`
  - Conditionally renders piece image via inline `backgroundImage` style

## Game-Specific Rules (from `Rules.txt`)
When implementing piece logic, reference these Spanish→English translations:
- **FARMER** (Campesino): 1 square movement, diagonal attacks + en passant
- **RAM** (Ariete): 1-2 squares, destroys enemies in path
- **TRAP** (Trampa): 1-2 diagonal, invisible to opponent, destroyed by SCOUT/KING
- **KNIGHT** (Caballero): 3 straight or 2 diagonal, jumps over pieces
- **TEMPLAR** (Templario): 1-2 squares, counter-attacks (mutual destruction)
- **SCOUT** (Explorador/Cazador): 2-3 squares, disables traps
- **TREBUCHET** (Catapulta): 1-2 squares, can skip turn to attack 1-2 range
- **TREASURE** (Tesoro): 1 square movement
- **KING** (Rey): 2-3 squares, en passant capability, affects all pieces if killed

## Development Workflow

### Starting the Application
```bash
npm start          # Standard React dev server (port 3000)
npm run safestart  # Use if encountering OpenSSL legacy provider issues
```

### Known Issues (from README.md)
When fixing bugs, prioritize these TODOs:
1. Pieces detaching from grid during drag (coordinate calculation bug)
2. Pieces moving to hidden tiles (bounds validation missing)
3. Grid hardcoded in pixels (convert to CSS Grid with % units)
4. Pieces passing through own/opponent pieces (collision detection incomplete)
5. Black team cannot attack white team (team logic inversion)

### File Modification Guidelines

#### Adding New Piece Types (Open/Closed Principle)
```typescript
// 1. Define piece type in domain
// src/domain/core/types.ts
export enum PieceType {
  FARMER = 'FARMER',
  KNIGHT = 'KNIGHT',
  // ... existing
  NEW_PIECE = 'NEW_PIECE' // Add here
}

// 2. Create validator (NO modifications to existing code!)
// src/domain/rules/validators/NewPieceMoveValidator.ts
export class NewPieceMoveValidator implements MoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.NEW_PIECE;
  }
  
  validate(move: Move, boardState: ReadonlyArray<Piece>): ValidationResult {
    // Implement movement rules
    return ValidationResult.valid();
  }
}

// 3. Register in DI container (composition root)
// src/main.tsx
const ruleEngine = new RuleEngine();
ruleEngine.registerValidator(new NewPieceMoveValidator());

// 4. Add to initial board state
// src/domain/game/GameState.ts
const initialPieces: Piece[] = [
  // ... existing pieces
  { type: PieceType.NEW_PIECE, position: new Position(8, 8), team: TeamType.OUR }
];
```

#### Adding Special Abilities
```typescript
// src/domain/rules/abilities/NewAbility.ts
export class NewAbility implements SpecialAbility {
  canApply(move: Move, gameState: GameState): boolean {
    return move.piece.type === PieceType.TRAP;
  }
  
  apply(move: Move, gameState: GameState): AbilityResult {
    // Implement special behavior
    return AbilityResult.noEffect();
  }
}

// Register in RuleEngine
ruleEngine.registerSpecialAbility(new NewAbility());
```

#### Modifying Board Dimensions
```typescript
// src/domain/core/constants.ts
export const BoardConfig = {
  GRID_SIZE: 50,           // Tile size in pixels
  BOARD_SIZE: 16,          // 16x16 grid
  BOARD_WIDTH_PX: 800,     // GRID_SIZE * BOARD_SIZE
  BOARD_HEIGHT_PX: 800
} as const;

// Update forbidden zones
// src/domain/board/BoardGeometry.ts
private static readonly FORBIDDEN_ZONES: Rectangle[] = [
  // Define based on new dimensions
];
```

#### Team Movement Logic
```typescript
// src/domain/core/DirectionCalculator.ts
export class DirectionCalculator {
  static forTeam(team: TeamType): Vector {
    switch (team) {
      case TeamType.OUR:
        return { x: 0, y: 1 };  // Moves UP
      case TeamType.OPPONENT:
        return { x: 0, y: -1 }; // Moves DOWN
      case TeamType.OPPONENT_2:
        return { x: 1, y: 0 };  // Moves RIGHT (4-player)
      case TeamType.OPPONENT_3:
        return { x: -1, y: 0 }; // Moves LEFT (4-player)
    }
  }
  
  static isForward(delta: Delta, team: TeamType): boolean {
    const direction = this.forTeam(team);
    return delta.x === direction.x && delta.y === direction.y;
  }
}
```

## Code Conventions & Standards

### TypeScript Guidelines
1. **100% Strict Mode**: Enable all strict compiler options
   ```typescript
   // tsconfig.json
   "strict": true,
   "noImplicitAny": true,
   "strictNullChecks": true,
   "strictFunctionTypes": true
   ```

2. **NO `any` Types**: Use `unknown` and type guards instead
   ```typescript
   // ❌ Bad
   function process(data: any) { }
   
   // ✅ Good
   function process(data: unknown): void {
     if (isValidGameState(data)) {
       // TypeScript now knows data is GameState
     }
   }
   ```

3. **Prefer `readonly` and Immutability**
   ```typescript
   // ✅ Good
   interface GameState {
     readonly pieces: ReadonlyArray<Piece>;
     readonly currentTurn: TeamType;
   }
   
   // Methods return new instances
   movePiece(move: Move): GameState {
     return new GameState([...this.pieces]); // Immutable update
   }
   ```

4. **Value Objects over Primitives**
   ```typescript
   // ❌ Bad
   function movePiece(fromX: number, fromY: number, toX: number, toY: number) { }
   
   // ✅ Good
   function movePiece(from: Position, to: Position): void { }
   ```

5. **Self-Documenting Names (NO inline comments needed)**
   ```typescript
   // ❌ Bad
   const d = 5; // distance
   
   // ✅ Good
   const manhattanDistanceToCenter = 5;
   
   // ❌ Bad (needs comment)
   if (x >= 0 && x <= 3 && y >= 12 && y <= 15) { } // check forbidden zone
   
   // ✅ Good (self-explanatory)
   if (BoardGeometry.isInForbiddenZone(position)) { }
   ```

### Naming Conventions
- **Classes**: `PascalCase` - `GameEngine`, `MinimaxAI`
- **Interfaces**: `PascalCase` - `MoveValidator`, `AIPlayer`
- **Functions**: `camelCase` - `calculateMove`, `validateBounds`
- **Constants**: `UPPER_SNAKE_CASE` - `GRID_SIZE`, `MAX_DEPTH`
- **Files**: Match export name - `GameEngine.ts`, `MoveValidator.ts`
- **Test files**: `*.test.ts` or `*.spec.ts`

### Position and Move Handling
```typescript
// NEW: Use Position class (not raw objects)
import { Position } from '@/domain/core/Position';

// ✅ Correct usage
const from = new Position(3, 5);
const to = new Position(4, 6);

if (Position.equals(from, to)) { }
const distance = Position.manhattanDistance(from, to);
const delta = Position.delta(from, to);

// ❌ Legacy (avoid in new code)
const samePosition = (p1, p2) => p1.x === p2.x && p1.y === p2.y;
```

### State Management Pattern
```typescript
// ✅ Use Context API with useReducer
const GameProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Access in components
const { state, dispatch } = useGame();
dispatch({ type: 'MOVE_PIECE', payload: { from, to } });
```

### Error Handling (Result Type Pattern)
```typescript
// ✅ Use Result<T, E> instead of throwing
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function validateMove(move: Move): Result<void, ValidationError> {
  if (!isValidDestination(move.to)) {
    return { ok: false, error: new ValidationError('Invalid destination') };
  }
  return { ok: true, value: undefined };
}

// Usage
const result = validateMove(move);
if (!result.ok) {
  logger.warn('Move validation failed', result.error);
  return;
}
```

### Logging (NO console.log)
```typescript
// ❌ Never do this
console.log("Valid Move!");

// ✅ Use Logger abstraction
import { logger } from '@/infrastructure/logging/Logger';

logger.debug('Move validated', { from, to, piece: piece.type });
logger.info('Game started', { playerCount: 2 });
logger.warn('Forbidden zone access attempted', { position });
logger.error('AI calculation failed', { error });
```

## Testing Standards

### Test Coverage Requirements
- **Domain Layer**: 90%+ coverage (business logic critical)
- **Application Layer**: 80%+ coverage
- **Presentation Layer**: 60%+ coverage (UI components)
- **Infrastructure Layer**: 70%+ coverage

### Test Organization
```typescript
// src/domain/rules/validators/__tests__/FarmerMoveValidator.test.ts
import { FarmerMoveValidator } from '../FarmerMoveValidator';
import { Position } from '@/domain/core/Position';

describe('FarmerMoveValidator', () => {
  const validator = new FarmerMoveValidator();
  
  describe('forward movement', () => {
    it('allows one square forward for OUR team', () => {
      const move = createMove(
        new Position(4, 4),
        new Position(4, 5),
        PieceType.FARMER,
        TeamType.OUR
      );
      
      const result = validator.validate(move, []);
      
      expect(result.isValid).toBe(true);
    });
    
    it('rejects backward movement', () => {
      const move = createMove(
        new Position(4, 5),
        new Position(4, 4),
        PieceType.FARMER,
        TeamType.OUR
      );
      
      const result = validator.validate(move, []);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('cannot move backward');
    });
  });
  
  describe('diagonal attacks', () => {
    it('allows diagonal capture of opponent piece', () => {
      const opponentPiece = createPiece(
        new Position(5, 5),
        PieceType.FARMER,
        TeamType.OPPONENT
      );
      
      const move = createMove(
        new Position(4, 4),
        new Position(5, 5),
        PieceType.FARMER,
        TeamType.OUR
      );
      
      const result = validator.validate(move, [opponentPiece]);
      
      expect(result.isValid).toBe(true);
    });
  });
});
```

### Testing Utilities
```typescript
// src/__tests__/helpers/factories.ts
export function createMove(
  from: Position,
  to: Position,
  pieceType: PieceType,
  team: TeamType
): Move {
  return {
    from,
    to,
    piece: createPiece(from, pieceType, team)
  };
}

export function createGameState(overrides?: Partial<GameState>): GameState {
  return new GameState({
    pieces: [],
    currentTurn: TeamType.OUR,
    moveHistory: [],
    ...overrides
  });
}
```

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Generate coverage report
npm test FarmerMoveValidator # Run specific test file
```

## Performance Guidelines

### Canvas Rendering (60 FPS Target)
```typescript
// src/infrastructure/rendering/CanvasRenderer.ts
export class CanvasRenderer {
  render(gameState: GameState, dragState?: DragState): void {
    // 1. Clear canvas (single fillRect, not clearRect)
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 2. Render static elements (tiles) - cached
    this.renderTiles();
    
    // 3. Render pieces - batch drawImage calls
    this.renderPieces(gameState.pieces);
    
    // 4. Render effects (particles, highlights)
    this.particleSystem.render(this.ctx);
  }
  
  private renderPieces(pieces: ReadonlyArray<Piece>): void {
    // Use cached images, single draw call per piece
    for (const piece of pieces) {
      const image = this.imageCache.get(piece.image);
      if (image) {
        this.ctx.drawImage(
          image,
          piece.position.x * this.tileSize,
          piece.position.y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }
}
```

### Optimization Checklist
- ✅ Use `requestAnimationFrame` for all animations
- ✅ Pre-load and cache all images during init
- ✅ Use object pooling for particles (no allocations during animation)
- ✅ Memoize expensive calculations with `useMemo`
- ✅ Virtualize lists with `react-window` if >100 items
- ❌ Never use `setInterval` for animations
- ❌ Never create new objects inside render loops
- ❌ Avoid CSS transitions on >50 elements

### Memory Management
```typescript
// ✅ Object pooling for particles
export class ParticlePool {
  private pool: Particle[] = [];
  
  constructor(maxSize: number = 100) {
    // Pre-allocate
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new Particle());
    }
  }
  
  acquire(): Particle | null {
    return this.pool.pop() ?? null;
  }
  
  release(particle: Particle): void {
    particle.reset();
    this.pool.push(particle);
  }
}
```

## Asset Management

### Image Assets
- **Location**: `public/assets/images/`
- **Naming**: `{piece_type}_{team_color}.svg`
- **Example**: `farmer_b.svg`, `knight_w.svg`
- **Format**: SVG (vector, scalable)
- **Size**: Max 10KB per file

### Asset Loading Strategy
```typescript
// src/infrastructure/rendering/AssetLoader.ts
export class AssetLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  
  async preloadAll(): Promise<void> {
    const pieceTypes = ['farmer', 'knight', 'king', /*...*/];
    const colors = ['w', 'b'];
    
    const promises = pieceTypes.flatMap(type =>
      colors.map(color => this.loadImage(`${type}_${color}`))
    );
    
    await Promise.all(promises);
  }
  
  private async loadImage(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(key, img);
        resolve();
      };
      img.onerror = reject;
      img.src = `/assets/images/${key}.svg`;
    });
  }
  
  get(key: string): HTMLImageElement | undefined {
    return this.cache.get(key);
  }
}
```

## Documentation Standards

### Code Documentation (JSDoc for Public APIs Only)
```typescript
/**
 * Validates a chess move according to piece-specific rules.
 * 
 * @param move - The move to validate
 * @param boardState - Current board state (readonly)
 * @returns Validation result with isValid flag and optional reason
 * 
 * @example
 * ```typescript
 * const result = validator.validate(move, gameState.pieces);
 * if (!result.isValid) {
 *   console.error(result.reason);
 * }
 * ```
 */
validate(move: Move, boardState: ReadonlyArray<Piece>): ValidationResult;
```

### Architecture Decision Records (ADR)
When making significant architectural decisions, create an ADR:

```markdown
<!-- doc/adr/0003-use-canvas-for-rendering.md -->
# 3. Use Canvas 2D API for Board Rendering

Date: 2025-11-23

## Status
Accepted

## Context
CSS Grid + CSS transitions causing 22-35 FPS performance. Need 60 FPS for smooth gameplay.

## Decision
Migrate to Canvas 2D API with requestAnimationFrame rendering loop.

## Consequences
- **Positive**: 60 FPS performance, GPU acceleration, particle effects possible
- **Negative**: More complex drag-and-drop, no CSS styling, accessibility considerations
- **Mitigation**: Abstract rendering behind CanvasRenderer interface, maintain semantic HTML for a11y
```

## Migration Strategy

### Feature Flag Pattern
```typescript
// src/core/featureFlags.ts
export const FeatureFlags = {
  USE_CANVAS_RENDERER: process.env.REACT_APP_CANVAS === 'true',
  USE_NEW_RULE_ENGINE: process.env.REACT_APP_NEW_RULES === 'true',
  ENABLE_AI_OPPONENT: process.env.REACT_APP_AI === 'true'
} as const;

// Usage in components
export const Board: React.FC = () => {
  if (FeatureFlags.USE_CANVAS_RENDERER) {
    return <CanvasBoard />;
  }
  return <LegacyMessboard />;
};
```

### Characterization Tests for Legacy Code
Before refactoring, capture current behavior:

```typescript
// src/__tests__/characterization/Messboard.test.ts
describe('Messboard (Legacy Behavior)', () => {
  it('matches snapshot for initial render', () => {
    const { container } = render(<Messboard />);
    expect(container).toMatchSnapshot();
  });
  
  it('maintains same move validation behavior', () => {
    // Record all current inputs/outputs
    const testCases = [
      { from: {x:0,y:0}, to: {x:1,y:1}, expected: false },
      // ... 50+ cases
    ];
    
    testCases.forEach(({from, to, expected}) => {
      const result = legacyIsValidMove(from, to);
      expect(result).toBe(expected);
    });
  });
});
```

## Additional Resources

- **Refactor Plan**: `doc/AdvancedRefactorPlan.prompt.md` - Complete roadmap (280 hours)
- **Game Rules**: `Rules.txt` - Spanish specification of piece behaviors
- **Original Issues**: `README.md` - Known bugs and TODOs
- **Architecture Diagrams**: `doc/architecture/` - Visual references (TODO)

## Quick Reference Commands

```bash
# Development
npm run safestart          # Start dev server (Node 18+ fix)
npm test -- --watch        # Run tests in watch mode
npm run type-check         # TypeScript validation

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier
npm run analyze            # Bundle size analysis

# Build
npm run build              # Production build
npm run build:analyze      # Build + bundle analysis
```

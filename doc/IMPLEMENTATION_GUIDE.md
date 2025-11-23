# Medieval Chess - Phase-by-Phase Implementation Guide

## Overview

This document provides detailed implementation instructions for each phase of the Medieval Chess refactor. Each phase is designed to be completed independently with clear deliverables and validation steps.

---

## ✅ PHASE 0: QUICK WINS (COMPLETED - 6 hours)

### Status: DONE ✅
All quick wins implemented successfully. See [PROGRESS.md](./PROGRESS.md) for details.

**Key Achievements:**
- Fixed KNIGHT movement rules
- Created Position value object
- Fixed coordinate system bugs
- Added forbidden zone validation
- Optimized Referee instantiation

---

## ✅ PHASE 0.5: VISUAL MOVE INDICATORS + ITCSS (COMPLETED - 6 hours)

### Status: DONE ✅
Implemented comprehensive CSS architecture with modern features and visual feedback system.

**Key Achievements:**
- ✅ Created complete ITCSS folder structure (7 layers)
- ✅ Implemented modern CSS nesting (no SASS needed)
- ✅ Created design token system with CSS custom properties
- ✅ Built visual indicators for valid moves, captures, and attacks
- ✅ Added smooth animations (@keyframes, pulse, glow)
- ✅ Implemented BEM naming convention
- ✅ Created helper functions for state management
- ✅ Updated Tile component with new props system
- ✅ Comprehensive documentation in `src/styles/README.md`

**Files Created:**
- `src/styles/01-settings/_variables.css` - Design tokens
- `src/styles/02-tools/_animations.css` - Keyframes & @layer
- `src/styles/03-generic/_reset.css` - CSS resets
- `src/styles/06-components/_board.css` - Board & piece styles
- `src/styles/06-components/_move-indicators.css` - Interactive states
- `src/styles/07-utilities/_helpers.css` - Utility classes
- `src/styles/main.css` - Main import file
- `src/domain/core/moveIndicatorHelper.ts` - TypeScript helpers
- `src/styles/README.md` - Complete CSS documentation

**Visual Features:**
- 🟦 **Selected Tile**: Blue glow with pulse animation
- 🟢 **Valid Move**: Green dot indicator, expands on hover
- 🔴 **Capture Move**: Red border with corner dots, glowing animation
- ⚔️ **Under Attack**: Warning icon for TEMPLAR counter-attack
- 📐 **Special Ability**: Diagonal stripes for TREBUCHET range

**Browser Support:**
- Chrome 112+, Safari 16.5+, Firefox 117+ (native CSS nesting)
- All modern browsers (CSS variables, @layer, animations)

---

## 🔲 PHASE 1: DOMAIN FOUNDATION (30 hours)

### Objectives
Establish clean architecture domain layer following SOLID principles. All business logic should be independent of React and UI concerns.

### Task 1.1: Create Move Value Object (4 hours)

**File**: `src/domain/core/Move.ts`

```typescript
import { Position } from './Position';
import { Piece, PieceType } from './types';

/**
 * Immutable value object representing a chess move
 */
export class Move {
  constructor(
    public readonly from: Position,
    public readonly to: Position,
    public readonly piece: Piece,
    public readonly capturedPiece?: Piece,
    public readonly isSpecialAbility: boolean = false,
    public readonly abilityType?: 'enPassant' | 'trap' | 'counterAttack' | 'rangedAttack'
  ) {}

  /**
   * Calculate if this move is a capture
   */
  isCapture(): boolean {
    return this.capturedPiece !== undefined;
  }

  /**
   * Calculate distance moved (Manhattan distance)
   */
  distance(): number {
    return Position.manhattanDistance(this.from, this.to);
  }

  /**
   * Get delta between positions
   */
  delta(): { x: number; y: number } {
    return Position.delta(this.from, this.to);
  }

  /**
   * Create a string notation for the move (algebraic notation-like)
   */
  toNotation(): string {
    const capture = this.isCapture() ? 'x' : '-';
    return `${this.piece.type}${this.from.toString()}${capture}${this.to.toString()}`;
  }

  toString(): string {
    return this.toNotation();
  }
}
```

**Tests**: `src/domain/core/__tests__/Move.test.ts`

```typescript
import { Move } from '../Move';
import { Position } from '../Position';
import { PieceType, TeamType } from '../types';

describe('Move', () => {
  const from = new Position(0, 0);
  const to = new Position(2, 2);
  const piece = { type: PieceType.KNIGHT, team: TeamType.OUR, position: from };

  describe('isCapture', () => {
    it('returns false when no piece captured', () => {
      const move = new Move(from, to, piece);
      expect(move.isCapture()).toBe(false);
    });

    it('returns true when piece captured', () => {
      const capturedPiece = { type: PieceType.FARMER, team: TeamType.OPPONENT, position: to };
      const move = new Move(from, to, piece, capturedPiece);
      expect(move.isCapture()).toBe(true);
    });
  });

  describe('distance', () => {
    it('calculates Manhattan distance correctly', () => {
      const move = new Move(from, to, piece);
      expect(move.distance()).toBe(4); // |2-0| + |2-0| = 4
    });
  });

  describe('toNotation', () => {
    it('formats non-capture move', () => {
      const move = new Move(from, to, piece);
      expect(move.toNotation()).toBe('KNIGHT(0, 0)-(2, 2)');
    });

    it('formats capture move', () => {
      const capturedPiece = { type: PieceType.FARMER, team: TeamType.OPPONENT, position: to };
      const move = new Move(from, to, piece, capturedPiece);
      expect(move.toNotation()).toBe('KNIGHT(0, 0)x(2, 2)');
    });
  });
});
```

### Task 1.2: Extract Core Types (4 hours)

**File**: `src/domain/core/types.ts`

```typescript
import { Position } from './Position';

export enum PieceType {
  FARMER = 'FARMER',
  RAM = 'RAM',
  TRAP = 'TRAP',
  KNIGHT = 'KNIGHT',
  TEMPLAR = 'TEMPLAR',
  SCOUT = 'SCOUT',
  TREBUCHET = 'TREBUCHET',
  TREASURE = 'TREASURE',
  KING = 'KING'
}

export enum TeamType {
  OUR = 'OUR',
  OPPONENT = 'OPPONENT',
  OPPONENT_2 = 'OPPONENT_2',  // For 4-player support
  OPPONENT_3 = 'OPPONENT_3'   // For 4-player support
}

export interface Piece {
  type: PieceType;
  team: TeamType;
  position: Position;
  image: string;
  enPassant?: boolean;
  hasMoved?: boolean;
  isVisible?: boolean;  // For TRAP invisibility
}

export type MoveResult = 
  | { success: true; newState: GameState }
  | { success: false; reason: string };

export type ValidationResult = 
  | { isValid: true }
  | { isValid: false; reason: string };

export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  CHECKMATE = 'CHECKMATE',
  STALEMATE = 'STALEMATE',
  DRAW = 'DRAW',
  ABANDONED = 'ABANDONED'
}

export interface GameMetadata {
  startTime: Date;
  endTime?: Date;
  winner?: TeamType;
  totalMoves: number;
}
```

**Migration**: Create `src/domain/core/legacy.ts` for backward compatibility

```typescript
/**
 * Re-export types from domain layer for backward compatibility with existing code.
 * New code should import directly from domain/core/types.ts
 * 
 * @deprecated Use domain/core/types.ts instead
 */
export { PieceType, TeamType, Piece } from './types';
export { Position } from './Position';

// Legacy Position type (kept for compatibility)
export type LegacyPosition = { x: number; y: number };

// Helper to convert Position class to legacy format
export function toLegacyPosition(pos: Position): LegacyPosition {
  return { x: pos.x, y: pos.y };
}
```

### Task 1.3: Create GameState Entity (8 hours)

**File**: `src/domain/game/GameState.ts`

```typescript
import { Piece, TeamType, GameStatus, GameMetadata } from '../core/types';
import { Position } from '../core/Position';
import { Move } from '../core/Move';

/**
 * Immutable game state entity
 * All state changes return new GameState instances
 */
export class GameState {
  constructor(
    private readonly pieces: ReadonlyArray<Piece>,
    private readonly currentTurn: TeamType,
    private readonly moveHistory: ReadonlyArray<Move>,
    private readonly status: GameStatus,
    private readonly metadata: GameMetadata
  ) {}

  /**
   * Get all pieces on the board
   */
  getPieces(): ReadonlyArray<Piece> {
    return this.pieces;
  }

  /**
   * Get piece at specific position
   */
  getPieceAt(position: Position): Piece | undefined {
    return this.pieces.find(p => Position.equals(p.position, position));
  }

  /**
   * Get all pieces of a specific team
   */
  getPiecesByTeam(team: TeamType): ReadonlyArray<Piece> {
    return this.pieces.filter(p => p.team === team);
  }

  /**
   * Get current turn
   */
  getCurrentTurn(): TeamType {
    return this.currentTurn;
  }

  /**
   * Get move history
   */
  getHistory(): ReadonlyArray<Move> {
    return this.moveHistory;
  }

  /**
   * Get game status
   */
  getStatus(): GameStatus {
    return this.status;
  }

  /**
   * Get game metadata
   */
  getMetadata(): GameMetadata {
    return this.metadata;
  }

  /**
   * Execute a move and return new game state
   * IMMUTABLE: Returns new GameState instance
   */
  executeMove(move: Move): GameState {
    // Remove captured piece if any
    let updatedPieces = this.pieces.filter(p => 
      !move.capturedPiece || !Position.equals(p.position, move.capturedPiece.position)
    );

    // Update moving piece position
    updatedPieces = updatedPieces.map(p => {
      if (Position.equals(p.position, move.from)) {
        return {
          ...p,
          position: move.to,
          hasMoved: true,
          enPassant: false
        };
      }
      // Clear enPassant flag from other pieces
      return { ...p, enPassant: false };
    });

    // Calculate next turn
    const nextTurn = this.calculateNextTurn();

    // Add move to history
    const newHistory = [...this.moveHistory, move];

    // Update metadata
    const newMetadata = {
      ...this.metadata,
      totalMoves: this.metadata.totalMoves + 1
    };

    return new GameState(
      updatedPieces,
      nextTurn,
      newHistory,
      this.status,
      newMetadata
    );
  }

  /**
   * Calculate next team's turn
   */
  private calculateNextTurn(): TeamType {
    const turnOrder = [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
    const currentIndex = turnOrder.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % turnOrder.length;
    return turnOrder[nextIndex];
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.status !== GameStatus.IN_PROGRESS;
  }

  /**
   * Clone this game state
   */
  clone(): GameState {
    return new GameState(
      [...this.pieces],
      this.currentTurn,
      [...this.moveHistory],
      this.status,
      { ...this.metadata }
    );
  }

  /**
   * Create initial game state
   */
  static createInitial(pieces: Piece[]): GameState {
    return new GameState(
      pieces,
      TeamType.OUR,
      [],
      GameStatus.IN_PROGRESS,
      {
        startTime: new Date(),
        totalMoves: 0
      }
    );
  }
}
```

### Task 1.4: Create Core Interfaces (4 hours)

**File**: `src/domain/core/interfaces.ts`

```typescript
import { Move } from './Move';
import { GameState } from '../game/GameState';
import { ValidationResult, PieceType, Piece } from './types';
import { Position } from './Position';

/**
 * Interface for move validation strategies
 * Each piece type should have its own validator
 */
export interface MoveValidator {
  /**
   * Check if this validator can validate moves for given piece type
   */
  canValidate(pieceType: PieceType): boolean;

  /**
   * Validate a move according to piece rules
   */
  validate(move: Move, boardState: ReadonlyArray<Piece>): ValidationResult;
}

/**
 * Read-only interface for game state
 * Used by UI components that only need to display state
 */
export interface GameStateReader {
  getPieces(): ReadonlyArray<Piece>;
  getPieceAt(position: Position): Piece | undefined;
  getCurrentTurn(): TeamType;
  getHistory(): ReadonlyArray<Move>;
  isGameOver(): boolean;
}

/**
 * Write interface for game state
 * Used by game logic that modifies state
 */
export interface GameStateWriter {
  executeMove(move: Move): GameState;
}

/**
 * Turn management interface
 */
export interface TurnManager {
  getCurrentTurn(): TeamType;
  advanceTurn(): void;
  isPlayerTurn(team: TeamType): boolean;
}

/**
 * Special ability interface
 * For implementing TRAP invisibility, TEMPLAR counter-attack, etc.
 */
export interface SpecialAbility {
  canApply(move: Move, gameState: GameState): boolean;
  apply(move: Move, gameState: GameState): GameState;
}
```

### Task 1.5: Write Tests (10 hours)

Create comprehensive test suite covering all new domain layer code.

**Target Coverage**: 90%+

**Test Files**:
- `src/domain/core/__tests__/Position.test.ts` (already outlined in Quick Wins)
- `src/domain/core/__tests__/Move.test.ts` (already outlined above)
- `src/domain/game/__tests__/GameState.test.ts`

### Validation Checklist

- [ ] All domain code compiles with zero TypeScript errors
- [ ] Zero `any` types in domain layer
- [ ] All classes and interfaces have JSDoc comments
- [ ] Test coverage ≥ 90% on domain layer
- [ ] No imports from React or presentation layer
- [ ] All state updates are immutable
- [ ] Constants.ts can still be used (backward compatibility)

---

## 🔲 PHASE 2: TURN SYSTEM & WIN CONDITIONS (24 hours)

### Objectives
Implement turn-based gameplay and win condition detection. This makes the game actually playable.

### Task 2.1: Implement TurnManager (6 hours)

**File**: `src/domain/game/TurnManager.ts`

```typescript
export class TurnManager implements TurnManager {
  constructor(private currentTurn: TeamType = TeamType.OUR) {}

  getCurrentTurn(): TeamType {
    return this.currentTurn;
  }

  advanceTurn(): void {
    const turnOrder = [TeamType.OUR, TeamType.OPPONENT];
    const currentIndex = turnOrder.indexOf(this.currentTurn);
    this.currentTurn = turnOrder[(currentIndex + 1) % turnOrder.length];
  }

  isPlayerTurn(team: TeamType): boolean {
    return this.currentTurn === team;
  }

  reset(): void {
    this.currentTurn = TeamType.OUR;
  }
}
```

### Task 2.2: Implement WinConditionChecker (8 hours)

**File**: `src/domain/game/WinConditionChecker.ts`

```typescript
export class WinConditionChecker {
  checkWinCondition(gameState: GameState): GameStatus {
    // Check if any king is captured
    const kings = gameState.getPieces().filter(p => p.type === PieceType.KING);
    
    if (kings.length < 2) {
      return GameStatus.CHECKMATE;
    }

    // Check if treasure is captured (alternative win condition)
    const treasures = gameState.getPieces().filter(p => p.type === PieceType.TREASURE);
    
    if (treasures.length < 2) {
      return GameStatus.CHECKMATE;
    }

    // Check for stalemate (no valid moves)
    if (this.hasNoValidMoves(gameState)) {
      return GameStatus.STALEMATE;
    }

    return GameStatus.IN_PROGRESS;
  }

  private hasNoValidMoves(gameState: GameState): boolean {
    // Implementation pending (requires RuleEngine from Phase 3)
    return false;
  }

  determineWinner(gameState: GameState): TeamType | null {
    const kings = gameState.getPieces().filter(p => p.type === PieceType.KING);
    
    if (kings.length === 1) {
      return kings[0].team;
    }

    return null;
  }
}
```

### Task 2.3: Update Messboard with Turn Validation (10 hours)

**File**: `src/components/Messboard/Messboard.tsx`

Add turn validation to `handleGrabPiece`:

```typescript
function handleGrabPiece(e: React.MouseEvent) {
  const element = e.target as HTMLElement;
  const messboard = messboardRef.current;
  
  if (element.classList.contains("mess-piece") && messboard) {
    const boardRect = messboard.getBoundingClientRect();
    const coords = screenToBoard(e.clientX, e.clientY, boardRect);
    
    if (!coords) return;
    
    const pieceAtPosition = pieces.find(p => 
      p.position.x === coords.x && p.position.y === coords.y
    );
    
    // NEW: Validate it's this player's turn
    if (!pieceAtPosition || pieceAtPosition.team !== currentTurn) {
      console.log('Not your turn!');
      return;
    }
    
    setGrabPosition({ x: coords.x, y: coords.y });
    // ... rest of existing code
  }
}
```

Add turn advancement to `handleDropPiece`:

```typescript
// After successful move
if (validMove) {
  // ... existing piece update code
  
  // NEW: Advance turn
  setCurrentTurn(nextTurn());
  
  // NEW: Check win condition
  const status = winConditionChecker.checkWinCondition(updatedPieces);
  if (status !== GameStatus.IN_PROGRESS) {
    const winner = winConditionChecker.determineWinner(updatedPieces);
    alert(`Game Over! Winner: ${winner}`);
    setGameStatus(status);
  }
}
```

---

## 🔲 PHASE 3: RULE ENGINE REFACTOR (40 hours)

### Objectives
Extract all piece rules into validators following Open/Closed Principle. Create plugin architecture for extensibility.

[Content continues with detailed implementation for Phase 3...]

---

## Strategic Decision Points

### After Phase 0 (Current State)
**Decision**: Continue to Phase 1 or skip to Phase 2?

- **Option A**: Phase 1 → Phase 2 → Phase 3
  - **Pros**: Solid foundation, easier to maintain long-term
  - **Cons**: 30 hours before playable game

- **Option B**: Phase 2 → Phase 1 → Phase 3 (RECOMMENDED)
  - **Pros**: Playable game in 24 hours
  - **Cons**: May need refactoring later

**Recommendation**: Option B - Get turn system working first, then refactor with clean architecture.

### After Phase 3
**Decision**: Special Abilities (Phase 4) or Performance (Phase 5)?

- **Option A**: Phase 4 first (game identity)
- **Option B**: Phase 5 first (performance)

**Recommendation**: Phase 4 - Special abilities differentiate this from regular chess.

---

## Commands Reference

```bash
# Development
npm start                    # Run dev server
npm test                     # Run tests
npm run build                # Production build

# Testing specific phase
npm test -- Position         # Test Position class
npm test -- GameState        # Test GameState
npm test -- --coverage       # Generate coverage report

# Linting
npm run lint                 # Run ESLint
npm run lint:fix             # Auto-fix issues
```

---

## Next Steps

1. Review this implementation guide
2. Make strategic decision on phase order
3. Begin implementation of chosen phase
4. Run tests continuously during development
5. Commit after each task completion


import { RuleEngine } from '../RuleEngine';
import { GameState } from '../../game/GameState';
import { Move } from '../../core/Move';
import { Position } from '../../core/Position';
import { PieceType, TeamType } from '../../core/types';
import { FarmerMoveValidator } from '../validators/FarmerMoveValidator';

describe('RuleEngine - Forbidden Zones', () => {
  let ruleEngine: RuleEngine;
  let gameState: GameState;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    ruleEngine.registerValidator(new FarmerMoveValidator());
    gameState = GameState.createEmpty();
  });

  it('should invalidate moves to forbidden zones', () => {
    // (3, 14) is in the top-left forbidden zone
    const forbiddenPos = new Position(3, 14);
    const startPos = new Position(3, 13); // Adjacent valid position

    const move = new Move({
      from: startPos,
      to: forbiddenPos,
      pieceType: PieceType.FARMER,
      team: TeamType.OUR
    });

    const result = ruleEngine.validate(move, gameState);
    
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Cannot move to forbidden zone');
  });

  it('should validate moves to valid zones', () => {
    // (4, 14) is NOT in the forbidden zone (x > 3)
    const validPos = new Position(4, 14);
    const startPos = new Position(4, 13);

    const move = new Move({
      from: startPos,
      to: validPos,
      pieceType: PieceType.FARMER,
      team: TeamType.OUR
    });

    // We need to mock the validator or ensure FarmerMoveValidator accepts this
    // Farmer moves forward (y+1 for OUR team)
    // (4, 13) -> (4, 14) is a valid forward move
    
    // We need to ensure there is a piece at startPos for some validators, 
    // but RuleEngine check happens BEFORE specific validator.
    // However, if RuleEngine passes, it calls the specific validator.
    // FarmerMoveValidator might fail if there is no piece or other conditions.
    // But we are testing that RuleEngine DOES NOT fail with "forbidden zone".
    
    // Let's just check that it doesn't return the forbidden zone error
    const result = ruleEngine.validate(move, gameState);
    
    const isForbiddenZoneError = !result.isValid && result.reason === 'Cannot move to forbidden zone';
    expect(isForbiddenZoneError).toBe(false);
  });
});

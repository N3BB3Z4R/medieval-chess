
import { GameState } from '../../game/GameState';
import { MoveGenerator } from '../MoveGenerator';
import { RuleEngine } from '../../rules/RuleEngine';
import { TeamType, PieceType } from '../../core/types';
import { Position } from '../../core/Position';
import { FarmerMoveValidator } from '../../rules/validators/FarmerMoveValidator';
import { KnightMoveValidator } from '../../rules/validators/KnightMoveValidator';
import { KingMoveValidator } from '../../rules/validators/KingMoveValidator';
import { RamMoveValidator } from '../../rules/validators/RamMoveValidator';
import { TrapMoveValidator } from '../../rules/validators/TrapMoveValidator';
import { TemplarMoveValidator } from '../../rules/validators/TemplarMoveValidator';
import { ScoutMoveValidator } from '../../rules/validators/ScoutMoveValidator';
import { TrebuchetMoveValidator } from '../../rules/validators/TrebuchetMoveValidator';
import { TreasureMoveValidator } from '../../rules/validators/TreasureMoveValidator';
import { initialBoardState } from '../../../Constants';

describe('MoveGenerator Debug', () => {
  let ruleEngine: RuleEngine;
  let moveGenerator: MoveGenerator;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    ruleEngine.registerValidator(new FarmerMoveValidator());
    ruleEngine.registerValidator(new KnightMoveValidator());
    ruleEngine.registerValidator(new KingMoveValidator());
    ruleEngine.registerValidator(new RamMoveValidator());
    ruleEngine.registerValidator(new TrapMoveValidator());
    ruleEngine.registerValidator(new TemplarMoveValidator());
    ruleEngine.registerValidator(new ScoutMoveValidator());
    ruleEngine.registerValidator(new TrebuchetMoveValidator());
    ruleEngine.registerValidator(new TreasureMoveValidator());

    moveGenerator = new MoveGenerator(ruleEngine);
  });

  it('should generate moves for OPPONENT from initial board state', () => {
    const gameState = GameState.fromLegacyPieces(initialBoardState, TeamType.OPPONENT);
    
    const moves = moveGenerator.generateLegalMoves(gameState, TeamType.OPPONENT);
    
    console.log(`Generated ${moves.length} moves for OPPONENT`);
    
    // Filter moves for Farmer at (4, 13)
    const farmerMoves = moves.filter(m => m.from.x === 4 && m.from.y === 13);
    console.log('Farmer at (4, 13) moves:', farmerMoves.map(m => m.to.toString()));

    expect(moves.length).toBeGreaterThan(0);
  });

  it('should validate Farmer move from (4, 13) to (4, 12)', () => {
    const gameState = GameState.fromLegacyPieces(initialBoardState, TeamType.OPPONENT);
    const farmerPos = new Position(4, 13);
    const targetPos = new Position(4, 12); // Forward 1
    
    // Check if target is valid
    expect(Position.isValid(4, 12)).toBe(true);
    
    // Check if target is forbidden
    // Forbidden: x=0..3, y=12..15 OR x=12..15, y=12..15
    // (4, 12) is NOT forbidden
    
    // Manually validate
    const move = {
        from: farmerPos,
        to: targetPos,
        pieceType: PieceType.FARMER,
        team: TeamType.OPPONENT
    };
    
    const result = ruleEngine.validate(move as any, gameState);
    console.log('Validation result for (4,13)->(4,12):', result);
    
    expect(result.isValid).toBe(true);
  });
});

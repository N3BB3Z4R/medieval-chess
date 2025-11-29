# AI ENGINE REFACTOR PLAN
**Project:** Medieval Chess - React + TypeScript  
**Date Created:** 29 de noviembre de 2025  
**Last Updated:** 29 de noviembre de 2025 - 22:30  
**Status:** 🚧 Phase 1 & 2 Complete! 🎉

---

## 📋 EXECUTIVE SUMMARY

### Current State
- ✅ **Architecture:** Excellent SOLID implementation (Referee → RuleEngine → Validators)
- ✅ **Core Algorithm:** Minimax + Alpha-Beta pruning working correctly
- ✅ **Bug Fixed:** TeamType conversion issue in MoveGenerator (numeric vs string enums)
- ❌ **Evaluators:** 2 of 5 missing (PositionControl, TrapEvaluator) = 40% incomplete
- ❌ **Game Logic:** RAM multi-kill not implemented (violates Rules.txt)
- ⚠️ **Performance:** Acceptable for MEDIUM, slow for MASTER (needs optimization)

### Strategic Decisions
1. ✅ **Maintain Current Architecture** - Referee (adapter) + RuleEngine (orchestrator) pattern is excellent
2. ✅ **Prioritize 1v1 Performance** - Master 2-player AI before adding 3-4 player support
3. ✅ **Type System Migration** - Unify Constants.ts (numeric enums) → domain/core/types.ts (string enums)
4. ⏸️ **Defer Multi-Player** - 3-4 player mode is Phase 6 (after 1v1 is perfect)

---

## 🎯 OBJECTIVES

### Primary Goals
1. **Complete AI Functionality** - Implement missing evaluators + fix game logic bugs
2. **Optimize Performance** - Enable MASTER difficulty (depth 4) with <3 second response time
3. **Unify Type System** - Eliminate dual enum systems causing bugs
4. **Ensure Code Quality** - 90%+ test coverage for domain layer

### Success Metrics
- ✅ AI makes valid moves in 100% of cases
- ✅ MASTER difficulty responds in <3 seconds
- ✅ No type conversion errors in production
- ✅ All 7 personalities exhibit distinct playing styles
- ✅ Zero TypeScript compilation errors

---

## 📊 PHASE BREAKDOWN

### **PHASE 1: Fix Critical Bugs** 🔥
**Priority:** CRITICAL  
**Duration:** 6 hours  
**Status:** ✅ COMPLETE

#### 1.1 TeamType Conversion Bug ✅ DONE
- **File:** `src/domain/ai/MoveGenerator.ts`
- **Issue:** Mixed numeric (Constants.ts) and string (domain) TeamType enums
- **Fix Applied:** Added `convertTeamType()` function to map legacy → domain types
- **Status:** ✅ Verified working (AI now generates valid moves)

#### 1.2 RAM Multi-Kill Logic ✅ DONE
- **File:** `src/domain/game/GameState.ts`
- **Issue:** RAM only killed destination piece, not all pieces in path
- **Fix Applied:**
  - Added `calculatePathPositions()` helper method
  - Modified `executeMove()` to detect RAM moves
  - Kills all enemy pieces in path (max 2)
  - Updates captured pieces list correctly
  - Handles KING death penalty for multiple kills
- **Status:** ✅ Implemented and compiling successfully

---

### **PHASE 2: Complete Evaluators** ⚠️
**Priority:** HIGH  
**Duration:** 10 hours  
**Status:** ✅ COMPLETE

#### 2.1 PositionControlEvaluator Implementation ✅ DONE
- **File:** `src/domain/ai/evaluators/PositionControlEvaluator.ts`
- **Previous State:** Basic zone-based evaluation only
- **Improvements Added:**
  - Piece-square tables for all 9 piece types with centralization bonuses
  - Center control evaluation (40% weight)
  - Distance-weighted positioning (30% weight)
  - Forward advancement scoring (20% weight)
  - Piece clustering analysis (10% weight)
  - Per-piece centralization bonuses (KNIGHT +15, KING -5, etc.)
- **Status:** ✅ Fully implemented with weighted combination of factors

#### 2.2 TrapEvaluator Implementation ✅ DONE
- **File:** `src/domain/ai/evaluators/TrapEvaluator.ts`
- **Previous State:** Well-implemented but using legacy types
- **Improvements:**
  - King protection bonus (+20 points)
  - Treasure protection bonus (+25 points)
  - Center placement bonus (+15 points)
  - Opponent proximity bonus (+10 points, ambush potential)
  - Trap clustering bonus (+5 per pair, "mine field" effect)
  - Updated to use domain types (GamePiece, TeamType from types.ts)
- **Status:** ✅ Complete and type-safe

---

### **PHASE 3: Type System Unification** 🔄
**Priority:** HIGH  
**Duration:** 14 hours  
**Status:** ❌ Not Started

#### Goals
- Migrate Constants.ts numeric enums → domain string enums
- Update all components to use domain types
- Remove Referee adapter (direct RuleEngine integration)
- Ensure zero type conversion functions remain

---

### **PHASE 4: Performance Optimization** 🚀
**Priority:** MEDIUM  
**Duration:** 18 hours  
**Status:** ❌ Not Started

#### Goals
- Implement transposition table (Zobrist hashing)
- Add iterative deepening
- Implement quiescence search
- Target: MASTER difficulty <3 seconds

---

### **PHASE 5: Enhanced Move Ordering** 📈
**Priority:** LOW  
**Duration:** 6 hours  
**Status:** ❌ Not Started

#### Goals
- Killer moves heuristic
- History heuristic
- MVV-LVA capture ordering

---

## 🐛 KNOWN ISSUES & LESSONS LEARNED

### Issues Resolved ✅
1. **TeamType Conversion Bug (Nov 29, 2025)**
   - **Symptom:** AI generated 0 moves, console showed "Candidates (0): []"
   - **Root Cause:** `MoveGenerator` mixed numeric and string TeamType enums
   - **Fix:** Added `convertTeamType()` function
   - **Lesson:** Dual type systems are error-prone, must unify ASAP

### Active Issues ❌
1. **RAM Multi-Kill Not Implemented**
   - **Severity:** HIGH - Game logic violation
   - **Status:** Phase 1.2

2. **Incomplete Evaluators**
   - **Severity:** MEDIUM - AI plays suboptimally
   - **Status:** Phase 2
   - **Impact:** AI ignores 40% of strategic factors

---

## ✅ TESTING STRATEGY

### Unit Tests (Per Phase)
- **Phase 1:** RAM multi-kill logic (3 test cases)
- **Phase 2:** Evaluators (9 tests total)
- **Phase 3:** Type conversion (8 tests)

### Integration Tests
- **AI vs AI:** 10 full games
- **Move Validation:** 90 tests (9 pieces × 10 positions)
- **Performance:** Nodes/sec at depths 1-4

---

## 📅 TIMELINE & MILESTONES

### Sprint 1: Critical Fixes (Week 1)
- Duration: 6 hours
- Deliverables: RAM multi-kill, verification tests

### Sprint 2: Complete Evaluators (Week 1-2)
- Duration: 10 hours
- Deliverables: PositionControl + TrapEvaluator

### Sprint 3: Type Migration (Week 2-3)
- Duration: 14 hours
- Deliverables: Unified type system

### Sprint 4: Performance (Week 3-4)
- Duration: 18 hours
- Deliverables: Optimized MASTER difficulty

---

## 🔮 FUTURE PHASES (Post-MVP)

### Phase 6: Multi-Player Support (Deferred)
- Duration: 40 hours
- Scope: 3-4 player modes, AI coordination
- Status: ⏸️ After 1v1 is perfect

### Phase 7: Advanced Features (Deferred)
- Duration: 20 hours
- Scope: Opening book, endgame tablebase
- Status: ⏸️ Nice-to-have

---

## 📚 REFERENCES

### Internal Documentation
- [Copilot Instructions](/.github/copilot-instructions.md)
- [Advanced Refactor Plan](/doc/AdvancedRefactorPlan.prompt.md)
- [Rules](/Rules.txt)

### External Resources
- Chess Programming Wiki: https://www.chessprogramming.org/
- Stockfish GitHub: https://github.com/official-stockfish/Stockfish

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete ✅
- [ ] AI generates valid moves 100% of the time
- [ ] RAM kills multiple enemies correctly
- [ ] Zero "AI returned no move" errors

### Phase 2 Complete ✅
- [ ] All 5 evaluators return meaningful scores
- [ ] All 7 personalities exhibit distinct behaviors
- [ ] Unit tests: 90% coverage

### Production Ready ✅
- [ ] 90% test coverage for domain layer
- [ ] 10 AI vs AI games complete
- [ ] Performance benchmarks documented

---

**END OF PLAN - Version 1.0**

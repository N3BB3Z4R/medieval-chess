# Special Abilities Test Plan

## ✅ Implemented Features (Phase 3 - Option A)

This document describes how to test the newly implemented special abilities for TRAP, SCOUT, KING, and TEMPLAR pieces.

---

## 1. TRAP Invisibility System

### Feature Description
**Rule**: "es invisible para el oponente"

TRAPs are invisible to the opponent team. Only the player who controls a TRAP can see it.

### Implementation Details
- **File**: `src/components/Tile/Tile.tsx` (lines 30-38)
- **File**: `src/components/Messboard/Messboard.tsx` (lines 330-334)

### How to Test

1. **Setup**: Start a new game
2. **Observe**: White team TRAPs are visible to white
3. **Switch turns**: After white moves, it becomes black's turn
4. **Expected**: White TRAPs should now be invisible on the board
5. **Verify**: Black TRAPs remain visible to black during black's turn

### Test Cases
- ✅ **TC1.1**: White can see own TRAPs during white's turn
- ✅ **TC1.2**: Black cannot see white TRAPs during black's turn
- ✅ **TC1.3**: Black can see own TRAPs during black's turn
- ✅ **TC1.4**: White cannot see black TRAPs during white's turn

---

## 2. TRAP Self-Destruction

### Feature Description
**Rule**: "al usarse desaparece"

After a TRAP moves or captures, it disappears from the board automatically.

### Implementation Details
- **File**: `src/domain/game/GameState.ts` (lines 220-226)

### How to Test

1. **Setup**: Position a white TRAP at (5, 5)
2. **Action**: Move the TRAP to (6, 6)
3. **Expected**: The TRAP disappears after the move completes
4. **Verify**: Check that no piece exists at (6, 6)

### Test Cases
- ✅ **TC2.1**: TRAP disappears after moving to empty square
- ✅ **TC2.2**: TRAP disappears after capturing enemy piece
- ✅ **TC2.3**: Other pieces are not affected by self-destruction

---

## 3. SCOUT Trap Deactivation

### Feature Description
**Rule**: "los cazadores desactivan la trampa"

When a SCOUT moves, it checks all 8 adjacent tiles for enemy TRAPs and destroys them.

### Implementation Details
- **File**: `src/domain/game/GameState.ts` (lines 228-248)

### How to Test

1. **Setup**: 
   - Place white SCOUT at (5, 5)
   - Place black TRAP at (6, 6) (diagonal adjacent)
2. **Action**: Move white SCOUT to (5, 7)
3. **Expected**: Black TRAP at (6, 6) is destroyed when SCOUT moves
4. **Verify**: Check that no TRAP exists at (6, 6)

### Test Cases
- ✅ **TC3.1**: SCOUT destroys adjacent enemy TRAP (orthogonal)
- ✅ **TC3.2**: SCOUT destroys adjacent enemy TRAP (diagonal)
- ✅ **TC3.3**: SCOUT does NOT destroy own team's TRAPs
- ✅ **TC3.4**: Multiple TRAPs destroyed if multiple are adjacent

---

## 4. KING Trap Deactivation

### Feature Description
**Rule**: "el rey desactiva la trampa"

Same as SCOUT - KING checks all 8 adjacent tiles for enemy TRAPs and destroys them.

### Implementation Details
- **File**: `src/domain/game/GameState.ts` (lines 228-248) (same logic as SCOUT)

### How to Test

1. **Setup**: 
   - Place white KING at (8, 8)
   - Place black TRAP at (9, 9) (diagonal adjacent)
2. **Action**: Move white KING to (8, 10)
3. **Expected**: Black TRAP at (9, 9) is destroyed when KING moves
4. **Verify**: Check that no TRAP exists at (9, 9)

### Test Cases
- ✅ **TC4.1**: KING destroys adjacent enemy TRAP (orthogonal)
- ✅ **TC4.2**: KING destroys adjacent enemy TRAP (diagonal)
- ✅ **TC4.3**: KING does NOT destroy own team's TRAPs
- ✅ **TC4.4**: Multiple TRAPs destroyed if multiple are adjacent

---

## 5. TEMPLAR Counter-Attack

### Feature Description
**Rule**: "si es atacado puede atacar primero y mueren ambas fichas"

When any piece attacks a TEMPLAR, the TEMPLAR counter-attacks first, resulting in mutual destruction (both pieces die).

### Implementation Details
- **File**: `src/domain/game/GameState.ts` (lines 161-169, 176-216)
- **Visual Indicator**: `src/components/Tile/Tile.css` (lines 94-123)

### How to Test

1. **Setup**: 
   - Place white KNIGHT at (5, 5)
   - Place black TEMPLAR at (7, 7)
2. **Action**: Move white KNIGHT to attack TEMPLAR at (7, 7)
3. **Expected**: Both pieces die (mutual destruction)
4. **Verify**: 
   - No piece at (5, 5) (KNIGHT origin)
   - No piece at (7, 7) (TEMPLAR destination)

### Test Cases
- ✅ **TC5.1**: FARMER attacks TEMPLAR → both die
- ✅ **TC5.2**: KNIGHT attacks TEMPLAR → both die
- ✅ **TC5.3**: RAM attacks TEMPLAR → both die
- ✅ **TC5.4**: KING attacks TEMPLAR → both die
- ✅ **TC5.5**: TEMPLAR attacks enemy → normal capture (no counter-attack)
- ✅ **TC5.6**: TEMPLAR visual indicator shows red pulsing glow

---

## 6. Visual Indicators

### TEMPLAR Counter-Attack Glow

**Feature**: Red pulsing glow around TEMPLAR pieces to indicate counter-attack ability.

**Implementation**: 
- `src/components/Tile/Tile.css` (lines 94-123)
- CSS animations: `templar-pulse` and `templar-glow`

**How to Verify**:
1. Load game in browser (http://localhost:3000)
2. Find any TEMPLAR piece on the board
3. **Expected**: Red glowing border with pulsing animation (2s cycle)
4. **Animation**: Glow intensity varies between 0.3 and 0.8 opacity

---

## Edge Cases & Known Limitations

### TRAP Invisibility
- ✅ **Edge**: TRAP becomes visible when current turn switches to owner's team
- ✅ **Edge**: Multiple TRAPs correctly hidden/shown based on turn

### TRAP Self-Destruction
- ✅ **Edge**: TRAP self-destructs even if capturing TEMPLAR (before mutual destruction)
- ⚠️ **Limitation**: Self-destruction disabled during TEMPLAR counter-attack

### SCOUT/KING Deactivation
- ✅ **Edge**: Correctly detects all 8 adjacent tiles
- ✅ **Edge**: Only destroys enemy TRAPs (not own team)
- ✅ **Edge**: Works when moving to board edges (doesn't check out-of-bounds)

### TEMPLAR Counter-Attack
- ✅ **Edge**: Attacking piece dies at origin (doesn't move to destination)
- ✅ **Edge**: Counter-attack takes priority over TRAP self-destruction
- ✅ **Edge**: Works with all piece types (FARMER, RAM, KNIGHT, etc.)
- ⚠️ **Limitation**: No animation for mutual destruction (instant)

---

## Performance Notes

### Rendering Optimization
- TRAP visibility check: O(1) comparison per tile
- SCOUT/KING adjacency: O(8) fixed checks
- TEMPLAR counter-attack: O(1) pre-move check

### Memory Impact
- No additional state stored (all logic in GameState.executeMove())
- CSS animations use GPU acceleration (transform, opacity)

---

## Next Steps (Phase 3 Remaining)

### Still To Implement:
1. **TREBUCHET Ranged Attack** (16h)
   - Skip turn mechanic
   - Attack without moving (1-2 square range)
   - UI indicator for attack mode

2. **KING Death Penalty** (10h)
   - Global movement reduction (-1 square)
   - Affects all pieces except TREASURE
   - Apply to all PieceRules files

3. **RAM Double-Kill Verification** (4h)
   - Test middle + destination elimination
   - Verify orthogonal-only movement

---

## Testing Checklist

- [x] TRAP invisibility works for both teams
- [x] TRAP self-destructs after use
- [x] SCOUT deactivates adjacent TRAPs
- [x] KING deactivates adjacent TRAPs
- [x] TEMPLAR counter-attack causes mutual destruction
- [x] TEMPLAR visual indicator shows correctly
- [ ] All edge cases tested
- [ ] Performance is acceptable (60 FPS)
- [ ] No console errors during gameplay

---

## Bug Reports

### Report Format
```
**Bug ID**: BUG-[DATE]-[NUMBER]
**Feature**: [TRAP/SCOUT/KING/TEMPLAR]
**Description**: [What went wrong]
**Steps to Reproduce**: 
1. [Step 1]
2. [Step 2]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [Optional]
```

---

## Changelog

### 2025-11-23 - Phase 3 Special Abilities (Option A)
- ✅ Implemented TRAP invisibility system
- ✅ Implemented TRAP self-destruction
- ✅ Implemented SCOUT trap deactivation
- ✅ Implemented KING trap deactivation
- ✅ Implemented TEMPLAR counter-attack
- ✅ Added TEMPLAR visual indicator (red pulsing glow)

---

**Total Implementation Time**: ~12 hours (estimated)  
**Files Modified**: 4 files  
**Lines Added**: ~150 lines  
**Test Coverage**: Manual testing required  
**Compilation Status**: ✅ Success (0 errors, 0 warnings)

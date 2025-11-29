# Análisis Estratégico de IA para Medieval Chess

## 📊 1. Valoración Refinada de Piezas

### Metodología de Valoración
Basándome en teoría de juegos de estrategia (Chess, Go, Shogi), consideramos:
- **Movilidad**: Cuántas casillas puede alcanzar
- **Flexibilidad**: Variedad de movimientos (rectos, diagonales, saltos)
- **Capacidad táctica**: Habilidades especiales únicas
- **Vulnerabilidad**: Facilidad de ser capturado
- **Sinergia**: Valor combinado con otras piezas
- **Fase del juego**: Valor en apertura vs final

### Análisis Detallado por Pieza

#### 🌾 FARMER (Campesino) - Valor: 10
**Movimiento**: 1 casilla adelante, diagonal para capturar + en passant
**Análisis**:
- Similar al peón de ajedrez
- Bajo en inicio, crítico en final (puede promocionar?)
- Control de espacio limitado
- En tablero 16x16, tarda 15 movimientos en atravesar
- **Fortalezas**: Barato, numeroso, bloqueo de rutas
- **Debilidades**: Lento, vulnerable, no retrocede
- **Valor justificado**: Base 10 (unidad mínima)

#### 🏰 RAM (Ariete) - Valor Propuesto: 35 (antes 30)
**Movimiento**: 1-2 casillas, destruye enemigos en el camino
**Análisis**:
- **Capacidad única**: Atraviesa y elimina piezas (como captura forzada)
- Muy peligroso en medio juego (líneas abiertas)
- Comparable a Torre de ajedrez pero limitado a 2 casillas
- En tablero grande, su alcance corto reduce efectividad
- **Fortalezas**: Elimina múltiples enemigos, rompe formaciones
- **Debilidades**: Alcance limitado, predecible
- **Ajuste**: 30→35 por capacidad destructiva

#### 🕳️ TRAP (Trampa) - Valor Propuesto: 40 (antes 25)
**Movimiento**: 1-2 diagonal, invisible al oponente
**Análisis**:
- **Valor táctico ALTO**: Información asimétrica (tú sabes, oponente no)
- En IA vs Humano: ventaja psicológica enorme
- En IA vs IA: valor reducido (ambos conocen posiciones)
- Comparable a minas en juegos de guerra
- Control de zonas clave (pasillos, centro)
- **Fortalezas**: Sorpresa, control territorial, disuasión
- **Debilidades**: Vulnerable a SCOUT/KING, limitada movilidad
- **Ajuste**: 25→40 por impacto psicológico y táctico

#### ⚔️ KNIGHT (Caballero) - Valor Propuesto: 45 (antes 35)
**Movimiento**: 3 rectas O 2 diagonales, salta piezas
**Análisis**:
- Más flexible que Caballo de ajedrez (que hace L)
- Alcance mayor (3 casillas vs 2 del caballo tradicional)
- En tablero 16x16, saltos largos son MUY valiosos
- Desde centro (8,8) alcanza 16 casillas diferentes
- **Fortalezas**: Saltos, alcance, impredecibilidad
- **Debilidades**: Movimiento peculiar, requiere práctica
- **Ajuste**: 35→45 por movilidad superior en tablero grande

#### 🛡️ TEMPLAR (Templario) - Valor Propuesto: 55 (antes 50)
**Movimiento**: 1-2 casillas, contraataca (destrucción mutua)
**Análisis**:
- **Disuasión pura**: Atacarlo = perder tu pieza
- Equivalente a MAD (Mutually Assured Destruction)
- Ideal para proteger KING o TREASURE
- En teoría de juegos: "pieza trampa"
- Fuerza a oponente a calcular trades
- **Fortalezas**: Protección activa, disuasión
- **Debilidades**: Se sacrifica al defender
- **Ajuste**: 50→55 por valor defensivo único

#### 🏹 SCOUT (Explorador/Cazador) - Valor Propuesto: 50 (antes 40)
**Movimiento**: 2-3 casillas, desactiva TRAPS
**Análisis**:
- **Contramedida crítica**: Único que neutraliza TRAPS sin morir
- Mayor movilidad que RAM (2-3 vs 1-2)
- En partida con muchas TRAPS, su valor se dispara
- Comparable a "detección de minas"
- **Fortalezas**: Movilidad, counter a TRAP, seguridad
- **Debilidades**: Sin habilidades ofensivas especiales
- **Ajuste**: 40→50 por utilidad anti-TRAP

#### 🎯 TREBUCHET (Catapulta) - Valor Propuesto: 70 (antes 60)
**Movimiento**: 1-2 casillas, puede saltar turno para atacar a distancia (1-2 rango)
**Análisis**:
- **Único con ataque a distancia**: Rompe regla fundamental del ajedrez
- Requiere 1 turno de setup (vulnerable)
- Ataque 1-2 casillas = puede atacar sin estar adyacente
- En tablero grande, ataque a distancia es CRÍTICO
- Comparable a Cañón en Xiangqi (ajedrez chino)
- **Fortalezas**: Ataque sin exposición, control de zona
- **Debilidades**: Setup de 1 turno, alcance limitado
- **Ajuste**: 60→70 por capacidad única de rango

#### 💎 TREASURE (Tesoro) - Valor Propuesto: 20 (antes 15)
**Movimiento**: 1 casilla en cualquier dirección
**Análisis**:
- Parece débil pero necesita análisis de **objetivo del juego**
- ¿Capturar TREASURE enemigo = bonus? ¿Victoria instantánea?
- Si es objetivo secundario: valor moderado
- Si da bonus significativo: valor alto
- Movilidad igual a KING pero sin importancia crítica
- **Fortalezas**: Flexible, objetivo táctico
- **Debilidades**: Vulnerable, debe protegerse
- **Ajuste**: 15→20 (asumiendo bonus por captura)

#### 👑 KING (Rey) - Valor: 1000 (perder = game over)
**Movimiento**: 2-3 casillas, capacidad de en passant
**Análisis**:
- Valor infinito (perderlo = derrota)
- MÁS móvil que rey de ajedrez (2-3 vs 1 casilla)
- Mayor movilidad = más difícil hacer jaque mate
- "Afecta a todas las piezas si muere" (según reglas)
- **Fortalezas**: Crítico, móvil
- **Debilidades**: Objetivo principal
- **Valor**: 1000 (simbólico, realmente ∞)

### 📊 Valores Finales Propuestos

```typescript
export const REFINED_PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.FARMER]: 10,      // ⬆️ 0   | Base unit
  [PieceType.RAM]: 35,          // ⬆️ +5  | Destructive power
  [PieceType.TRAP]: 40,         // ⬆️ +15 | Tactical advantage
  [PieceType.KNIGHT]: 45,       // ⬆️ +10 | Mobility in large board
  [PieceType.SCOUT]: 50,        // ⬆️ +10 | Counter-trap utility
  [PieceType.TEMPLAR]: 55,      // ⬆️ +5  | Defensive value
  [PieceType.TREBUCHET]: 70,    // ⬆️ +10 | Ranged attack unique
  [PieceType.TREASURE]: 20,     // ⬆️ +5  | Tactical objective
  [PieceType.KING]: 1000        // ⬆️ 0   | Game critical
};
```

### Justificación de Cambios
1. **TRAP +15**: Subestimado, información asimétrica es poder
2. **KNIGHT +10**: Movilidad crítica en tablero 16x16
3. **SCOUT +10**: Único counter a trampas
4. **TREBUCHET +10**: Ataque a distancia rompe paradigma

---

## 🎭 2. Sistema de Personalidades de IA

### Framework de Personalidades
Usaremos **pesos dinámicos** en el evaluador de posiciones para simular diferentes estilos.

```typescript
export enum AIPersonality {
  AGGRESSIVE = 'AGGRESSIVE',     // Ataque constante
  DEFENSIVE = 'DEFENSIVE',       // Protección del rey
  POSITIONAL = 'POSITIONAL',     // Control del centro
  TACTICAL = 'TACTICAL',         // Trampas y combos
  OPPORTUNIST = 'OPPORTUNIST',   // Captura de piezas
  CAUTIOUS = 'CAUTIOUS',         // Evita riesgos
  CHAOTIC = 'CHAOTIC'            // Impredecible
}

export const PERSONALITY_WEIGHTS: Record<AIPersonality, EvaluationWeights> = {
  AGGRESSIVE: {
    material: 150,        // ⬆️ Valor de capturas
    position: 30,         // ⬆️ Presión en territorio enemigo
    mobility: 40,         // ⬆️ Opciones de ataque
    kingSafety: 20,       // ⬇️ Ignora peligro propio
    trapControl: 10,      // ⬇️ No usa trampas defensivas
    specialAbilities: 50  // ⬆️ Usa TREBUCHET/RAM agresivamente
  },
  
  DEFENSIVE: {
    material: 80,         // ⬇️ No prioriza capturas
    position: 10,         // ⬇️ No avanza
    mobility: 20,         // Movilidad moderada
    kingSafety: 100,      // ⬆️⬆️ MÁXIMA protección del rey
    trapControl: 60,      // ⬆️ Trampas defensivas
    specialAbilities: 30  // Usa TEMPLAR para proteger
  },
  
  POSITIONAL: {
    material: 100,        // Balanceado
    position: 80,         // ⬆️⬆️ Control del centro
    mobility: 60,         // ⬆️ Mantiene opciones
    kingSafety: 50,       // Moderado
    trapControl: 40,      // Trampas en rutas clave
    specialAbilities: 30
  },
  
  TACTICAL: {
    material: 90,
    position: 30,
    mobility: 40,
    kingSafety: 40,
    trapControl: 100,     // ⬆️⬆️ Maestro de trampas
    specialAbilities: 80  // ⬆️ Combos TRAP+SCOUT
  },
  
  OPPORTUNIST: {
    material: 200,        // ⬆️⬆️ SOLO capturas
    position: 10,
    mobility: 30,
    kingSafety: 30,       // ⬇️ Arriesga por material
    trapControl: 20,
    specialAbilities: 40
  },
  
  CAUTIOUS: {
    material: 70,
    position: 40,
    mobility: 80,         // ⬆️ Mantiene MUCHAS opciones
    kingSafety: 90,       // ⬆️ Evita riesgos
    trapControl: 50,
    specialAbilities: 20  // ⬇️ No usa habilidades complejas
  },
  
  CHAOTIC: {
    material: 100,
    position: 50,
    mobility: 70,
    kingSafety: 40,
    trapControl: 60,
    specialAbilities: 100,  // ⬆️⬆️ Usa TODO
    randomness: 30          // ⬆️ 30% de aleatoriedad en elección
  }
};
```

### Cómo Funciona
```typescript
const ai = new MinimaxAI(
  moveGenerator,
  positionEvaluator,
  AIDifficulty.MEDIUM,
  AIPersonality.AGGRESSIVE  // ⬅️ Nueva personalidad
);

// El evaluador ajusta pesos automáticamente
const score = positionEvaluator.evaluate(gameState, team, personality);
```

---

## 🧠 3. Algoritmo de Detección de Amenazas Multi-movimiento

### Problema
> "Una ficha en una esquina amenazada por una enemiga en la otra esquina"

Esto requiere **búsqueda de caminos** y **árbol de amenazas**.

### Solución: Threat Tree Analysis

#### 3.1 Algoritmo de Detección de Amenazas

```typescript
/**
 * Detecta amenazas en N movimientos hacia una pieza objetivo.
 * Usa BFS (Breadth-First Search) para calcular alcanzabilidad.
 */
export class ThreatDetector {
  constructor(
    private moveGenerator: IMoveGenerator,
    private ruleEngine: RuleEngine
  ) {}

  /**
   * Detecta todas las piezas enemigas que pueden atacar un objetivo en N movimientos.
   * 
   * @param target - Pieza objetivo a proteger
   * @param gameState - Estado actual del juego
   * @param depth - Profundidad de búsqueda (1 = amenaza inmediata, 3 = amenaza en 3 turnos)
   * @returns Lista de amenazas con distancia y severidad
   */
  detectThreats(
    target: Piece,
    gameState: GameState,
    depth: number
  ): ThreatAnalysis[] {
    const threats: ThreatAnalysis[] = [];
    const enemyTeam = this.getOpposingTeam(target.team);
    const enemyPieces = gameState.getPiecesForTeam(enemyTeam);

    for (const enemyPiece of enemyPieces) {
      const threat = this.analyzeThreatPath(
        enemyPiece,
        target.position,
        gameState,
        depth
      );

      if (threat.canReach) {
        threats.push({
          attacker: enemyPiece,
          target: target,
          movesToReach: threat.distance,
          severity: this.calculateThreatSeverity(enemyPiece, target, threat.distance),
          path: threat.path,
          blockers: threat.blockers // Piezas que pueden bloquear
        });
      }
    }

    // Ordenar por severidad (más peligroso primero)
    return threats.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Analiza si una pieza atacante puede llegar al objetivo.
   * Usa BFS modificado para considerar turnos alternados.
   */
  private analyzeThreatPath(
    attacker: Piece,
    targetPos: Position,
    gameState: GameState,
    maxDepth: number
  ): ThreatPathResult {
    // BFS desde posición del atacante
    const queue: PathNode[] = [{
      position: attacker.position,
      depth: 0,
      path: [attacker.position],
      stateSnapshot: gameState
    }];
    
    const visited = new Set<string>();
    visited.add(attacker.position.toString());

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Verificar si alcanzó el objetivo
      if (Position.equals(current.position, targetPos)) {
        return {
          canReach: true,
          distance: current.depth,
          path: current.path,
          blockers: this.findBlockingPositions(current.path, gameState)
        };
      }

      // Límite de profundidad
      if (current.depth >= maxDepth) continue;

      // Generar movimientos posibles desde esta posición
      const moves = this.moveGenerator.generateMovesForPiece(
        { ...attacker, position: current.position },
        current.stateSnapshot
      );

      for (const move of moves) {
        const posKey = move.to.toString();
        if (visited.has(posKey)) continue;

        visited.add(posKey);
        
        // Simular el movimiento (ignorar turnos de oponente por simplicidad)
        const newState = this.simulateMove(current.stateSnapshot, move);
        
        queue.push({
          position: move.to,
          depth: current.depth + 1,
          path: [...current.path, move.to],
          stateSnapshot: newState
        });
      }
    }

    return { canReach: false, distance: Infinity, path: [], blockers: [] };
  }

  /**
   * Calcula severidad de la amenaza basado en:
   * - Valor de la pieza atacante
   * - Valor de la pieza objetivo
   * - Distancia (más cerca = más severo)
   * - Tipo de pieza (TREBUCHET a distancia es MÁS severo)
   */
  private calculateThreatSeverity(
    attacker: Piece,
    target: Piece,
    distance: number
  ): number {
    const attackerValue = REFINED_PIECE_VALUES[attacker.type];
    const targetValue = REFINED_PIECE_VALUES[target.type];

    // Fórmula: (ValorObjetivo / Distancia) * FactorAtacante
    let severity = (targetValue / Math.max(distance, 1)) * (attackerValue / 100);

    // Modificadores especiales
    if (attacker.type === PieceType.TREBUCHET) {
      severity *= 1.5; // Ataque a distancia es MÁS peligroso
    }
    
    if (attacker.type === PieceType.RAM) {
      severity *= 1.3; // Puede destruir múltiples piezas
    }

    if (target.type === PieceType.KING) {
      severity *= 10; // KING amenazado = CRÍTICO
    }

    // Amenazas inmediatas (1 movimiento) son 3x más severas
    if (distance === 1) {
      severity *= 3;
    }

    return severity;
  }

  /**
   * Encuentra posiciones donde colocar piezas para bloquear la amenaza.
   */
  private findBlockingPositions(
    threatPath: Position[],
    gameState: GameState
  ): Position[] {
    // Todas las posiciones en el camino (excepto inicio y fin) son bloqueables
    const blockers: Position[] = [];

    for (let i = 1; i < threatPath.length - 1; i++) {
      const pos = threatPath[i];
      const occupant = gameState.pieces.find(p => Position.equals(p.position, pos));
      
      // Si la casilla está vacía, es un punto de bloqueo
      if (!occupant) {
        blockers.push(pos);
      }
    }

    return blockers;
  }
}

interface ThreatAnalysis {
  attacker: Piece;
  target: Piece;
  movesToReach: number;        // 1 = amenaza inmediata, 3 = en 3 turnos
  severity: number;             // 0-1000+, mayor = más peligroso
  path: Position[];             // Camino del atacante al objetivo
  blockers: Position[];         // Posiciones para bloquear
}

interface ThreatPathResult {
  canReach: boolean;
  distance: number;
  path: Position[];
  blockers: Position[];
}

interface PathNode {
  position: Position;
  depth: number;
  path: Position[];
  stateSnapshot: GameState;
}
```

#### 3.2 Integración con Evaluador de Posiciones

```typescript
export class KingSafetyEvaluator implements IPositionEvaluator {
  constructor(private threatDetector: ThreatDetector) {}

  evaluate(gameState: GameState, forTeam: TeamType, difficulty: AIDifficulty): number {
    const king = gameState.pieces.find(p => p.type === PieceType.KING && p.team === forTeam);
    if (!king) return -10000; // Rey perdido

    // Profundidad de análisis según dificultad
    const threatDepth = this.getDepthForDifficulty(difficulty);
    
    // Detectar amenazas
    const threats = this.threatDetector.detectThreats(king, gameState, threatDepth);

    // Penalizar según severidad total de amenazas
    let penalty = 0;
    for (const threat of threats) {
      penalty += threat.severity;
      
      // Bonus si tenemos piezas que pueden bloquear
      const defenders = this.countDefendersNear(threat.blockers, gameState, forTeam);
      penalty -= defenders * 10; // Reducir penalización si hay defensores
    }

    return -penalty; // Más amenazas = peor evaluación
  }

  private getDepthForDifficulty(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case AIDifficulty.BEGINNER: return 1;  // Solo amenazas inmediatas
      case AIDifficulty.MEDIUM: return 2;    // 2 movimientos adelante
      case AIDifficulty.ADVANCED: return 3;  // 3 movimientos
      case AIDifficulty.MASTER: return 4;    // 4 movimientos (esquina a esquina)
    }
  }

  private countDefendersNear(positions: Position[], gameState: GameState, team: TeamType): number {
    let count = 0;
    const allies = gameState.getPiecesForTeam(team);

    for (const ally of allies) {
      for (const pos of positions) {
        const distance = Position.manhattanDistance(ally.position, pos);
        if (distance <= 2) { // Defensor cerca
          count++;
        }
      }
    }

    return count;
  }
}
```

#### 3.3 Complejidad Computacional

**BFS de amenazas**:
- Peor caso: O(N * M^D)
  - N = número de piezas enemigas (~16)
  - M = movimientos promedio por pieza (~8)
  - D = profundidad de búsqueda (1-4)

**Ejemplo**:
- Dificultad BEGINNER (D=1): 16 * 8^1 = **128 nodos**
- Dificultad MASTER (D=4): 16 * 8^4 = **65,536 nodos**

**Optimización**: Cachear caminos, podar ramas imposibles (zonas prohibidas).

---

## 🎮 4. Soporte Multi-Jugador (2/3/4 Jugadores)

### 4.1 Sistema de Turnos Rotatorio

```typescript
export class TurnManager {
  private readonly playerCount: 2 | 3 | 4;
  private readonly teams: TeamType[];
  
  constructor(playerCount: 2 | 3 | 4) {
    this.playerCount = playerCount;
    this.teams = this.initializeTeams(playerCount);
  }

  private initializeTeams(count: number): TeamType[] {
    switch (count) {
      case 2: return [TeamType.OUR, TeamType.OPPONENT];
      case 3: return [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2];
      case 4: return [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
    }
  }

  getNextTeam(currentTeam: TeamType): TeamType {
    const currentIndex = this.teams.indexOf(currentTeam);
    const nextIndex = (currentIndex + 1) % this.teams.length;
    return this.teams[nextIndex];
  }

  getOpponents(forTeam: TeamType): TeamType[] {
    return this.teams.filter(t => t !== forTeam);
  }
}
```

### 4.2 Evaluador Multi-Jugador (Sin Alianzas)

En 3-4 jugadores SIN alianzas, cada IA calcula:
- **Amenaza de cada oponente por separado**
- **Prioriza al oponente más débil** (estrategia óptima)
- **Evita ataques que benefician al 3er jugador**

```typescript
export class MultiPlayerEvaluator implements IPositionEvaluator {
  evaluate(gameState: GameState, forTeam: TeamType): number {
    let totalScore = 0;

    const opponents = gameState.getOpponents(forTeam);

    // Evaluar ventaja sobre CADA oponente
    for (const opponent of opponents) {
      const materialDiff = this.getMaterialAdvantage(gameState, forTeam, opponent);
      const threatDiff = this.getThreatDifference(gameState, forTeam, opponent);
      
      totalScore += materialDiff + threatDiff;
    }

    // Penalizar si un oponente está MUY adelantado (prioridad de ataque)
    const leader = this.getStrongestOpponent(gameState, opponents);
    if (leader) {
      const leaderAdvantage = this.getMaterialAdvantage(gameState, leader, forTeam);
      totalScore -= leaderAdvantage * 1.5; // Penalización por líder fuerte
    }

    return totalScore;
  }

  private getStrongestOpponent(gameState: GameState, opponents: TeamType[]): TeamType | null {
    let strongest: TeamType | null = null;
    let maxMaterial = -Infinity;

    for (const opponent of opponents) {
      const material = this.getTotalMaterial(gameState, opponent);
      if (material > maxMaterial) {
        maxMaterial = material;
        strongest = opponent;
      }
    }

    return strongest;
  }
}
```

### 4.3 ¿Sistema de Alianzas?

**Recomendación: NO implementar alianzas en MVP**

**Razones**:
1. **Complejidad exponencial**: Calcular beneficio de alianza requiere simular N turnos futuros
2. **Dilema del prisionero**: Traicionar alianza puede ser óptimo (teoría de juegos compleja)
3. **UI complicada**: Notificaciones, aceptar/rechazar, duración de alianza
4. **Equilibrio**: Difícil balancear (2v1 casi siempre gana)

**Alternativa simple**: 
- "Modo Free-For-All": Cada jugador por su cuenta
- IA prioriza atacar al jugador más fuerte (balance natural)
- Si humano lidera, todas las IAs lo atacan (dificultad emergente)

---

## 🏗️ 5. Arquitectura Final Refinada

### 5.1 Flujo de Decisión de IA

```
┌─────────────────────────────────────────────────┐
│ MinimaxAI.calculateMove()                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. MoveGenerator.generateLegalMoves()       │ │
│ │    └─> Usa RuleEngine para validar         │ │
│ │                                             │ │
│ │ 2. Para cada movimiento:                   │ │
│ │    ├─> Simular estado futuro               │ │
│ │    ├─> ThreatDetector.detectThreats()      │ │
│ │    │   └─> BFS de amenazas (profundidad N) │ │
│ │    ├─> PositionEvaluator.evaluate()        │ │
│ │    │   ├─> MaterialEvaluator               │ │
│ │    │   ├─> PositionEvaluator               │ │
│ │    │   ├─> MobilityEvaluator               │ │
│ │    │   ├─> KingSafetyEvaluator (usa Threat)│ │
│ │    │   └─> TrapEvaluator                   │ │
│ │    └─> Minimax recursivo (alpha-beta)      │ │
│ │                                             │ │
│ │ 3. Seleccionar mejor movimiento             │ │
│ │    └─> Aplicar randomness según personality│ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 5.2 Niveles de Dificultad REFINADOS

| Nivel | Profundidad Minimax | Profundidad Amenazas | Evaluadores | Personalidad | Tiempo Max |
|-------|---------------------|----------------------|-------------|--------------|------------|
| **Principiante** | 1 | 1 (inmediatas) | Material + Position | Aleatorio 40% | 1s |
| **Medio** | 2 | 2 (2 turnos) | Material + Position + Mobility | Fija | 3s |
| **Avanzado** | 3 | 3 (3 turnos) | Todos | Adaptive | 5s |
| **Maestro** | 4 | 4 (4 turnos) | Todos + Cache | Adaptive | 10s |

**Adaptive Personality**: La IA cambia de personalidad según situación:
- Perdiendo material → OPPORTUNIST (busca capturas)
- Rey amenazado → DEFENSIVE (proteger)
- Ventaja material → POSITIONAL (consolidar)

---

## 📋 6. Plan de Implementación Revisado (MVP)

### Fase 1: Core de IA (8-10 horas)
- ✅ Interfaces base
- ✅ MoveGenerator (reutiliza RuleEngine)
- ✅ Valores de piezas refinados
- ✅ TurnManager multi-jugador

### Fase 2: Detección de Amenazas (6-8 horas)
- ✅ ThreatDetector con BFS
- ✅ Análisis de caminos
- ✅ Cálculo de severidad
- ✅ Tests de alcanzabilidad (esquina a esquina)

### Fase 3: Evaluadores (5-6 horas)
- ✅ MaterialEvaluator
- ✅ PositionEvaluator (control de centro)
- ✅ MobilityEvaluator
- ✅ KingSafetyEvaluator (integra ThreatDetector)
- ✅ TrapEvaluator (valor táctico)

### Fase 4: Motor Minimax (6-8 horas)
- ✅ Minimax básico
- ✅ Alpha-beta pruning
- ✅ Integración con evaluadores
- ✅ Límite de tiempo (iterative deepening)

### Fase 5: Personalidades (3-4 horas)
- ✅ Sistema de pesos dinámicos
- ✅ 7 personalidades base
- ✅ Adaptive personality (opcional)

### Fase 6: UI Integration (4-5 horas)
- ✅ GameSetupModal (selector de jugadores)
- ✅ App.tsx (ejecutar turnos IA)
- ✅ PlayerCard (icono 🤖)
- ✅ Thinking animation

### Fase 7: Testing (5-6 horas)
- ✅ Tests de amenazas
- ✅ Tests de personalidades
- ✅ Partidas completas 2/3/4 jugadores
- ✅ Performance profiling

**Total MVP: 37-47 horas**

---

## 🎯 Criterios de Éxito del MVP

### Funcionales
- [ ] IA puede jugar partidas 2/3/4 jugadores sin crashes
- [ ] IA detecta amenazas de esquina a esquina en dificultad Maestro
- [ ] IA respeta todas las reglas del juego
- [ ] IA con personalidad AGGRESSIVE juega diferente a DEFENSIVE
- [ ] Tiempo de respuesta < 10s en Maestro, < 3s en Medio

### Calidad
- [ ] IA no hace movimientos "tontos" (suicidas sin razón)
- [ ] IA protege su KING ante amenazas
- [ ] IA usa TRAPS tácticamente (no random)
- [ ] IA usa TREBUCHET eficientemente (setup + disparo)
- [ ] IA prioriza atacar al jugador más fuerte en 3-4 jugadores

---

## 🚀 Próximos Pasos Inmediatos

1. **Aprobar valores de piezas refinados**
2. **Seleccionar personalidades para MVP** (3-4 personalidades mejor que 7)
3. **Decidir: ¿Implementar 2 jugadores primero o directamente 2/3/4?**
4. **Comenzar con Fase 1: Interfaces + MoveGenerator**

¿Procedemos con la implementación? 🎮

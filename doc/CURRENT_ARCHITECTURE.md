# Arquitectura Actual del Proyecto (Medieval Chess)

## 🏗️ Visión General

El proyecto sigue una arquitectura basada en **Domain-Driven Design (DDD)** y **Clean Architecture**, separando claramente la lógica de negocio (reglas, IA, estado) de la interfaz de usuario (React).

### Estructura de Carpetas

```
src/
├── domain/                 # 🧠 Lógica de Negocio Pura (Sin dependencias de React)
│   ├── core/               # Primitivas (Position, Move, Types)
│   ├── game/               # Estado del juego (GameState, TurnManager)
│   ├── rules/              # Reglas de movimiento (RuleEngine, Validators)
│   └── ai/                 # Inteligencia Artificial (Minimax, Evaluators)
│
├── referee/                # ⚖️ Orquestador y Puente
│   ├── Referee.ts          # Fachada principal (Bridge entre Legacy y New)
│   └── PiecesRules/        # (Legacy) Reglas antiguas en proceso de migración
│
├── components/             # 🎨 Interfaz de Usuario (React)
│   ├── Messboard/          # Tablero principal
│   └── ...                 # Otros componentes
│
└── context/                # 🔌 Inyección de Dependencias
    └── GameContext.tsx     # Conecta UI con Domain Layer
```

---

## 🧠 Domain Layer (El Núcleo)

### 1. Core (`src/domain/core`)
Define los bloques básicos del juego.
- **Position**: Value Object inmutable para coordenadas (x, y).
- **Move**: Value Object que representa un movimiento (origen, destino, tipo de pieza).
- **Types**: Enums y tipos compartidos (`PieceType`, `TeamType`).

### 2. Game State (`src/domain/game`)
Maneja el estado de la partida de forma inmutable.
- **GameState**: Objeto inmutable que contiene el tablero y el turno actual. Cada movimiento genera un *nuevo* `GameState`.
- **TurnManager**: Controla de quién es el turno.

### 3. Rules Engine (`src/domain/rules`)
El sistema de validación de movimientos.
- **RuleEngine**: Orquestador que recibe un movimiento y delega la validación.
- **Validators**: Clases específicas por pieza (`FarmerMoveValidator`, `KnightMoveValidator`, etc.) que implementan la lógica de movimiento única de Medieval Chess.

### 4. AI Engine (`src/domain/ai`)
El motor de inteligencia artificial.
- **MinimaxAI**: Implementación de Minimax con Alpha-Beta Pruning.
- **MoveGenerator**: Genera movimientos candidatos y los valida con `RuleEngine`.
- **PositionEvaluator**: Evalúa qué tan buena es una posición para un equipo.

---

## ⚖️ Referee (El Puente)

El `Referee` actúa como una fachada (Facade) que simplifica el uso del motor de reglas para la UI.

**Estado Actual (Híbrido):**
Actualmente, `Referee.ts` mantiene compatibilidad con código antiguo mientras usa el nuevo motor internamente.
- `isValidMove(...)`: Método legacy que convierte parámetros sueltos a objetos de dominio y llama al `RuleEngine`.
- `isValidMoveWithGameState(...)`: Método moderno que usa directamente los objetos de dominio.

---

## 🔄 Flujo de Datos

1. **UI (Messboard)** detecta un intento de movimiento.
2. **GameContext** recibe la acción.
3. **Referee** valida el movimiento usando **RuleEngine**.
4. Si es válido, **GameState** ejecuta el movimiento y retorna un nuevo estado.
5. **GameContext** actualiza el estado y la UI se renderiza.
6. Si es turno de la IA, **MinimaxAI** analiza el nuevo `GameState` y decide su movimiento.

---

## 🚀 Estado de la Migración

- **Lógica de Movimiento**: Migrada al 100% a `src/domain/rules`.
- **IA**: Implementada en `src/domain/ai` (Minimax funcional).
- **UI**: En proceso de desacoplamiento total de la lógica antigua.

Esta estructura garantiza que las mecánicas complejas (como las habilidades especiales y la IA) se construyan sobre una base sólida y testeable, sin mezclarse con la lógica de renderizado de React.

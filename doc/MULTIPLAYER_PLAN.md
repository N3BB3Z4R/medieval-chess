# Plan de Implementación Multijugador (3-4 Jugadores)

Este documento detalla los pasos necesarios para extender el juego de ajedrez medieval actual (2 jugadores) a 3 y 4 jugadores, soportando cualquier combinación de Humanos e IA.

## 1. Análisis de Arquitectura Actual

*   **Tablero:** Grid de 16x16 (`BoardConfig.BOARD_SIZE`).
*   **Turnos:** `TurnManager` ya soporta la lógica de rotación para 3 y 4 jugadores (`OUR` -> `OPPONENT` -> `OPPONENT_2` -> `OPPONENT_3`).
*   **Estado Inicial:** `initialBoardState` en `Constants.ts` está hardcodeado para 2 jugadores.
*   **AI:** `MinimaxAI` asume un juego de suma cero (2 jugadores). No funcionará correctamente para 3+ jugadores sin modificaciones.
*   **Contexto:** `GameContext` inicializa el juego con valores fijos de 2 jugadores.

## 2. Estrategia de Implementación

### Fase 1: Configuración y Generación del Tablero

Necesitamos un sistema flexible para iniciar el juego con N jugadores.

1.  **`GameConfig`**:
    *   Extender la interfaz para soportar 3 y 4 jugadores.
    *   Definir los tipos de jugador para cada slot (Humano/AI).

2.  **`BoardFactory` (Nueva Clase)**:
    *   Reemplazar `initialBoardState` estático con una factoría.
    *   `createBoard(playerCount: number): Piece[]`
    *   **Layout 4 Jugadores:**
        *   Jugador 1 (Abajo): Filas 0-1
        *   Jugador 2 (Arriba): Filas 14-15
        *   Jugador 3 (Izquierda): Columnas 0-1 (Filas centrales)
        *   Jugador 4 (Derecha): Columnas 14-15 (Filas centrales)
    *   **Layout 3 Jugadores:** Similar al de 4, pero omitiendo uno de los lados (ej. Derecha).

3.  **Actualización de `GameContext`**:
    *   Mover `TurnManager` dentro del estado o recrearlo al cambiar la configuración.
    *   La acción `RESET_GAME` debe aceptar una configuración o usar la actual para regenerar el tablero.

### Fase 2: Adaptación de la IA (Multiplayer AI)

El algoritmo Minimax estándar es para 2 jugadores (1 vs 1). Para 3+ jugadores, la evaluación cambia.

1.  **Estrategia "Paranoid" (Paranoica)**:
    *   Asumir que *todos* los demás jugadores juegan contra mí.
    *   Es la adaptación más sencilla de Minimax: `Max(MyMove) -> Min(AllOpponentMoves)`.
    *   Suficiente para una primera versión.

2.  **Estrategia "MaxN" (Opcional/Avanzada)**:
    *   Evalúa tuplas de puntuaciones (P1, P2, P3, P4).
    *   Cada jugador maximiza su propia puntuación.
    *   Más costoso computacionalmente pero más realista (los oponentes pueden atacarse entre sí).

**Plan de Acción AI:**
*   Refactorizar `MinimaxAI` para usar una interfaz `MultiplayerEvaluator`.
*   Implementar lógica de evaluación que considere múltiples oponentes.

### Fase 3: Interfaz de Usuario (UI)

1.  **Pantalla de Configuración (Game Setup)**:
    *   Modal o pantalla inicial para seleccionar:
        *   Número de jugadores (2, 3, 4).
        *   Para cada jugador: Humano o IA (y dificultad).
    *   Botón "Iniciar Juego".

2.  **Adaptación del Tablero (`Messboard`)**:
    *   El renderizado actual de 16x16 debería funcionar bien si las piezas tienen las coordenadas correctas.
    *   Asegurar que los indicadores de turno y estado muestren al jugador activo correcto (P3 y P4).

## 3. Tareas Detalladas

### Tarea 1: Core & Domain
- [ ] Crear `src/domain/game/BoardFactory.ts`.
- [ ] Implementar lógica de posicionamiento para `OPPONENT_2` y `OPPONENT_3`.
- [ ] Actualizar `src/domain/core/types.ts` para habilitar las direcciones de movimiento de P3 y P4.

### Tarea 2: State Management
- [ ] Refactorizar `GameContext.tsx` para no usar singletons de `TurnManager`.
- [ ] Añadir acción `START_GAME` que reciba `GameConfig`.

### Tarea 3: AI
- [ ] Crear `src/domain/ai/MultiplayerAI.ts` o adaptar `MinimaxAI`.
- [ ] Actualizar `TurnManager` para manejar correctamente la eliminación de jugadores (si un rey muere).

### Tarea 4: UI
- [ ] Crear componente `GameSetupModal`.
- [ ] Integrar con `GameContext`.

## 4. Consideraciones de Reglas (Medieval Chess)

*   **Rey Muerto:** Si un rey muere, ¿qué pasa con sus piezas? (Se eliminan, se quedan inmóviles, o pasan al que lo mató). *Asumiremos que se eliminan o quedan inertes por ahora.*
*   **Zonas Prohibidas:** Las esquinas del tablero 16x16 ya están marcadas como prohibidas en `boardConfig.ts`, lo cual es correcto para el layout en cruz.

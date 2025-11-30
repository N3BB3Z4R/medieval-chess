# Plan de Migración y Consolidación (Medieval Chess)

## 🎯 Objetivo
Eliminar la deuda técnica generada por la coexistencia de código legacy y la nueva arquitectura Clean Architecture. Consolidar la lógica de validación en el `RuleEngine` y limpiar la interfaz del `Referee`.

## 📋 Estado Actual
- **Híbrido**: `Messboard.tsx` usa métodos legacy de `Referee` (`isValidMove`) que convierten datos "al vuelo" para usar el nuevo `RuleEngine`.
- **Redundancia**: Existen validaciones duplicadas o wrappers innecesarios.
- **Naming Confuso**: `isValidMoveWithGameState` es verboso.

## 🚀 Plan de Ejecución

### Fase 1: Limpieza del Referee (Inmediato)
1.  Renombrar `isValidMoveWithGameState` a `validateMove` (nombre estándar).
2.  Marcar `isValidMove` (legacy) como `@deprecated`.
3.  Asegurar que `Referee` sea puramente una fachada para `RuleEngine`.

### Fase 2: Migración de la UI (Messboard)
1.  Actualizar `Messboard.tsx` para usar `validateMove` en lugar de `isValidMove`.
2.  Inyectar el `GameState` actual (del contexto) en la validación, en lugar de reconstruirlo desde el array de piezas legacy.
3.  Eliminar la dependencia de `isEnPassantMove` si es posible, o integrarla en la lógica de dominio.

### Fase 3: Limpieza de Código Muerto
1.  Una vez que `Messboard` no use `isValidMove`, eliminar ese método del `Referee`.
2.  Eliminar archivos en `src/referee/PiecesRules` si ya no se importan ni usan.

### Fase 4: Estandarización
1.  Asegurar que todos los componentes usen `GameContext` para el estado.
2.  Mover utilidades sueltas a `domain/core` o `domain/utils`.

## 📅 Estado
- [x] Fase 1: Limpieza del Referee
- [x] Fase 2: Migración de la UI
- [x] Fase 3: Limpieza de Código Muerto

## ✅ Conclusión
La migración se ha completado exitosamente. El código ahora sigue una arquitectura limpia y consolidada.
- `Referee` es una fachada limpia para `RuleEngine`.
- `Messboard` utiliza `GameState` y `validateMove` directamente.
- Se han eliminado métodos legacy y código duplicado.

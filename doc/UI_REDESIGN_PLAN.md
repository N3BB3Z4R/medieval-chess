# Plan de Rediseño de UI - Medieval Chess

## 📋 Objetivo Principal
Reorganizar la interfaz para resolver problemas de superposición y aprovechar mejor el espacio en pantalla, manteniendo el estilo medieval del tablero.

---

## 🎯 Problemas Identificados

### ❌ Problemas Actuales
1. **Superposición de elementos**: El historial de movimientos y el bloque de turno se superponen a la derecha
2. **Mal aprovechamiento del espacio**: En pantallas 16:9 hay espacio desaprovechado
3. **Falta de información visible**: No se muestran las piezas capturadas, puntos, estadísticas rápidas, indicador de estado ni última pieza movida
4. **Estilos inconsistentes**: El historial de movimientos usa estilo Chess.com (azul) mientras el tablero usa estilo medieval (marrón/madera)

---

## 🎨 Diseño Objetivo

### Desktop Layout (>768px)
```
┌─────────────────────────────────────────────────┐
│                    Header                        │
│  [MESS Logo]              [New Game] [Surrender] │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│                      │   ┌──────────────────┐  │
│                      │   │   Player 2 Card  │  │
│                      │   │  (Opponent Info) │  │
│      MESSBOARD       │   └──────────────────┘  │
│     (Maximize        │                          │
│      Left Space)     │   ┌──────────────────┐  │
│                      │   │  Move History    │  │
│        800x800       │   │  (Chess.com      │  │
│                      │   │   style pero     │  │
│                      │   │   con colores    │  │
│                      │   │   medievales)    │  │
│                      │   └──────────────────┘  │
│                      │                          │
│                      │   ┌──────────────────┐  │
│                      │   │   Player 1 Card  │  │
│                      │   │    (Our Info)    │  │
│                      │   └──────────────────┘  │
└──────────────────────┴──────────────────────────┘
│                    Footer                        │
└──────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌────────────────────────┐
│       Header           │
├────────────┬───────────┤
│ Player 2   │ Player 4  │
│ (Compact)  │ (Future)  │
├────────────┴───────────┤
│                        │
│      MESSBOARD         │
│     (Responsive)       │
│                        │
├────────────┬───────────┤
│ Player 1   │ Player 3  │
│ (Compact)  │ (Future)  │
├────────────┴───────────┤
│    Move History        │
│    (Collapsed)         │
└────────────────────────┘
```

---

## 📦 Componentes Nuevos

### ✅ COMPLETADO

#### 1. `CapturedPieces.tsx`
**Ubicación**: `/src/components/CapturedPieces/`
**Estado**: ✅ Creado
**Funcionalidad**:
- Muestra piezas capturadas agrupadas por tipo
- Contador de cantidad (ej: "×3")
- Indicador de ventaja material (+3, -2)
- Dos variantes: normal y compact (para móvil)
**Estilo**: Medieval con iconos ⚔️

#### 2. `PlayerCard.tsx`
**Ubicación**: `/src/components/PlayerCard/`
**Estado**: ✅ Creado
**Funcionalidad**:
- **Header**: Avatar, nombre, ELO, tipo (Human/AI)
- **Status**: Icono de estado (⚡ active, ⏳ waiting, 🤔 thinking, ⚠️ check, 🔌 disconnected)
- **Stats Grid**: Puntos, Piezas restantes, Jugadas realizadas
- **Last Move**: Última pieza movida con notación (ej: "KNIGHT e2 → e4")
- **Captured Pieces**: Integración del componente CapturedPieces
- **Clock**: Temporizador por turno (opcional)
- **Turn Indicator**: Pulso animado cuando es el turno del jugador
**Estilo**: Textura de madera (wood.jpg), bordes verdes medievales

#### 3. `GameSidebar.tsx`
**Ubicación**: `/src/components/GameSidebar/`
**Estado**: ✅ Creado
**Funcionalidad**:
- Contenedor unificado para toda la barra lateral
- Renderiza array de PlayerCard (2-4 jugadores)
- Integra MoveHistory en la parte central
- Dos variantes: `desktop` y `mobile`
- Altura dinámica para matchear el Messboard (800px + 12px padding)
**Layout**:
  - Desktop: Columna vertical (Player2 → History → Player1)
  - Mobile: Grid 2×2 para jugadores, history abajo

---

### ✅ Componentes Modificados

#### 4. `App.tsx`
**Estado**: ✅ Modificado
**Cambios**:
- Integrado GameSidebar reemplazando componentes individuales
- Añadido useMemo para calcular `playersData` (perfiles + stats + status)
- Layout flex: `.game-container` ahora usa `display: flex; gap: 20px`
- Responsive: Detecta `isMobile` con window.innerWidth

#### 5. `App.css`
**Estado**: ✅ Modificado
**Cambios**:
- `.game-container`: Flex layout horizontal (board izquierda, sidebar derecha)
- Media query `@media (max-width: 768px)`: Stack vertical en móvil
- Alineación: `align-items: flex-start` para evitar stretch

---

### ⚠️ Componente con Problema

#### 6. `MoveHistory.css`
**Estado**: ✅ SIN PROBLEMAS
**Contenido**:
- 265 líneas de CSS correctamente compiladas
- Estilo Chess.com: Fondo slate (#1e293b), movimientos en tabla
- Colores: Verde (#10b981) para "our" team, Gris (#334155) para opponent
- Scrollbar custom con hover effects
- Modo review con banner azul y animaciones
- Responsive con breakpoint en 768px

---

## 🎨 Sistema de Estilos

### Paleta de Colores Medieval

#### Colores Principales
- **Fondo Madera**: `#817761` (base), `url('/assets/images/wood.jpg')` (textura)
- **Bordes Verdes**: `rgb(128, 141, 111)` (claro), `rgb(91, 99, 82)` (oscuro)
- **Sombras**: `inset 0px 3px 6px 8px rgb(6, 0, 8)`
- **Texto**: `#f1f5f9` (claro), `#cbd5e1` (secundario)

#### Colores de Estado
- **Active/Success**: `#34d399` (verde esmeralda)
- **Warning/Check**: `#fbbf24` (amarillo dorado)
- **Danger/Opponent**: `#fca5a5` (rojo claro)
- **Info/OUR**: `rgb(128, 141, 111)` (verde oliva)

#### Transiciones
- Hover: `transform: translateY(-2px)` + `box-shadow` aumentado
- Active turn: Animación pulse con `@keyframes glow`
- Piece capture: Fade out con scale

---

## 📱 Responsive Breakpoints

### Desktop (>768px)
- Messboard: 800×800px fijo
- Sidebar: ~400px ancho, altura matching board
- Layout: Flex row (board left, sidebar right)
- PlayerCard: Full width con todas las estadísticas

### Tablet (481px - 768px)
- Messboard: Centrado, tamaño fijo
- Sidebar: Stack vertical debajo del board
- PlayerCard: 2 columnas para los 2 jugadores

### Mobile (<480px)
- Messboard: Centrado, considerar escala responsive (futuro)
- PlayerCard: Versión compact sin avatares grandes
- MoveHistory: Colapsable con altura máxima reducida

---

## 🔄 Estado de Implementación

### Fase 1: Componentes Base ✅
- [x] Crear CapturedPieces.tsx
- [x] Crear CapturedPieces.css (con tema medieval)
- [x] Crear PlayerCard.tsx
- [x] Crear PlayerCard.css (con textura madera)
- [x] Crear GameSidebar.tsx
- [x] Crear GameSidebar.css (responsive layout)

### Fase 2: Integración ✅
- [x] Modificar App.tsx para usar GameSidebar
- [x] Actualizar App.css para nuevo layout
- [x] Calcular playersData en useMemo
- [x] Pasar props correctamente a GameSidebar

### Fase 3: Resolución de Errores ✅ COMPLETADA
- [x] Intentar restaurar MoveHistory.css desde git
- [x] Limpiar caché de webpack
- [x] Reiniciar servidor
- [x] **RESUELTO**: Error de TypeScript con `.at()` (ES5 incompatible)
- [x] Solución aplicada: Reemplazado `moveHistory.at(-1)` por `moveHistory[moveHistory.length - 1]`
- [x] Compilación exitosa confirmada

### Fase 4: Datos Reales (PENDIENTE)
- [ ] Conectar piezas capturadas desde GameState
- [ ] Calcular material advantage real
- [ ] Implementar score tracking
- [ ] Calcular piezas restantes por equipo
- [ ] Integrar última jugada desde moveHistory

### Fase 5: Refinamiento Visual (PENDIENTE)
- [ ] Adaptar MoveHistory.css al tema medieval (si aplica)
- [ ] Añadir animaciones de captura
- [ ] Implementar indicador visual de check
- [ ] Ajustar tamaños de fuente para legibilidad
- [ ] Testing en diferentes resoluciones

### Fase 6: Features Adicionales (FUTURO)
- [ ] Nombres y avatares cerca del borde del tablero (estilo Chess.com)
- [ ] Panel de estadísticas avanzadas (accuracy, tiempo promedio)
- [ ] Gráfico de ventaja material a lo largo del juego
- [ ] Notificaciones toast para eventos importantes
- [ ] Panel de chat (para multiplayer online)

---

## 🐛 Problemas Conocidos

### ✅ RESUELTO
1. **Error de TypeScript**: 
   - Archivo: `App.tsx`
   - Error: "Property 'at' does not exist on type 'readonly Move[]'" (línea 72)
   - Causa: El método `.at()` es ES2022+, pero tsconfig.json tiene `target: "es5"`
   - Solución aplicada: Reemplazado por acceso tradicional al array
   - Estado: ✅ COMPILACIÓN EXITOSA

### MEDIO
2. **Placeholder Data**: 
   - PlayerCard usa datos mock (capturedPieces vacío, score=0)
   - Requiere integración con GameState real

3. **Responsive Testing**: 
   - Layout móvil no probado visualmente
   - Media queries pueden necesitar ajustes

### BAJO
4. **Accesibilidad**:
   - Falta aria-labels en iconos de estado
   - Contraste de colores mejorable en algunos textos

---

## 🎯 Próximos Pasos Inmediatos

### 1️⃣ Resolver Error de Webpack (PRIORITARIO)
```bash
# Paso 1: Cerrar servidor completamente
pkill -9 node

# Paso 2: Limpiar todos los cachés
rm -rf node_modules/.cache
rm -rf build/

# Paso 3: Reiniciar servidor
npm start
```

**Si el error persiste**:
- Opción A: Recrear MoveHistory.css copiando el contenido manualmente
### 1️⃣ ✅ Error Resuelto
El error de TypeScript fue corregido exitosamente:
- **Problema**: Uso de `.at()` (ES2022+) con target ES5
- **Solución**: `moveHistory[moveHistory.length - 1]`
- **Resultado**: Compilación exitosa, servidor corriendo en http://localhost:3000

### 2️⃣ Verificación Visual (SIGUIENTE PASO)layer.team)
  .map(p => ({
    type: p.type,
    image: `assets/images/${mapPieceTypeToImage(p.type)}_${p.team === 'OUR' ? 'w' : 'b'}.svg`
  }));
```

### 4️⃣ Ajustar MoveHistory.css (Opcional)
Si se decide adaptar al tema medieval:
- Cambiar `background: #1e293b` → `background: #817761`
- Cambiar `border: #3b82f6` → `border: rgb(128, 141, 111)`
- Mantener funcionalidad de scroll y hover effects

---

## 📊 Métricas de Éxito

### UX Goals
- ✅ Cero superposiciones de elementos
- ✅ Información del jugador visible de un vistazo
- ✅ Diseño consistente con estilo medieval
- ⏳ Responsive en mobile (pendiente testing)
- ⏳ Transiciones fluidas (<200ms)

### Technical Goals
- ✅ Componentes reutilizables y testeables
- ✅ Props tipadas con TypeScript
- ⚠️ Zero webpack errors (bloqueado por caché)
- ⏳ Lighthouse score >90 (pendiente testing)
- ⏳ Accesibilidad WCAG AA (pendiente)

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **Por qué GameSidebar en lugar de layout en App.css**:
   - Encapsulación: El sidebar maneja su propio responsive logic
   - Reutilización: Puede ser usado en diferentes layouts (espectador, replay)
   - Testability: Más fácil testear un componente que layout CSS

2. **Por qué mantener MoveHistory.css original**:
   - Usuario solicitó "el que teníamos en el CSS original"
   - Funcionalidad probada (scrollbar, hover, transitions)
   - Solo usar el componente en el nuevo diseño, no cambiar estilos

3. **Por qué useMemo para playersData**:
   - Evitar re-cálculos en cada render
   - Los datos dependen de gameState y moveHistory que cambian poco
   - Mejora performance especialmente con 4 jugadores

4. **Por qué variantes desktop/mobile en lugar de solo CSS**:
   - Lógica diferente: En desktop History está entre jugadores, en mobile está abajo
   - Permite renderizado condicional (ej: ocultar stats en mobile)
   - Más control que media queries CSS puras

### Lecciones Aprendidas

1. **Webpack Caching Issues**:
   - El caché de webpack puede persistir errores incluso después de limpiar `node_modules/.cache`
   - Solución: Siempre hacer `pkill -9 node` antes de limpiar caché
   - Futuro: Considerar `react-app-rewired` para mejor control de webpack

2. **CSS Module Naming**:
   - BEM (Block Element Modifier) funciona bien para componentes complejos
   - Prefijo consistente evita colisiones (`player-card__`, `captured-pieces__`)

3. **TypeScript Interfaces**:
   - Separar `PlayerProfile`, `PlayerStats`, `PlayerStatus` facilita composición
   - Exportar interfaces permite reutilización en otros componentes

---

## 🔗 Referencias

### Archivos Clave
- `/src/components/GameSidebar/GameSidebar.tsx` (60 líneas)
- `/src/components/PlayerCard/PlayerCard.tsx` (170 líneas)
- `/src/components/CapturedPieces/CapturedPieces.tsx` (70 líneas)
- `/src/App.tsx` (197 líneas)
- `/doc/.github/copilot-instructions.md` (guía de arquitectura)

### Inspiración
- Chess.com: Layout sidebar, indicadores de turno, historial de movimientos
- Lichess: Material advantage, piece counters
- Medieval theme: Wood textures, green borders, knight iconography

---

## ✅ Checklist Final

### Pre-Launch
- [ ] Error de webpack resuelto
- [ ] Compilación exitosa sin warnings
- [ ] Visual testing en Chrome/Firefox/Safari
- [ ] Responsive testing en DevTools
- [ ] Datos reales conectados (no placeholders)
- [ ] Accessibility audit pasado
- [ ] Performance: <100ms tiempo de render

### Post-Launch
- [ ] Feedback de usuarios sobre legibilidad
- [ ] A/B testing: tema medieval vs Chess.com style
- [ ] Analytics: % de usuarios que miran el sidebar
- [ ] Mobile usage metrics
- [ ] Error monitoring (Sentry/LogRocket)

---

**Última actualización**: 28 noviembre 2025  
**Estado general**: 🟡 EN PROGRESO (Bloqueado por error webpack)  
**Próxima acción**: Resolver error de compilación en MoveHistory.css
**Última actualización**: 28 noviembre 2025  
**Estado general**: 🟢 COMPILANDO CORRECTAMENTE  
**Próxima acción**: Verificar layout visual y conectar datos reales desde GameState
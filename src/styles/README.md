## Arquitectura CSS - ITCSS + BEM + Modern CSS

### 📐 Estructura ITCSS (Inverted Triangle CSS)

El proyecto usa **ITCSS**, una arquitectura CSS escalable que organiza el código en capas de menor a mayor especificidad:

```
src/styles/
├── 01-settings/           # Variables CSS, design tokens
│   └── _variables.css     # Custom properties globales
├── 02-tools/              # Mixins, funciones, animaciones
│   └── _animations.css    # @keyframes y @layer definitions
├── 03-generic/            # Resets, normalize
│   └── _reset.css         # Box-sizing, resets básicos
├── 04-elements/           # Elementos HTML base (futuro)
├── 05-objects/            # Patrones de layout (futuro)
├── 06-components/         # Componentes UI
│   ├── _board.css         # Tablero y piezas
│   └── _move-indicators.css  # Indicadores de movimiento
├── 07-utilities/          # Clases helper
│   └── _helpers.css       # Utilidades de visibilidad, animación
└── main.css               # Archivo de importación principal
```

### 🎨 Metodología BEM (Block Element Modifier)

Usamos BEM para nombrar clases CSS de forma clara y mantenible:

```css
/* Block */
.tile { }

/* Element (usa __ para indicar pertenencia) */
.tile__indicator { }

/* Modifier (usa -- para indicar variación) */
.tile--selected { }
.tile--valid-move { }
.tile--capture-move { }
.tile--dark { }
.tile--light { }
```

### ✨ Features CSS Modernas

#### 1. Native CSS Nesting (Sin SASS)

```css
.tile {
  background: white;
  
  /* Nested selectors - NO SASS needed! */
  &:hover {
    background: blue;
  }
  
  &.tile--selected {
    box-shadow: 0 0 20px blue;
  }
  
  & .mess-piece {
    opacity: 0.9;
  }
}
```

**Soporte**: Chrome 112+, Safari 16.5+, Firefox 117+

#### 2. CSS Custom Properties (Variables)

```css
:root {
  --color-valid-move: hsl(120, 60%, 50%);
  --transition-fast: 0.1s ease-in-out;
}

.tile--valid-move {
  background: var(--color-valid-move);
  transition: var(--transition-fast);
}
```

#### 3. @layer (Cascade Layers)

```css
@layer base, components, utilities;

@layer components {
  .tile { /* ... */ }
}

@layer utilities {
  .u-hidden { visibility: hidden !important; }
}
```

Controla el orden de cascada sin depender de la especificidad.

### 🎯 Sistema de Indicadores de Movimiento

#### Clases Disponibles

##### Estado de Selección
```tsx
// Tile donde se seleccionó la pieza
<div className="tile tile--selected" />
```
- **Visual**: Fondo azul brillante con animación pulse
- **Uso**: Marca la posición actual de la pieza seleccionada

##### Movimiento Válido
```tsx
// Casilla vacía donde se puede mover
<div className="tile tile--valid-move" />
```
- **Visual**: Punto verde en el centro con animación pulse
- **Hover**: Fondo verde completo
- **Uso**: Indica posiciones válidas para mover

##### Movimiento de Captura
```tsx
// Casilla con pieza enemiga que se puede capturar
<div className="tile tile--capture-move" />
```
- **Visual**: Borde rojo con puntos en las esquinas
- **Hover**: Fondo rojo completo
- **Uso**: Indica piezas enemigas que se pueden capturar

##### Bajo Ataque
```tsx
// Pieza amenazada (para TEMPLAR counter-attack)
<div className="tile tile--under-attack" />
```
- **Visual**: Icono ⚔️ parpadeante, animación de advertencia
- **Uso**: Muestra piezas amenazadas o mecánicas especiales

##### Habilidad Especial
```tsx
// Rango de TREBUCHET, detección de TRAP, etc.
<div className="tile tile--special-ability" />
```
- **Visual**: Patrón de rayas diagonales
- **Uso**: Indica rangos de habilidades especiales

### 🔧 Integración con React

#### Componente Tile (Actualizado)

```tsx
<Tile
  number={i}
  image={piece?.image}
  x={x}
  y={y}
  isSelected={selectedPosition?.x === x && selectedPosition?.y === y}
  isValidMove={validMoves.some(p => p.x === x && p.y === y)}
  isCaptureMove={captureMoves.some(p => p.x === x && p.y === y)}
  isUnderAttack={attackedPositions.some(p => p.x === x && p.y === y)}
/>
```

#### Helper Function (Automático)

```typescript
import { getTileClasses, MoveIndicatorConfig } from '@/domain/core/moveIndicatorHelper';

const config: MoveIndicatorConfig = {
  selectedPosition: { x: 3, y: 5 },
  validMoves: [{ x: 3, y: 6 }, { x: 4, y: 6 }],
  captureMoves: [{ x: 4, y: 5 }],
};

const classes = getTileClasses({ x: 3, y: 6 }, config);
// Result: "tile tile--light tile--valid-move"
```

### 🎨 Personalización

Todas las variables visuales están en `01-settings/_variables.css`:

```css
:root {
  /* Cambiar colores de indicadores */
  --color-valid-move: hsl(120, 60%, 50%);     /* Verde */
  --color-capture-move: hsl(0, 80%, 55%);     /* Rojo */
  --color-selected: hsl(200, 100%, 50%);      /* Azul */
  
  /* Ajustar velocidades de animación */
  --transition-fast: 0.1s ease-in-out;
  --transition-normal: 0.3s ease-in-out;
  
  /* Modificar opacidades */
  --opacity-indicator: 0.6;
  --opacity-piece-dragging: 0.4;
}
```

### 📦 Importación en el Proyecto

En `src/index.tsx` o `src/App.tsx`:

```tsx
// Importar estilos ITCSS (reemplaza imports antiguos)
import './styles/main.css';

// Ya no necesitas:
// import './index.css';
// import './components/Messboard/Messboard.css';
// import './components/Tile/Tile.css';
```

### 🔄 Migración desde CSS Antiguo

#### Antes (Tile.css)
```css
.black-tile { background-color: rgb(60, 87, 71); }
.white-tile { background-color: rgb(226, 255, 198); }
```

#### Después (ITCSS)
```css
.tile--dark { background-color: var(--color-tile-dark); }
.tile--light { background-color: var(--color-tile-light); }
```

**Ventajas**:
- ✅ Nombres semánticos (dark/light vs black/white)
- ✅ Variables reutilizables
- ✅ Fácil de tematizar

### 🧪 Testing de Estilos

Puedes usar clases utility para debug:

```tsx
// En desarrollo, visualiza el grid
<div className="messboard u-debug-grid">
  {/* tiles */}
</div>

// Resalta un elemento específico
<div className="tile u-debug-outline">
  {/* contenido */}
</div>
```

### 📚 Recursos y Referencias

- **ITCSS**: [Inverted Triangle CSS by Harry Roberts](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- **BEM**: [Block Element Modifier Methodology](https://getbem.com/)
- **CSS Nesting**: [MDN - CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
- **CSS @layer**: [MDN - Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- **Custom Properties**: [MDN - CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### 🚀 Roadmap CSS

- [x] Estructura ITCSS completa
- [x] Variables CSS para design tokens
- [x] Native CSS nesting
- [x] Sistema de indicadores de movimiento
- [x] Animaciones con @keyframes
- [ ] Dark mode con `prefers-color-scheme`
- [ ] Responsive design con container queries
- [ ] High contrast mode para accesibilidad
- [ ] Print styles
- [ ] Animaciones de transición entre turnos
- [ ] Themes (classic, modern, minimal)

### 💡 Buenas Prácticas

1. **Siempre usa variables** para colores, espaciados y duraciones
2. **Prefiere BEM** sobre selectores anidados profundos
3. **Usa @layer** para controlar la cascada sin `!important`
4. **Evita magic numbers**: `margin: 5px` → `margin: var(--spacing-xs)`
5. **Testea en navegadores modernos**: Chrome 112+, Safari 16.5+, Firefox 117+
6. **Mantén la especificidad baja**: Máximo 3 niveles de anidación


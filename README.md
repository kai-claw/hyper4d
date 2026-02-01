# ⚡ Hyper4D

An interactive 4D geometry visualizer built with React Three Fiber. Explore tesseracts, 16-cells, 24-cells, and more — projected from 4D into 3D space.

## Features

- **6 shapes**: Tesseract, 16-Cell, 24-Cell, 5-Cell, Clifford Torus, 4D Sphere
- **3 projection modes**: Perspective, Orthographic, Stereographic
- **4D rotation**: All 6 rotation planes (XY, XZ, XW, YZ, YW, ZW)
- **Mouse 4D rotation**: Shift+drag or right-drag to rotate in 4D
- **Keyboard shortcuts**: Full shortcut set for fast navigation
- **W-color coding**: See where objects extend into the 4th dimension
- **Cross-sections**: Slice 4D objects to see their 3D cross-sections
- **Grid floor**: Spatial reference grid
- **Educational info**: Fun facts and interactive tips for each shape

## Controls

### Mouse
| Action | Effect |
|--------|--------|
| Left-drag | Orbit 3D view |
| Scroll | Zoom |
| Shift+drag | 4D rotation (XW/YW) |
| Right-drag | 4D rotation (XW/YW) |
| Ctrl+Shift+drag | ZW rotation |

### Keyboard
| Key | Action |
|-----|--------|
| `1`-`6` | Select shape |
| `Space` | Toggle auto-rotation |
| `R` | Reset rotation |
| `←→` | XW rotation nudge |
| `↑↓` | YW rotation nudge |
| `Shift+←→` | ZW rotation nudge |
| `V` | Toggle vertices |
| `E` | Toggle edges |
| `C` | Toggle color-by-W |
| `A` | Toggle 3D axes |
| `G` | Toggle grid floor |
| `X` | Toggle W-slice |
| `I` | Toggle info panel |
| `P/O/S` | Projection: Perspective/Orthographic/Stereographic |
| `H` or `?` | Help modal |

## Development

```bash
npm install
npm run dev     # Start dev server
npm run build   # Production build
npm run preview # Preview production build
```

## Stack

- React 19 + TypeScript
- React Three Fiber + Drei
- Zustand (state management)
- Vite (build)

## Deploy

The `dist/` folder is ready for static hosting (Vercel, Netlify, GitHub Pages).  
Includes `200.html` for SPA fallback on Surge/Netlify.

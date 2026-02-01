# Hyper4D

**Interactive 4D Geometry Visualizer** — rotate, slice, and explore polytopes beyond three dimensions.

<p align="center">
  <a href="https://kai-claw.github.io/hyper4d/"><strong>🚀 Launch Hyper4D →</strong></a>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-R3F-000?style=flat-square&logo=three.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript" />
  <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-66bb6a?style=flat-square" />
</p>

---

## What Is This?

Hyper4D lets you **see and interact with 4-dimensional objects** in your browser. Just as a 3-D cube casts a 2-D shadow on paper, Hyper4D projects 4-D polytopes down to 3-D so you can rotate, slice, and color-code them in real time.

### 9 Shapes

| Shape | Vertices | Edges | What's special |
|-------|----------|-------|----------------|
| **Tesseract** | 16 | 32 | The iconic 4D hypercube |
| **16-Cell** | 8 | 24 | Dual of the tesseract |
| **24-Cell** | 24 | 96 | Exists *only* in 4D — no 3D analog |
| **5-Cell** | 5 | 10 | Simplest 4D polytope (complete graph K₅) |
| **Clifford Torus** | — | — | A flat torus — zero curvature in 4D |
| **4D Sphere** (S³) | — | — | The 3-sphere, wireframed |
| **600-Cell** (subset) | 32 | — | Most complex regular 4D polytope |
| **3,3-Duoprism** | 9 | 18 | Product of two triangles |
| **4,4-Duoprism** | 16 | 32 | Product of two squares |

### Features

- **All 6 rotation planes** — XY, XZ, XW, YZ, YW, ZW with auto-rotation
- **3 projection modes** — Perspective, Orthographic, Stereographic
- **4D cross-sections** — slice with a 3D hyperplane; MRI-scan animation
- **W-depth color coding** — blue = near, red = far in the 4th dimension
- **Shape morphing** — smooth transitions between polytopes
- **Interactive tutorial** — 7-step onboarding for first-time visitors
- **Guided tour** — auto-piloted journey through each shape
- **Learning modules** — Dimensions, Projection, Rotation deep-dives
- **3D ↔ 4D comparison** — side-by-side with 3D analogs
- **Immersive mode** — fullscreen, cursor-hidden meditation view
- **4 color themes** — Deep Space, Synthwave, Monochrome, Aurora
- **Ambient audio** — generative soundscape reacting to rotation
- **Custom shaders** — pulse, glow, particle trails
- **Keyboard shortcuts** — 30+ hotkeys (press **H** in-app)
- **Accessibility** — ARIA labels, reduced-motion, skip-links, screen-reader announcements
- **Mobile-first** — bottom-sheet controls, 44 px touch targets

---

## Quick Start

```bash
git clone https://github.com/kai-claw/hyper4d.git
cd hyper4d
npm install
npm run dev          # → http://localhost:5173
```

### Build & Deploy

```bash
npm run build        # production build → dist/
npm run preview      # preview locally
```

---

## Controls

| Input | Action |
|-------|--------|
| **Drag** | Orbit the 3D view |
| **Scroll** | Zoom |
| **Shift + drag** | 4D rotation (XW/YW) |
| **Right-drag** | 4D rotation |
| **Double-click** | Smooth zoom-to-focus |
| **Right-click** | Context menu (screenshot, share…) |
| **1 – 6** | Quick shape select |
| **Space** | Toggle auto-rotation |
| **H** / **?** | Help modal |
| **Ctrl + S** | Screenshot (PNG) |
| **F** | Immersive mode |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React 19, TypeScript (strict) |
| 3D | React Three Fiber + Three.js |
| State | Zustand |
| Build | Vite 7 |
| Math | Custom 4D linear algebra (rotations, projections, slicing) |
| Styling | CSS with glassmorphism, backdrop-filter |

---

## How It Works

1. **Vertices** are defined as 4-component vectors `[x, y, z, w]`.
2. **Rotation** applies 4×4 Givens matrices for each of the 6 planes.
3. **Projection** maps `ℝ⁴ → ℝ³` via perspective, orthographic, or stereographic.
4. **Rendering** uses `LineSegments` for edges and instanced `Sphere` meshes for vertices inside a React Three Fiber `<Canvas>`.
5. **Dirty-flag optimisation** skips transform recalculation when nothing changes; rotation matrix results are cached.

---

## License

MIT — do whatever you want with it.

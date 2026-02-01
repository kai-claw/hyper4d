# ⚡ Hyper4D

> **Interactive 4D Geometry Visualizer** - Explore tesseracts, 16-cells, and other hyperdimensional objects in real-time

[![Live Demo](https://img.shields.io/badge/🚀-Live_Demo-4fc3f7?style=for-the-badge)](https://hyper4d.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-66bb6a?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)

![Hyper4D Preview](https://via.placeholder.com/800x400/0a0a14/4fc3f7?text=Hyper4D+Preview+Image)

## 🌟 What is Hyper4D?

Hyper4D lets you **see and manipulate 4-dimensional objects** in a way that's never been possible before. Watch a tesseract (4D cube) rotate through hyperspace, slice through 4D objects to see their 3D cross-sections, and gain intuition about the fourth spatial dimension.

### ✨ Key Features

🔮 **6 Hyperdimensional Objects**
- Tesseract (4D Cube) - The classic hypercube
- 16-Cell (4D Octahedron) - Regular 4D crosspolytope  
- 24-Cell - Unique to 4D space, self-dual polytope
- 5-Cell (4D Simplex) - Four-dimensional tetrahedron
- Clifford Torus - A donut that lives in 4D
- 4D Sphere - Hypersphere with perfect symmetry

🎯 **True 4D Rotation**
- All 6 rotation planes: XY, XZ, XW, YZ, YW, ZW
- Intuitive Shift+drag for 4D manipulation
- Auto-rotation with customizable speeds

🔬 **4D Cross-Sections**
- Slice 4D objects with a 3D hyperplane
- Watch cubes appear and disappear as you slice a tesseract
- "MRI scan" animation mode for continuous slicing

🎨 **Advanced Visualization**
- 3 projection modes: Perspective, Orthographic, Stereographic
- W-coordinate color coding (see the 4th dimension!)
- Real-time glow effects and particle systems
- Responsive UI with glassmorphism design

📚 **Educational Features**
- Interactive tutorial system
- Guided tour mode through each shape
- Learning modules with step-by-step explanations
- Comparison mode (3D vs 4D objects side-by-side)

⚡ **Performance Optimized**
- 60 FPS with thousands of vertices
- WebGL recovery system
- Memory pooling and caching
- Reduced motion support for accessibility

## 🎮 Controls

### Mouse Interactions
| Action | Effect |
|--------|--------|
| **Left-drag** | Orbit 3D view |
| **Scroll** | Zoom in/out |
| **Shift+drag** | 4D rotation (XW/YW planes) |
| **Right-drag** | 4D rotation (alternative) |
| **Double-click** | Focus mode with smooth zoom |
| **Right-click** | Context menu (screenshot, share, etc.) |

### Keyboard Shortcuts
| Key | Action | Advanced |
|-----|--------|----------|
| `1`-`6` | Select shape | Quick switching |
| `Space` | Toggle auto-rotation | Pause/resume |
| `R` | Reset all rotations | Back to identity |
| `←→` | XW rotation nudge | Fine control |
| `↑↓` | YW rotation nudge | Precise movement |
| `Shift+←→` | ZW rotation nudge | True 4D plane |
| `V` | Toggle vertices | Show/hide points |
| `E` | Toggle edges | Wireframe mode |
| `C` | Toggle color by W | 4D coordinate coloring |
| `A` | Toggle 3D axes | Reference frame |
| `X` | Toggle W-slice | 4D cross-sections |
| `Ctrl+S` | Screenshot | Save current view |
| `H` or `?` | Help modal | All shortcuts |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/hyper4d.git
cd hyper4d

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **3D Engine**: React Three Fiber + Three.js
- **State Management**: Zustand
- **Build Tool**: Vite
- **UI Components**: Custom glassmorphism design system
- **Math**: Custom 4D linear algebra library
- **Styling**: CSS3 with advanced effects

## 🧮 Mathematical Foundation

Hyper4D implements mathematically accurate 4D geometry:

- **4D Rotation Matrices**: All six 4D rotation planes (Givens rotations)
- **Projection Algorithms**: Multiple 4D→3D projection methods
- **Hyperplane Intersections**: Real-time 4D cross-sectioning
- **Performance Optimization**: Matrix caching, memory pooling, batch updates

```typescript
// Example: 4D rotation composition
const rotation4D = composeRotations(
  rotateXW(angle1),  // Rotate X into W
  rotateYW(angle2),  // Rotate Y into W  
  rotateZW(angle3)   // Rotate Z into W
);
```

## 📱 Features Showcase

### 🎯 Interactive Tutorial System
![Tutorial Preview](https://via.placeholder.com/400x250/0a0a14/66bb6a?text=Tutorial+System)

Step-by-step guidance through 4D concepts with interactive examples.

### 🔬 4D Cross-Sections
![Cross-Section Preview](https://via.placeholder.com/400x250/0a0a14/ab47bc?text=Cross+Sections)

Slice through 4D objects to see how they intersect 3D space.

### ⚖️ Comparison Mode
![Comparison Preview](https://via.placeholder.com/400x250/0a0a14/ffa726?text=Comparison+Mode)

Side-by-side visualization of 3D and 4D objects for better understanding.

## 🎨 Design Philosophy

- **Intuitive Interface**: Complex 4D math made accessible
- **Visual Clarity**: Clear differentiation between 3D and 4D elements
- **Performance First**: Smooth 60 FPS even with complex objects
- **Accessibility**: Screen reader support, reduced motion options
- **Mobile Ready**: Touch-optimized controls and responsive design

## 🔧 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🤝 Contributing

Contributions are welcome! Areas of interest:

- New 4D shapes and polytopes
- Enhanced visualization effects
- Educational content improvements
- Performance optimizations
- Mobile experience enhancements

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🎓 Learn More

- [Fourth Dimension Explained](https://en.wikipedia.org/wiki/Four-dimensional_space)
- [Regular 4-Polytopes](https://en.wikipedia.org/wiki/Regular_4-polytope)
- [Tesseract Visualization](https://en.wikipedia.org/wiki/Tesseract)

---

**Built with ❤️ and lots of coffee** ☕  
*Making the fourth dimension accessible to everyone*

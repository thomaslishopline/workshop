# Technology Stack

## Programming Languages
- JavaScript (ES2020+) - ES modules, classes, arrow functions, const/let

## Frameworks
- None - vanilla JavaScript with HTML5 Canvas API

## Infrastructure
- Static file serving (no server-side runtime)
- HTML5 Canvas for rendering
- Browser native ES module loading (no bundler)

## Build Tools
- npm - Package management and script running
- No bundler (Webpack, Vite, etc.) - direct module loading via browser

## Testing Tools
- vitest (^3.1.4) - Test runner (ESM-native, fast)
- fast-check (^4.1.1) - Property-based testing library

## Browser APIs Used
- Canvas 2D Context (rendering)
- requestAnimationFrame (game loop)
- DOM Events: keydown, mousedown, touchstart (input)
- Image loading (sprite)

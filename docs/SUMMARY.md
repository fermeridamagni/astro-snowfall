# Implementation Summary

An overview of the architectural implementation, physics pipeline, component lifecycle, and design system of `astro-snowfall`.

---

## 1. Core Architecture

### Utility Functions (`src/lib/snowfall/utils.ts`)
- `random(min, max)`: Uniform distribution float generator.
- `lerp(start, end, t)`: Linear interpolation for wind and velocity transitions.
- `randomElement(array)`: Array element selection.
- `degreesToRadians(degrees)`: Angle conversion for angular math.
- `TWO_PI`: Mathematical constant (`2 * Math.PI`) for radial calculations.

### TypeScript Definitions (`src/lib/snowfall/types.ts`)
- `SnowflakeProps`: Full particle specification (color, radius, speed, wind, opacity, rotation).
- `SnowfallCanvasConfig`: Canvas lifecycle and particle count parameters.
- `SnowflakeParams`: Internal state representation (position, target velocity, tumbling angles).

### Configuration Manager (`src/lib/snowfall/config.ts`)
- Centralized defaults for particle mechanics and canvas properties.
- `mergeConfig()`: Immutably merges custom consumer properties over defaults.

### Particle Engine (`src/lib/snowfall/snowflake.ts`)
- Physics updates: Velocity interpolation with periodic directional updates.
- 2D Circle Rendering: High-performance circular particles.
- 3D Tumbling Rotation: Multi-axis transformations (`rotationX`, `rotationY`, `rotationZ`) simulating crystals fluttering through 3D space.
- Image Mode: Alternative rendering path for custom PNG/SVG sprites.

### Canvas Controller (`src/lib/snowfall/snowfall-canvas.ts`)
- Lifecycle management using `requestAnimationFrame`.
- IntersectionObserver integration: Automatically pauses rendering when offscreen.
- ResizeObserver integration: Dynamically rescales canvas drawing buffer without stretching or distorting pixel ratios.
- Batch rendering path: Groups simple circles into a single `beginPath()` draw call.

---

## 2. Astro Component Integration

### `src/components/Snowfall.astro`
- Component interface with TypeScript props validation.
- Emits lightweight `<canvas>` element with JSON-encoded dataset config.
- Client script handles:
  - Multi-instance tracking and garbage collection.
  - IntersectionObserver creation and cleanup.
  - View Transitions lifecycle (`astro:page-load` and `astro:before-preparation`).

---

## 3. Design System & Showcase

### Monochromatic Aesthetic
- Styled strictly in monochrome (pure black `#000000`, crisp whites, neutral zinc scales, hairline borders).
- Apple-inspired translucent materials with specular top highlights (`backdrop-filter: blur(20px) saturate(190%)`).
- Responsive optical typography with negative tracking on display headings (`-0.03em`).

### Motion & Scroll Engine (`src/scripts/animations.ts`)
- Built with GSAP core and ScrollTrigger.
- Staggered hero entrance timeline.
- Batch viewport triggers revealing sections as visitors scroll.
- Responsive mobile header with auto-hide behavior on downward scroll.
- Full `(prefers-reduced-motion: reduce)` accessibility integration using `gsap.matchMedia()`.

---

## 4. Verification & Standards

- **Runtime & Package Manager**: Bun.
- **Language**: TypeScript (`strict: true`).
- **Linter & Formatter**: Ultracite (Biome preset).
- **Bundle Footprint**: ~3kb gzipped, 0 external runtime dependencies.

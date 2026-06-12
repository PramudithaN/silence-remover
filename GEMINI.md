# Project Instructions: Silence Remover

## Overview
A React-based web application for client-side audio silence removal. It prioritizes privacy and performance by processing audio locally using the Web Audio API.

## Technical Stack
- **Framework:** React 18 (Vite)
- **UI Library:** Material UI (MUI) 6
- **Styling:** Custom "Glassmorphism" theme (see `src/theme.js`)
- **Audio Logic:** Web Audio API (custom implementation in `src/utils/audioUtils.js`)
- **Compression:** JSZip for bulk downloads

## Architecture & Conventions

### 1. UI & Styling
- **Theme:** Adhere to the ambient dark theme defined in `src/theme.js`. Use `rgba` values for transparency and backdrop filters (`blur`) to maintain the "Glass" look.
- **Components:** Functional components with Hooks. Prefer MUI components over raw HTML.
- **Responsiveness:** Use MUI's `sx` prop or `Container` maxWidth for responsive layouts.

### 2. Audio Processing (`src/utils/audioUtils.js`)
- **Web Audio API:** All processing must remain client-side.
- **Core Logic:** Silence detection is based on RMS (Root Mean Square) per 20ms frame.
- **Format:** The output is currently hardcoded to WAV (`audio/wav`) via the `encodeWAV` helper.
- **Optimization:** Bridge short gaps and apply padding (ms to frames conversion) before generating the final `AudioBuffer`.

### 3. State Management
- **Local State:** Use `useState` and `useCallback` in `App.jsx` for file queues and settings.
- **Bulk Processing:** Iterative processing loop in `App.jsx` with progress tracking.

## Development Workflows
- **Package Manager:** `npm`
- **Commands:**
  - `npm run dev`: Start local development server.
  - `npm run build`: Production build.
- **File Naming:** PascalCase for components (`DropZoneCard.jsx`), camelCase for utils (`audioUtils.js`).

## Roadmap / TODOs
- [ ] Add support for direct MP3 encoding (currently exports as WAV).
- [ ] Implement multi-channel (stereo) visualization.
- [ ] Add "auto-trim" sensitivity detection.

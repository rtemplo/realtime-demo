# Real-Time Trading Grid

**By Ray Templo** ([rtemplo@gmail.com](mailto:rtemplo@gmail.com))

## Summary

This application demonstrates a real-time trading grid built with React and AG Grid, connected to a WebSocket server for live price updates. The grid displays bid, ask, and last prices for 15 tech stock symbols, with visual feedback through green/red cell flash animations when prices change. Features include play/stop controls for the WebSocket stream, column filtering, and optimized rendering using requestAnimationFrame and adjustable throttling (defaulted to 20 FPS).

## Main Packages

- **React 19.1.1** - UI framework
- **TypeScript ~5.9.3** - Type safety and developer experience
- **AG Grid Community 34.3.1** - High-performance data grid with filtering and transaction API
- **Vite 7.2.1** - Build tool with fast HMR and CSS Modules support
- **ws** - WebSocket library for Node.js server
- **Biome** - Fast linting and formatting

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the WebSocket Server

In one terminal, start the WebSocket server on port 8080:

```bash
npm run server
```

The server will begin broadcasting mock price updates for 15 stock symbols (AAPL, MSFT, GOOG, AMZN, TSLA, META, NVDA, AMD, NFLX, INTC, ORCL, CSCO, IBM, ADBE, CRM).

### 3. Start the Application

In a second terminal, start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Additional Commands

- `npm run build` - Build for production
- `npm run lint` - Check for linting errors
- `npm run format` - Format code with Biome
- `npm run check` - Lint and format with auto-fix

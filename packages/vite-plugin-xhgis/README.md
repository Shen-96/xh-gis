# vite-plugin-xhgis

Vite plugin for XH-GIS integration, similar to `vite-plugin-cesium`.

## Features

- 🚀 **Zero Configuration**: Works out of the box, just like Cesium
- 🔧 **Development Server**: Automatic asset serving in development mode
- 📦 **Production Build**: Asset copying guidance for production builds
- 🌍 **Global Variables**: Automatic `XH_GIS_BASE_URL` injection
- 🎯 **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install vite-plugin-xhgis --save-dev
# or
yarn add vite-plugin-xhgis --dev
# or
pnpm add vite-plugin-xhgis --save-dev
```

## Usage

### Basic Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    xhgis(), // Zero configuration!
  ],
});
```

### With Options

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    xhgis({
      baseUrl: '/assets/xh-gis',  // Custom base URL
      devMode: true,              // Enable dev mode
      debug: true,                // Enable debug logging
    }),
  ],
});
```

### In Your Application

```typescript
// No need to call setResourceConfig manually!
// XH-GIS will automatically detect XH_GIS_BASE_URL
import { AbstractCore } from '@xh-gis/engine';

const core = new AbstractCore(container, {
  // Your options...
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `'/xh-gis/Assets'` | Base URL for XH-GIS assets |
| `devMode` | `boolean` | `true` | Enable development mode features |
| `xhgisPath` | `string` | `'node_modules/@xh-gis/engine'` | Path to XH-GIS package |
| `assetsDir` | `string` | `'Assets'` | Assets directory name |
| `debug` | `boolean` | `false` | Enable debug logging |

## How It Works

### Development Mode

In development mode, the plugin:

1. **Serves Assets**: Automatically serves XH-GIS assets from `node_modules`
2. **Injects Variables**: Defines `XH_GIS_BASE_URL` globally
3. **Configures Server**: Sets up Vite dev server to handle asset requests

### Production Mode

In production mode, the plugin:

1. **Injects Variables**: Defines `XH_GIS_BASE_URL` for the build
2. **Guides Asset Copying**: Provides information about required asset copying
3. **Optimizes Bundle**: Ensures proper asset references

## Comparison with Cesium

This plugin follows the same patterns as `vite-plugin-cesium`:

| Feature | vite-plugin-cesium | vite-plugin-xhgis |
|---------|-------------------|-------------------|
| Zero Config | ✅ | ✅ |
| Dev Server | ✅ | ✅ |
| Global Variables | `CESIUM_BASE_URL` | `XH_GIS_BASE_URL` |
| Asset Handling | Automatic | Automatic |
| TypeScript | ✅ | ✅ |

## Examples

### React + Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    react(),
    xhgis(),
  ],
});
```

```tsx
// App.tsx
import React, { useEffect, useRef } from 'react';
import { AbstractCore } from '@xh-gis/engine';

function App() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // No configuration needed!
      const core = new AbstractCore(mapRef.current, {
        homeButton: false,
        sceneModePicker: false,
      });
    }
  }, []);

  return <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />;
}

export default App;
```

### Vue + Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    vue(),
    xhgis(),
  ],
});
```

## Production Deployment

For production builds, ensure that XH-GIS assets are available at the configured `baseUrl`. You can:

1. **Copy assets manually** to your public directory
2. **Use a CDN** to serve XH-GIS assets
3. **Configure your web server** to serve assets from the correct location

## License

MIT
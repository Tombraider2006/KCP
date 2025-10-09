// Wrapper для загрузки ESM main.js в Electron
import('./src/main.js').catch((err) => {
  console.error('Failed to load main.js:', err);
  process.exit(1);
});


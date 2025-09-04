import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'], // add more entries if you export multiple modules
    format: ['esm'], // Node 24 uses ESM here
    target: 'node24', // modern Node features
    dts: true, // emit .d.ts via tsup
    sourcemap: true,
    clean: true,
    minify: true, // safe for server libs
    treeshake: true, // enable esbuild’s tree shaking
    splitting: false, // single file output for libraries
    platform: 'node',
    skipNodeModulesBundle: true, // keep deps external
    external: [], // add peer deps here if any
});

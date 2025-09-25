import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: !production
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !production
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'TCGSDK',
      sourcemap: !production,
      globals: {
        'mapbox-gl': 'mapboxgl'
      }
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    }),
    production && terser()
  ].filter(Boolean),
  external: ['mapbox-gl']
};
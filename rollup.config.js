import resolve from '@rollup/plugin-node-resolve'
import autoExternal from 'rollup-plugin-auto-external'
import babel from 'rollup-plugin-babel'





const config = {
  input: 'src/index.mjs',
  output: {
    dir: 'dist',
    format: 'cjs',
    entryFileNames: '[name].js',
  },
  preserveModules: true,
  plugins: [autoExternal(), resolve(), babel({ externalHelpers: true })],
}





export default config

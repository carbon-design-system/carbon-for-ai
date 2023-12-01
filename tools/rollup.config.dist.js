import fs from 'fs';
import autoprefixer from 'autoprefixer';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import cssnano from 'cssnano';
import path from 'path';
import postcss from 'postcss';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import rollupPluginScssPath from './rollup-plugin-scss-path.js';
import rollupPluginLitSCSS from './rollup-plugin-lit-scss.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gets all of the folders and returns out
 *
 * @param {string} dir Directory to check
 * @returns {string[]} List of folders
 * @private
 */
function _getFolders(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => fs.statSync(path.join(dir, file)).isDirectory());
}

const folders = _getFolders(`components`);

for (let i = folders.length - 1; i >= 0; i--) {
  if (!fs.existsSync(`components/${folders[i]}/${folders[i]}.ts`)) {
    folders.splice(i, 1);
  }
}

/**
 * Grab current package version
 */
function _getVersion() {
  const data = fs.readFileSync('package.json', 'utf8');
  const version = /"version"\: "(.*?)"/g.exec(data);
  return version[1];
}

/**
 * Grab name of package
 */
function _getName() {
  const packagePath = process.cwd();
  const name = /packages\/(.*?)(?=$)/g.exec(packagePath);
  return name[1];
}

/**
 * Generates the multi-input for the rollup config
 *
 * @param {Array} folders Package names as inputs
 * @returns {{}} Object with inputs
 * @private
 */
function _generateInputs(folders) {
  const inputs = {};
  const version = _getVersion();
  const name = _getName();

  folders.forEach((folder) => {
    // get the main file of each component (ie. components/${component-name}/${component-name}.ts)
    inputs[
      `${name}/${version}/${folder}.min`
    ] = `components/${folder}/${folder}.ts`;
  });

  /*
   * add the packages' index.js file that contains all the component imports
   * (ie. packages/chat/index.js)
   */
  inputs[`${name}/${version}/index.min`] = `index.ts`;

  return inputs;
}

export default {
  input: _generateInputs(folders),
  output: {
    format: 'es',
    dir: 'dist',
  },
  plugins: [
    rollupPluginScssPath(),
    replace({
      'process.env.NODE_ENV': 'production',
      preventAssignment: true,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      extensions: ['.js', '.ts'],
    }),
    commonjs({
      include: [/node_modules/],
      sourceMap: true,
    }),
    esbuild({ sourceMap: false, tsconfig: '../tsconfig.json' }),
    rollupPluginLitSCSS({
      includePaths: [path.resolve(__dirname, '../node_modules')],
      async preprocessor(contents, id) {
        return (
          await postcss([autoprefixer(), cssnano()]).process(contents, {
            from: id,
          })
        ).css;
      },
    }),
    terser(),
  ],
};

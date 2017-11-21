import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from "rollup-plugin-json";
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export default {
  input: 'src/index.js',
  external: [
    "commander",
    "inquirer",
    "shift-parser",
    "shift-codegen",
    "shift-traverse",
    "fs-extra",
    "prettier"
  ],
  output: {
    file: './dist/index.js',
    format: 'cjs'
  },
  banner: '#!/usr/bin/env node',
  plugins: [
    resolve(),
    commonjs(),
    json(),
    replace({
      '#!/usr/bin/env node': ''
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({}, minify)
  ]
};
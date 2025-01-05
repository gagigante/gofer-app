import path from 'node:path'
import type { Configuration } from 'webpack'
import Dotenv from 'dotenv-webpack'

import { rules } from './webpack.rules'
import { plugins } from './webpack.plugins'

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  externals: {
    'drizzle-orm/libsql': 'commonjs drizzle-orm/libsql',
  },
  plugins: [new Dotenv(), ...plugins],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}

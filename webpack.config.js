import path from "path";
import webpackNodeExternals from "webpack-node-externals";
import WebpackShellPlugin from "webpack-shell-plugin";
import TsconfigPathPlugin from "tsconfig-paths-webpack-plugin"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { NODE_EVN = 'production' } = process.env;

export default {
    entry: './src/server.ts',
    watch: NODE_EVN === 'development',
    mode: NODE_EVN,
    target: 'node',
    externals: [webpackNodeExternals()],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.cjs',
    },
    resolve: {
        extensions: ['.ts', '.js', '.cjs'],
        plugins: [
            new TsconfigPathPlugin({
                /* options: see below */
            }),
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
            }
        ]
    },
}
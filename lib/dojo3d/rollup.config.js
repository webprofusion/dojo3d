import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import del from 'rollup-plugin-delete'
import sourcemaps from 'rollup-plugin-sourcemaps';
// build project from typescript, bundle minified as single global export 
export default {
    input: 'src/index.ts',
    output: [
        {
            dir: 'build',
            format: 'iife',
            name: 'dojo3d',
            plugins: [
                terser()
            ]
        }
    ],
    context: 'window',
    plugins: [
        del({ targets: './build/*' }),
        typescript(),
        nodeResolve(),
        sourcemaps()
    ]
};
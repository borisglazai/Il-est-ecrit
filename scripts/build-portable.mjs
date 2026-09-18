import {build} from 'esbuild';
await build({entryPoints:['client/auth.js'],outfile:'dist/assets/auth.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true});
console.log('Independent web client built. Start with npm start.');

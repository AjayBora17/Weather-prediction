import {access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
for(const file of ['public/index.html','public/styles.css','public/app.js','api/weather.js'])await access(file);
for(const file of ['public/app.js','api/weather.js'])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Build successful. Static assets: public/; Vercel function: api/weather.js.');

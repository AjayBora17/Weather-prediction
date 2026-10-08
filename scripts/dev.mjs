import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../api/weather.js';
const routes={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/styles.css':['styles.css','text/css']};
http.createServer(async(req,res)=>{
 res.status=code=>{res.statusCode=code;return res;};res.json=body=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/weather')return handler(req,res);
 if(!routes[path]){res.writeHead(404);res.end('Not found');return;}
 try{const [file,type]=routes[path];res.setHeader('Content-Type',type);res.end(await readFile(new URL('../public/'+file,import.meta.url)));}catch{res.writeHead(500);res.end('Unable to serve file');}
}).listen(3000,'0.0.0.0',()=>console.log('Atmos ready at http://localhost:3000'));

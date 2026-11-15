import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let target=path.join(root,pathname);
 if(!target.startsWith(root)){res.writeHead(403);return res.end('Forbidden');}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(root,'404.html'),'utf8'));}
 const ext=path.extname(target);res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
}).listen(4173,()=>console.log('Preview: http://localhost:4173'));

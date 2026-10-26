const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const pages = {'/':'index.html','/about':'about.html','/work':'work.html','/work/triply':'triply.html','/work/fluffbud':'fluffbud.html','/work/m-echo':'m-echo.html','/work/reedy':'reedy.html'};
const shared = new Set(['/cursor-trail.js','/bubble-menu.js','/dark-theme.css','/case-study.css','/section-reveal.js','/theme.css','/theme-toggle.js']);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
http.createServer((req,res)=>{
 const route = new URL(req.url,'http://localhost').pathname;
 const page = pages[route==='/'?route:route.replace(/\/$/,'')];
 const asset = /^\/assets\/[a-zA-Z0-9_./-]+$/.test(route) && !route.split('/').includes('..') && ['.jpg','.jpeg','.png','.svg','.pdf','.mp4','.vtt'].includes(path.extname(route));
 const name = page || (shared.has(route)||asset?route.slice(1):null);
 if(!name){res.writeHead(404);res.end('Not found');return}
 const file = path.resolve(__dirname,name);
 if(!file.startsWith(path.resolve(__dirname)+path.sep)){res.writeHead(404);res.end('Not found');return}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404);res.end('Not found');return}
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return}start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return}status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`}
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return}
  const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 });
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

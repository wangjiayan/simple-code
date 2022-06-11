#!/usr/bin/env node
const http = require('node:http')
const handler = require('serve-handler');
const {URL} = require('node:url')
// + 命令行的方式，可传入端口号及目标目录
// + 处理 404
// + 流式返回资源，处理 Content-Length
// + 处理目录，如果请求路径是目录，则自动请求其目录中的 index.html
// 以下功能选做:

// + rewrites
// + redirects
// + cleanUrls
// + trailingSlash
// + etag
// + symlink
const arg = require('arg');
const chalk = require('chalk');
const args = arg({
	'--port': Number, // --port <number> or --port=<number>
  '-p': '--port'
});

const warning = (message) => chalk`{yellow WARNING:} ${message}`;
const info = (message) => chalk`{magenta INFO:} ${message}`;
const error = (message) => chalk`{red ERROR:} ${message}`;
const port = args['--port'] || 3000
const entryFile = args._[0]


 function httpHandler (req, res){
    console.log('req',req.url)
 }

 function startEndpoint(port, entry){
  const server= http.createServer(async (request, response) => {
    await httpHandler(request, response);
  })
 
   server.listen(port,()=>{
    console.log(`\n${info(`Open http://localhost:${port}`)}`)
   })

   server.on('error', err=>{
    if (err.code === 'EADDRINUSE') {
			startEndpoint(port + 1, entry)
			return
		}
   })
 }

 startEndpoint(port,entryFile)
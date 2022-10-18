#!/usr/bin/env node
const http = require('node:http')
// const handler = require('serve-handler');
const {URL} = require('node:url')
const path = require('node:path')
const fs = require('node:fs')
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

const info = (message) => chalk`{magenta INFO:} ${message}`;
const port = args['--port'] || 3000
const entryFile = args._[0]


  // 如果是目录，则去寻找目录中的 index.html
 async function processDirectory (absolutePath){
  const newAbsolutePath = path.join(absolutePath, 'index.html')
  console.log('newAbsolutePath',newAbsolutePath)
  try {
    const newStat = await fs.promises.lstat(newAbsolutePath)
    return [newStat,newAbsolutePath]
  }catch (e) {
    return [null,newAbsolutePath]
  }
 }
 function responseNotFound (res){
   res.statusCode=404
   res.end('not found')
 }

 async function httpHandler (req, res, config){
    console.log('req',req.url)
    const pathname = req.url
    let absolutePath = path.resolve(config.entry ?? '', path.join('.', pathname))
    let stat = null 
    let statusCode = 200
    try {
      stat = await fs.promises.lstat(absolutePath)
    }catch(e){
      throw new Error(e)
    }
    if (stat?.isDirectory()) {
      // 如果是目录，则去寻找目录中的 index.html
      [stat, absolutePath] = await processDirectory(absolutePath)
    }
    if (stat === null){
      return responseNotFound(res)
    }
    let headers = {
      // 取其文件系统中的体积作为其大小
      // 问: 文件的大小与其编码格式有关，那么文件系统的体积应该是如何确定的？
      'Content-Length': stat.size
    }
  
    res.writeHead(statusCode, headers)
    fs.createReadStream(absolutePath).pipe(res)
 }

 function startEndpoint(port, entry){
  const server= http.createServer(async (request, response) => {
    await httpHandler(request, response, { entry });
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
const http = require('http');
const { brotliDecompressSync } = require('zlib');

const todos = [
  {id: 1, text: 'Todo one'},
  {id: 2, text: 'Todo two'},
  {id: 3, text: 'Todo three'},
]

const server = http.createServer((req, res) => {

  // setHeaders的合并写法
  // 第一个参数是status code
  res.writeHead(400, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  })

  // 打印请求头中的Authorization字段
  console.log('--Authorization', req.headers.authorization);

  // 接收Post请求体中的内容
  let body = []
  req
    .on('data', chunk => { // 每次接收数据时触发
      body.push(chunk)
    })
    .on('end', () => { // 数据发送完毕以后触发
      body = Buffer.concat(body).toString()
      console.log(body);
    })

  // 将对象转化为JSON字符串再发送
  res.end(JSON.stringify({
    success: false,
    data: null,
    msg: 'Please add email'
  }))
})

const PORT = 4000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
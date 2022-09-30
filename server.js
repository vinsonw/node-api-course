const http = require('http')

const todos = [
  {id: 1, text: 'Todo one'},
  {id: 2, text: 'Todo two'},
  {id: 3, text: 'Todo three'},
]

const server = http.createServer((req, res) => {
  // 设置响应头，客户端才能正确解析返回的内容
  // res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Content-Type', 'application/json')
  // 设置服务器类型
  res.setHeader('X-Powered-By', 'Express')
  // 自定义的响应头字段也会出现在浏览器的response headers中
  res.setHeader('madeup', 'whatever')


  // res.end('<h1>hello world!</h1>')

  // 直接响应对象会报错
  // TypeError [ERR_INVALID_ARG_TYPE]: The "chunk" argument must be of type string or an instance of Buffer or Uint8Array.
  // res.end({
  //   success: true,
  //   data: todos
  // })


  // 将对象转化为JSON字符串再发送
  res.end(JSON.stringify({
    success: true,
    data: todos
  }))
})

const PORT = 4000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
const http = require('http');

const todos = [
  {id: 1, text: 'Todo one'},
  {id: 2, text: 'Todo two'},
  {id: 3, text: 'Todo three'},
]

const server = http.createServer((req, res) => {

  const {headers, url, method} = req
  // 接收请求体中的内容
  let body = []
  req
    .on('data', chunk => { // 每次接收数据时触发
      body.push(chunk)
    })
    .on('end', () => { // 数据发送完毕以后触发
      body = Buffer.concat(body).toString()

      // 准备响应的默认状态
      let status = 404
      const response = {
        success: false,
        data: null
      }

      // 根据请求修改响应的默认状态
      if (method==='GET' && url==='/todos') {
        status = 200
        response.success = true
        response.data = todos
      } else if (method==='POST' && url==='/todos') {
        // 注意body此时是字符串
        const {id, text} = JSON.parse(body)
        if (!id || !text) {
          status = 404
        } else {
          status = 200
          todos.push({ id, text })
          response.success = true
          response.data = todos
        }
      }

      // 响应修改后的数据
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.js'
      })

      // 将对象转化为JSON字符串再发送
      res.end(JSON.stringify(response))
    })

})

const PORT = 4000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
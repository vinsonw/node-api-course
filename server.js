const http = require('http')

const server = http.createServer((req, res) => {
  console.log('--Somebody send a request to the server');
  const {headers, url, method} = req
  console.group()
  console.log('--headers', headers);
  console.log('--url', url);
  console.log('--method', method);
  console.groupEnd()
  res.end('hello world!')
})

const PORT = 4000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
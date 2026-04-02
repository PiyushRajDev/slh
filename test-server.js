const http = require('http');
http.createServer((req, res) => {
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  res.writeHead(200);
  res.end('OK');
}).listen(3002);
console.log("Listening on 3002");

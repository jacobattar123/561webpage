const express = require('express');
const app = express();

const port = process.env.PORT || 8888;

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());

app.post('/login/', function(req, res) {

});
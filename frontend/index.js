const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 8080;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.all('*', (req, res, next) => {
    console.log(req.originalUrl);
    next();
});

app.use(express.json());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './html/home.html'));
});

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/html'));
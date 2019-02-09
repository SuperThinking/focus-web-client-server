const express = require('express');
const path = require('path');
var parseClassify = require('./components/website-parser-classifier');
var bodyParser = require('body-parser');
var app = express();

const port = process.env.PORT || 5000;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.post('/insert', urlencodedParser, (req, res)=>{
    parseClassify.parseAndGetContent(req.body.url)
    res.contentType('application/json');
    res.send('{"name":"Sandh"}');
})

app.listen(port, ()=>{
    console.log("Server running on port 5000");
})
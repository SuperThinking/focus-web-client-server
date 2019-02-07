const express = require('express');
const path = require('path');

var app = express();

const port = process.env.PORT || 5000;

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/', (req, res)=>{
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.get('/insert', (req, res)=>{
    res.contentType('application/json');
    res.send('{"name":"Vishal"}');
});

app.listen(port, ()=>{
    console.log("Server running on port 5000");
})
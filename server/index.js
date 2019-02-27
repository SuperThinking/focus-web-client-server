const express = require('express');
const path = require('path');
var parseClassify = require('./components/website-parser-classifier');
var bodyParser = require('body-parser');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var app = express();

const port = process.env.PORT || 5000;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var login_db, usage_db;

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

MongoClient.connect("mongodb://user:user@focus-shard-00-00-vsbgw.mongodb.net:27017,focus-shard-00-01-vsbgw.mongodb.net:27017,focus-shard-00-02-vsbgw.mongodb.net:27017/test?ssl=true&replicaSet=focus-shard-0&authSource=admin&retryWrites=true", (error, client)=>{
    if(error)
        console.log(error+"<= Error");
    else
    {
        login_db = client.db('user-creds');
        usage_db = client.db('usage_track');
    }
})

app.post('/api/insert', urlencodedParser, (req, res)=>{
    var url = req.body.url;
    var id = req.body.id;
    if(id!==undefined||url!==undefined)
    {
        axios(url).then(response=>{
            var x = new Promise((resolve, reject)=>{
                resolve(parseClassify.findCategory(url));
            });
            x.then((category)=>{
                // res.contentType('application/json');
                // res.send(`{"message":"${id}:${category}"}`);
                usage_db.collection('entertainment').insert({"user_id":id, "category":category, "time":"NULL"});
            })
            res.contentType('application/json');
            res.send(`{"message":"URL : ${url} added"}`);
        })
        .catch(error=>{
            res.contentType('application/json');
            res.send('{"message":"Unable to reach URL"}');
        })
    }
    else
    {
        res.send('{"message":"Error : Missing Unique ID/URL"}')
    }
})

app.post('/api/login', urlencodedParser, (req, res)=>{
    var p = new Promise((resolve, reject)=>{
        login_db.collection('login-info').find({$and:[{'username':req.body.username}, {'password':req.body.password}]}).toArray().then(x=>{
            (x.length)?resolve(`{"unique_id":"${x[0]['unique_id']}", "status":"true"}`):reject('{"unique_id":"Incorrect Username/Password", "status":"false"}');
        });
    })
    p.then(x=>{
        res.send(x)
    }).catch(x=>{
        res.send(x)
    })
});

app.get('/api/test', (req, res)=>{
    res.send(
        `<div>Hey!</div>`
    )
})

app.get('/*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
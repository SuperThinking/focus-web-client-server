const express = require('express');
const path = require('path');
var parseClassify = require('./components/website-parser-classifier');
var bodyParser = require('body-parser');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var app = express();

const port = process.env.PORT || 5000;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var login_db;

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

MongoClient.connect("mongodb://user:user@focus-shard-00-00-vsbgw.mongodb.net:27017,focus-shard-00-01-vsbgw.mongodb.net:27017,focus-shard-00-02-vsbgw.mongodb.net:27017/test?ssl=true&replicaSet=focus-shard-0&authSource=admin&retryWrites=true", (error, client)=>{
    if(error)
        console.log(error+"<= Error");
    else
    {
        login_db = client.db('user-creds');
    }
})

app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.post('/insert', urlencodedParser, (req, res)=>{
    var url = req.body.url;
    var id = req.body.id;
    if(id!==undefined||url!==undefined)
    {
        axios(url).then(response=>{
            // var urls = ["https://www.kongregate.com/", "https://www.freeonlinegames.com/", "https://www.pogo.com/?sl=2", "https://www.aol.com/games/", "https://www.bigfishgames.com/", "https://www.miniclip.com/games/en/", "https://sites.google.com/site/thefamilyentertainmentnetwork/top-100-gaming-websites"]
            // var urls = ["https://ww.123moviesfull.me/123movieshub/", "https://www.primevideo.com/", "https://www.netflix.com/in/", "https://www.crunchyroll.com/videos/anime", "https://azmovie.to/", "http://losmovies.sh/", "https://en.wikipedia.org/wiki/List_of_Internet_television_providers"];
            // var urls = ["https://www.facebook.com/", "https://twitter.com/", "https://www.linkedin.com/", "https://www.instagram.com/", "https://www.reddit.com/", "https://www.quora.com/", "https://www.omegle.com/", "https://myspace.com/", "https://secure.tagged.com/", "https://www.practicalecommerce.com/105-leading-social-networks-worldwide"]
            // parseClassify.parseAndGetContentz(urls);
            // parseClassify.tfidf();
            var x = new Promise((resolve, reject)=>{
                resolve(parseClassify.findCategory(url));
            });
            x.then((category)=>{
                res.contentType('application/json');
                res.send(`{"message":"${id}:${category}"}`);
            })
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

app.post('/login', urlencodedParser, (req, res)=>{
    var p = new Promise((resolve, reject)=>{
        login_db.collection('login-info').find({$and:[{'username':req.body.username}, {'password':req.body.password}]}).toArray().then(x=>{
            (x.length)?resolve(`{"unique_id":"${x[0]['unique_id']}"}`):reject('{"unique_id":"Incorrect Username/Password"}');
        });
    })
    p.then(x=>{
        res.send(x)
    }).catch(x=>{
        res.send(x)
    })
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
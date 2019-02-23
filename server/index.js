const express = require('express');
const path = require('path');
var parseClassify = require('./components/website-parser-classifier');
var bodyParser = require('body-parser');
var axios = require('axios');
var app = express();

const port = process.env.PORT || 5000;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.post('/insert', urlencodedParser, (req, res)=>{
    axios(req.body.url).then(response=>{
        // var urls = ["https://www.kongregate.com/", "https://www.freeonlinegames.com/", "https://www.pogo.com/?sl=2", "https://www.aol.com/games/", "https://www.bigfishgames.com/", "https://www.miniclip.com/games/en/", "https://sites.google.com/site/thefamilyentertainmentnetwork/top-100-gaming-websites"]
        // var urls = ["https://ww.123moviesfull.me/123movieshub/", "https://www.primevideo.com/", "https://www.netflix.com/in/", "https://www.crunchyroll.com/videos/anime", "https://azmovie.to/", "http://losmovies.sh/", "https://en.wikipedia.org/wiki/List_of_Internet_television_providers"];
        // var urls = ["https://www.facebook.com/", "https://twitter.com/", "https://www.linkedin.com/", "https://www.instagram.com/", "https://www.reddit.com/", "https://www.quora.com/", "https://www.omegle.com/", "https://myspace.com/", "https://secure.tagged.com/", "https://www.practicalecommerce.com/105-leading-social-networks-worldwide"]
        // parseClassify.parseAndGetContentz(urls);
        // parseClassify.tfidf();
        var x = new Promise((resolve, reject)=>{
            resolve(parseClassify.findCategory(req.body.url));
        });
        x.then((value)=>{
            res.contentType('application/json');
            res.send(`{"message":"${value}"}`);
            // console.log("===>"+value);
        })
    })
    .catch(error=>{
        res.contentType('application/json');
        // res.send(`{"message":"${error.errno}"}`);
        res.send('{"message":"Unable to reach URL"}');
    })
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
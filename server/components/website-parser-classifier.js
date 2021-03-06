var axios = require('axios');
var cheerio = require('cheerio');
var nlp = require('nlp-toolkit');
var Lemmer = require('lemmer');
var fs = require('fs');
const path = require('path');

var videoF = require('./backups/videoStreaming').v;
var gameF = require('./backups/gaming').g;
var socialF = require('./backups/socialMedia').s;

var cosineSimilarity = require('./models/cosineSimilarity').findcosineSimilarity

var idfs = require('./backups/idfs').idfs;

var freq = {};
var total = 0;
/*
    Text will be processed in 4 stages:
    1) Tokenization
    2) Normalization
    3) Removal of Stop Words
    4) Lemmatization
*/
processText = (data) => {
    console.log('Processing Started');
    var tokens = nlp.tokenizer(data);

    const options = { 'lang': 'en' };
    var pt = new Promise((resolve, reject) => {
        nlp.stopwords(tokens, options)
            .then(withoutStopWords => {
                return withoutStopWords;
            })
            .then(tokens => {
                return Lemmer.lemmatize(tokens);
            })
            .then(tokens => {
                for (var i = 0; i < tokens.length; i++) {
                    var num = tokens[i];
                    if (num.length > 3) {
                        freq[num] = (freq[num] || 0) + 1;
                        total++;
                    }
                }
                resolve(1);
            })
            .catch(err => {
                throw new Error("Error while parsing");
            });
    });
    return pt.then((value) => {
        return value;
    })
}

parseAndGetContent = (url)=>{
    var fetch = new Promise((resolve, reject) => {
        axios.get(url).then(res => {
            const $ = cheerio.load(res.data);
            $('script').remove();
            $('img').remove();
            $('style').remove();
            $('meta').remove();
            var data = $('html *').contents().map(function () {
                return (this.type === 'text' && $(this).text().trim()[0] != '<' && $(this).text().trim().length > 3) ? $(this).text().trim() + ' ' : '';
            }).get().join('');
            resolve(processText(data));
        })
            .catch(error => {
                throw new Error("Unable to connect");
            });
    });
    return fetch.then((value)=>{
        return 1;
    })
}

parseAndGetContentz = (urls) => {
    var promises = [];
    for (let i = 0; i < urls.length; i++) {
        promises.push(parseAndGetContent(urls[i]))
    }
    Promise.all(promises).then(()=>{
        Object.keys(freq).map(x=>{
            freq[x] = freq[x]/total;
        });
        console.log('Writing to file...');
        fs.writeFileSync(path.resolve(__dirname, '../components/videoStreaming.json'), JSON.stringify(freq));
    });
}

tfidf = ()=>{
    var allWords = {};
    Object.keys(gameF).map(x=>{
        allWords[x] = (allWords[x]||0)+1;
    })
    Object.keys(videoF).map(x=>{
        allWords[x] = (allWords[x]||0)+1;
    })
    Object.keys(socialF).map(x=>{
        allWords[x] = (allWords[x]||0)+1;
    })
    Object.keys(allWords).map(x=>{
        allWords[x] = 1+Math.log(3/allWords[x]);
    })
    fs.writeFileSync(path.resolve(__dirname, '../components/idfs.json'), JSON.stringify(allWords));
    Object.keys(gameF).map(x=>{
        gameF[x] = [gameF[x], allWords[x], gameF[x]*allWords[x]]
    })
    Object.keys(videoF).map(x=>{
        videoF[x] = [videoF[x], allWords[x], videoF[x]*allWords[x]]
    })
    Object.keys(socialF).map(x=>{
        socialF[x] = [socialF[x], allWords[x], socialF[x]*allWords[x]]
    })
    fs.writeFileSync(path.resolve(__dirname, '../components/socialMedia.json'), JSON.stringify(socialF));
    fs.writeFileSync(path.resolve(__dirname, '../components/videoStreaming.json'), JSON.stringify(videoF));
    fs.writeFileSync(path.resolve(__dirname, '../components/gaming.json'), JSON.stringify(gameF));
}

findCategory = (url)=>{
    freq = {};
    total = 0;
    console.log('Fetching..')
    var fetch = new Promise((resolve, reject) => {
        axios.get(url).then(res => {
            const $ = cheerio.load(res.data);
            $('script').remove();
            $('img').remove();
            $('style').remove();
            $('meta').remove();
            var data = $('html *').contents().map(function () {
                return (this.type === 'text' && $(this).text().trim()[0] != '<') ? $(this).text().trim() + ' ' : '';
            }).get().join('');
            return data;
        })
        .then(data=>{
            var tokens = nlp.tokenizer(data);
            const options = { 'lang': 'en' };
            return nlp.stopwords(tokens, options)
        })
        .then(tokens => {
            return Lemmer.lemmatize(tokens);
        })
        .then(tokens => {
            for (var i = 0; i < tokens.length; i++) {
                var num = tokens[i];
                if (num.length > 3) {
                    freq[num] = (freq[num] || 0) + 1;
                    total++;
                }
            }

            Object.keys(freq).map(x=>{
                freq[x] = [freq[x]/total, (idfs[x])?idfs[x]:0];
                freq[x].push(freq[x][0]*freq[x][1]);
            })
            var scores = cosineSimilarity(freq, {"Social Media":socialF, "Online TV":videoF, "Gaming Website":gameF})
            console.log(scores);
            resolve(scores[Math.max(...Object.keys(scores))]);
        })
        .catch(error => {
            throw new Error("Unable to connect");
        });
    });
    return fetch.then((value)=>{
        console.log("==>"+value);
        return value;
    })
}

module.exports = {
    parseAndGetContentz,
    tfidf,
    findCategory
}
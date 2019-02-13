var axios = require('axios');
var cheerio = require('cheerio');
var nlp = require('nlp-toolkit');
var Lemmer = require('lemmer');
var fs = require('fs');
const path = require('path');

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
                        total++
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

module.exports = {
    parseAndGetContentz
}

/*
Categories
Entertainment -> Games, Movies, Social Media
Productivity
Others
*/

var axios = require('axios');
var cheerio = require('cheerio');
var nlp = require('nlp-toolkit');
var Lemmer = require('lemmer');
var fs = require('fs');
const path = require('path');
var category = require('./categoriesTrain/category').data;
var idfs = require('./categoriesTrain/category').idfs;
var cosineSimilarity = require('./models/cosineSimilarity').findcosineSimilarity;
var naiveBayes = require('./models/naiveBayes').findnaiveBayes;

var freq = {};
var total = 0;

tfidf = () => {
    var all = {};
    const totalDocs = category.length;
    for (let i = 0; i < totalDocs; i++) {
        Object.keys(category[i]).map(x => {
            all[x] = (all[x] || 0) + 1
        });
    }
    console.log("Stored Data");
    Object.keys(all).map(x => {
        all[x] = [all[x], 1 + Math.log(totalDocs / all[x])];
    })
    // fs.writeFileSync(path.resolve(__dirname, '../components/categoriesTrain/idfs.json'), JSON.stringify(all));
    // console.log("Stored IDFs");
    var files = ['game', 'onlinetv', 'socialmedia', 'productivity', 'ecommerce'];
    for (let i = 0; i < totalDocs; i++) {
        var newObjs = {};
        Object.keys(category[i]).map(x => {
            newObjs[x] = [category[i][x][0], category[i][x][1], all[x][1] * category[i][x][1]];
        });
        fs.writeFileSync(path.resolve(__dirname, '../../' + files[i] + '.json'), JSON.stringify(newObjs));
    }
    console.log("Modified the files");
}

addCategory = (data, url) => {
    for (var i = 0; i < data.length; i++) {
        if (data[i].length > 3) {
            freq[data[i]] = (freq[data[i]] || 0) + 1;
            total++;
        }
    }
    console.log(total, url);
}

preprocess = (data, url) => {
    console.log("Pre-processing Started");
    const tokenizer_options = { 'eliminateNumbers': 'true' }
    const stpwrds_options = { 'lang': 'en' };

    var tokens = nlp.tokenizer(data, tokenizer_options);
    return new Promise((resolve, reject) => {
        nlp.stopwords(tokens, stpwrds_options)
            .then(tokens => {
                return Lemmer.lemmatize(tokens);
            })
            .then(tokens => {
                addCategory(tokens, url);
                resolve(tokens);
            })
            .catch(err => {
                console.log(`ERROR WHILE PARSING ${url}`);
                reject("Error while parsing");
                throw new Error("Error while parsing");
            });
    })
}

crawlSingle = url => {
    console.log("Started");
    return new Promise((resolve, reject) => {
        axios.get(url).then(res => {
            const $ = cheerio.load(res.data);
            $('script').remove();
            $('img').remove();
            $('style').remove();
            $('meta').remove();
            var data = $('html *').contents().map(function () {
                return (this.type === 'text' && $(this).text().trim()[0] != '<') ? $(this).text().trim() + ' ' : '';
            }).get().join('');
            resolve(preprocess(data, url));
        })
            .catch((error) => {
                console.log(`unable to reach the url ${url}`);
                reject("Unable to access URL");
            })
    })
}

crawlMultiple = urls => {
    var promises = [];
    console.log(total);
    for (let i = 0; i < urls.length; i++) {
        promises.push(crawlSingle(urls[i]))
    }
    Promise.all(promises).then(() => {
        Object.keys(freq).map(x => {
            freq[x] = [freq[x], freq[x] / total];
        });
        console.log('Writing to file...');
        fs.writeFileSync(path.resolve(__dirname, '../components/categoriesTrain/ecommerce.json'), JSON.stringify(freq));
    });
}

getCategory = url => {
    freq = {};
    total = 0;
    var x = new Promise((resolve, reject) => resolve(crawlSingle(url)));
    return x.then((tokens) => {
        for (var i = 0; i < tokens.length; i++) {
            var num = tokens[i];
            if (num.length > 3) {
                freq[num] = (freq[num] || 0) + 1;
                total++;
            }
        }
        Object.keys(freq).map(x => {
            freq[x] = [freq[x] / total, (idfs[x]) ? idfs[x][1] : 0];
            freq[x].push(freq[x][0] * freq[x][1]);
        })
        var files = ['game', 'onlinetv', 'socialmedia', 'productivity', 'ecommerce'];
        // "Naive Bayes" is giving the better approximations of probability
        var scores = naiveBayes(freq, {"Gaming":category[0], "Online TV":category[1], "Social Media":category[2], "Productivity":category[3], "ECommerce":category[4]})
        // "Cosine Similairty" is giving good results but not quite accurate
        // var scores = cosineSimilarity(freq, {"Gaming":category[0], "Online TV":category[1], "Social Media":category[2], "Productivity":category[3], "ECommerce":category[4]})

        console.log(scores);
        return (scores[Math.max(...Object.keys(scores))]);
    })
}

module.exports = {
    crawlSingle,
    crawlMultiple,
    tfidf,
    getCategory
}
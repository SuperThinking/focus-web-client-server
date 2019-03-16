const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var crawler = require('./components/crawlerTrain');
const currentDate = require('./components/currentDate').today;
var convDate = require('./components/currentDate').convertDate;

const port = process.env.PORT || 5000;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var login_db, usage_db;

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

MongoClient.connect("mongodb://user:user@focus-shard-00-00-vsbgw.mongodb.net:27017,focus-shard-00-01-vsbgw.mongodb.net:27017,focus-shard-00-02-vsbgw.mongodb.net:27017/test?ssl=true&replicaSet=focus-shard-0&authSource=admin&retryWrites=true", (error, client) => {
    if (error)
        console.log(error + "<= Error");
    else {
        login_db = client.db('user-creds');
        usage_db = client.db('usage_track');
    }
})

exists = (category, id) => {

    var subCats = {};

    subCats['entertainment'] = {
        "date": new Date(),
        "gaming": {
            "limit": -1,
            "used": 0
        },
        "onlinetv": {
            "limit": -1,
            "used": 0
        },
        "socialmedia": {
            "limit": -1,
            "used": 0
        }
    };

    subCats['productivity'] = {
        "date": new Date(),
        "productiveTime": {
            "time": 0
        }
    }

    subCats['others'] = {
        "date": new Date(),
        "others": {
            "limit": -1,
            "used": 0
        }
    }

    return new Promise((resolve, reject) => {
        usage_db.collection(category).find({ 'user_id': id }).toArray().then(x => {
            if (x.length) {
                if (convDate(x[0].dates[0].date) === currentDate)
                    resolve(true);
                else {
                    usage_db.collection('limits').find({ 'user_id': id }).toArray().then(y => {
                        if (y.length) {
                            if (category === 'entertainment') {
                                subCats[category].gaming.limit = parseInt(y[0].gaming);
                                subCats[category].onlinetv.limit = parseInt(y[0].onlinetv);
                                subCats[category].socialmedia.limit = parseInt(y[0].socialmedia);
                            }
                            else if (category === 'others') {
                                subCats[category].others.limit = parseInt(y[0].others);
                            }
                            usage_db.collection(category).update({ 'user_id': id }, {
                                '$push': {
                                    'dates': {
                                        '$each': [subCats[category]],
                                        '$position': 0
                                    }
                                }
                            }, (err, res) => {
                                if (err) {resolve(false); console.log('Error ' + err); }
                                else { resolve(true); }
                            });
                        }
                        else {
                            usage_db.collection(category).update({ 'user_id': id }, {
                                '$push': {
                                    'dates': {
                                        '$each': [subCats[category]],
                                        '$position': 0
                                    }
                                }
                            }, (err, res) => {
                                if (err) { resolve(false); console.log('Error ' + err); }
                                else { resolve(true); }
                            });
                        }
                    });
                }
            }
            else {
                resolve(false);
            }
        })
    });
}

upsertTime = (category, id, timeSpent, subCategory) => {
    var subCats = {};

    subCats['entertainment'] = {
        "date": new Date(),
        "gaming": {
            "limit": -1,
            "used": 0
        },
        "onlinetv": {
            "limit": -1,
            "used": 0
        },
        "socialmedia": {
            "limit": -1,
            "used": 0
        }
    };

    subCats['productivity'] = {
        "date": new Date(),
        "productiveTime": {
            "time": 0
        }
    }

    subCats['others'] = {
        "date": new Date(),
        "others": {
            "limit": -1,
            "used": 0
        }
    }

    var k = new Promise((resolve, reject) => {
        usage_db.collection('limits').find({ 'user_id': id }).toArray().then(y => {
            if (y.length) {
                if (category === 'entertainment') {
                    subCats[category].gaming.limit = parseInt(y[0].gaming);
                    subCats[category].onlinetv.limit = parseInt(y[0].onlinetv);
                    subCats[category].socialmedia.limit = parseInt(y[0].socialmedia);
                    subCats[category][subCategory].used = timeSpent;
                }
                else if (category === 'others') {
                    subCats[category].others.limit = parseInt(y[0].others);
                    subCats[category][subCategory].used = timeSpent;
                }
                else {
                    subCats[category].productiveTime.time = timeSpent;
                }
                usage_db.collection(category).insert({
                    'user_id': id, 'dates': [subCats[category]]
                })
            }
            else {
                usage_db.collection(category).update({ 'user_id': id }, {
                    '$push': {
                        'dates': {
                            '$each': [subCats[category]],
                            '$position': 0
                        }
                    }
                }, (err, res) => {
                    if (err) { resolve(false); console.log('Error ' + err); }
                    else { resolve(true); }
                });
            }
        });
    });

    return k.then(res => {
        return (res);
    })

}

updateTime = (category, id, timeSpent, subCategory) => {
    var updateElement = 'dates.0.' + subCategory + '.used';
    if (category === 'productivity')
        updateElement = 'dates.0.productiveTime.time';
    var incObject = {}; incObject[updateElement] = timeSpent;
    usage_db.collection(category).update({ 'user_id': id }, {
        '$inc': incObject
    }, (err, res) => {
        if (err) console.log('Error ' + err);
        console.log('Done');
    });
}

app.post('/api/gettime', urlencodedParser, (req, res) => {
    var id = req.body.id;
    var k = new Promise((resolve, reject) => {
        usage_db.collection('entertainment').find({ 'user_id': id }).toArray().then(x => {
            resolve(x[0].dates[0]);
        })
            .catch(x => {
                resolve({ 'message': 'Invalid user id' })
            })
    });

    k.then(result => {
        res.send(result);
    })
})

app.post('/api/insert', urlencodedParser, (req, res) => {
    var url = req.body.url;
    var id = req.body.id;
    var timeSpent = parseInt(req.body.timeSpent);
    if (id !== undefined && url !== undefined && timeSpent !== undefined) {
        axios(url).then(response => {
            var x = new Promise((resolve, reject) => {
                // resolve(parseClassify.findCategory(url));
                resolve(crawler.getCategory(url));
            });

            // Adds URL Category to MongoDB
            x.then((category) => {
                console.log(category, currentDate);
                if (category === 'gaming' || category === 'onlinetv' || category === 'socialmedia') {
                    exists('entertainment', id).then(result => {
                        if (result)
                            updateTime('entertainment', id, timeSpent, category);
                        else
                            upsertTime('entertainment', id, timeSpent, category);
                    });
                }
                else if (category === 'productivity') {
                    exists('productivity', id).then(result => {
                        if (result)
                            updateTime('productivity', id, timeSpent, null);
                        else
                            upsertTime('productivity', id, timeSpent, null);
                    });
                }
                else {
                    exists('others', id).then(result => {
                        if (result)
                            updateTime('others', id, timeSpent, 'others');
                        else
                            upsertTime('others', id, timeSpent, 'others');
                    });
                }
            })
            res.contentType('application/json');
            res.send(`{"message":"URL : ${url} added"}`);
        })
            .catch(error => {
                res.contentType('application/json');
                res.send('{"message":"Unable to reach URL"}');
            })
    }
    else {
        res.send('{"message":"Error : Missing Unique ID/URL"}')
    }
})

app.post('/api/login', urlencodedParser, (req, res) => {
    var p = new Promise((resolve, reject) => {
        login_db.collection('login-info').find({ $and: [{ 'username': req.body.username }, { 'password': req.body.password }] }).toArray().then(x => {
            (x.length) ? resolve(`{"unique_id":"${x[0]['unique_id']}", "status":"true"}`) : reject('{"unique_id":"Incorrect Username/Password", "status":"false"}');
        });
    })
    p.then(x => {
        res.send(x)
    }).catch(x => {
        res.send(x)
    })
});

app.post('/api/modifylimit', urlencodedParser, (req, res) => {
    const gaming = parseInt(req.body.gaming);
    const onlinetv = parseInt(req.body.onlinetv);
    const socialmedia = parseInt(req.body.socialmedia);
    const others = parseInt(req.body.others);
    var x = new Promise((resolve, reject) => {
        usage_db.collection('limits').find({ 'user_id': req.body.user }).toArray().then(x => {
            if (x.length) {
                usage_db.collection('limits').updateOne({ 'user_id': req.body.user }, { $set: { "gaming": gaming, 'onlinetv': onlinetv, 'socialmedia': socialmedia, 'others': others } }, (err, res) => {
                    if (err) {
                        console.log(err);
                        reject('Error ' + err);
                    }
                    else {
                        usage_db.collection('entertainment').find({ 'user_id': req.body.user }).toArray().then(x => {
                            if (x.length) {
                                console.log(x);
                                if (x[0].dates.length && convDate(x[0].dates[0].date) === currentDate) {
                                    usage_db.collection('entertainment').updateOne({ 'user_id': req.body.user }, { '$set': { 'dates.0.gaming.limit': gaming, 'dates.0.onlinetv.limit': onlinetv, 'dates.0.socialmedia.limit': socialmedia } }, (err, res) => {
                                        if (err) {
                                            console.log(err);
                                            reject('Error ' + err);
                                        }
                                        resolve('Limits Modified');
                                    });
                                }
                                else
                                    resolve('Limits Modified');
                            }
                            else
                                resolve('Limits Modified');
                        });
                    }
                });
            }
            else {
                usage_db.collection('limits').insert({ "user_id": req.body.user, "gaming": gaming, 'onlinetv': onlinetv, 'socialmedia': socialmedia, 'others': others });
                resolve('Limits set');
            }
        })
            .catch(error => {
                console.log(error);
                reject('Error ' + error);
            })
    });

    x.then(response => {
        res.send({ value: response, 'status': true });
    })
        .catch(error => {
            res.send({ value: "Error " + error, 'status': false });
        })
});

app.get('/api/test', (req, res) => {
    res.send(
        `<div>Hey!</div>`
    )
})

app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
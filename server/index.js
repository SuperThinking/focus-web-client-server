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

app.post('/api/gettime', urlencodedParser, (req, res) => {
    var id = req.body.id;
    var k = new Promise((resolve, reject) => {
        usage_db.collection('entertainment').find({ 'user_id': id }).toArray().then(x => {
            resolve(x[0].dates[0]);
        })
        .catch(x=>{
            resolve({'message':'Invalid user id'})
        })
    });

    k.then(result=>{
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
                if (category === 'Gaming' || category === 'Online TV' || category === 'Social Media') {
                    usage_db.collection('entertainment').find({ 'user_id': id }).toArray().then(x => {
                        if (x.length) {
                            if (x[0].dates.length && convDate(x[0].dates[0].date) === currentDate) {
                                var updateElement = 'dates.0.' + category.toLowerCase().split(' ').join('') + '.used';
                                var incObject = {}; incObject[updateElement] = timeSpent;
                                usage_db.collection('entertainment').update({ 'user_id': id }, {
                                    '$inc': incObject
                                }, (err, res) => {
                                    if (err) console.log('Error ' + err);
                                    console.log('Done');
                                });
                            }
                            else {
                                //Fetch limits first and then insert them
                                usage_db.collection('limits').find({ 'user_id': id }).toArray().then(y => {
                                    if (y.length) {
                                        usage_db.collection('entertainment').update({ 'user_id': id }, {
                                            '$push': {
                                                'dates': {
                                                    '$each': [{
                                                        "date": new Date(),
                                                        "gaming": {
                                                            "limit": parseInt(y[0].gaming),
                                                            "used": 0
                                                        },
                                                        "onlinetv": {
                                                            "limit": parseInt(y[0].onlinetv),
                                                            "used": 0
                                                        },
                                                        "socialmedia": {
                                                            "limit": parseInt(y[0].socialmedia),
                                                            "used": 0
                                                        }
                                                    }],
                                                    '$position': 0
                                                }
                                            }
                                        }, (err, res) => {
                                            if (err) console.log('Error ' + err);
                                            console.log('Done');
                                        });
                                    }
                                    else {
                                        usage_db.collection('entertainment').update({ 'user_id': id }, {
                                            '$push': {
                                                'dates': {
                                                    '$each': [{
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
                                                    }],
                                                    '$position': 0
                                                }
                                            }
                                        }, (err, res) => {
                                            if (err) console.log('Error ' + err);
                                            console.log('Done');
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            var entObj = { 'gaming': 0, 'socialmedia': 0, 'onlinetv': 0 };
                            entObj[category.toLowerCase().split(' ').join('')] = timeSpent;

                            usage_db.collection('limits').find({ 'user_id': id }).toArray().then(y => {
                                if (y.length) {
                                    const firstObject = {
                                        'user_id': id,
                                        'dates': [{
                                            "date": new Date(),
                                            "gaming": {
                                                "limit": parseInt(y[0].gaming),
                                                "used": entObj['gaming']
                                            },
                                            "onlinetv": {
                                                "limit": parseInt(y[0].onlinetv),
                                                "used": entObj['onlinetv']
                                            },
                                            "socialmedia": {
                                                "limit": parseInt(y[0].socialmedia),
                                                "used": entObj['socialmedia']
                                            }
                                        }]
                                    }
                                    usage_db.collection('entertainment').insert(firstObject);
                                }
                                else {
                                    const firstObject = {
                                        'user_id': id,
                                        'dates': [{
                                            "date": new Date(),
                                            "gaming": {
                                                "limit": -1,
                                                "used": entObj['gaming']
                                            },
                                            "onlinetv": {
                                                "limit": -1,
                                                "used": entObj['onlinetv']
                                            },
                                            "socialmedia": {
                                                "limit": -1,
                                                "used": entObj['socialmedia']
                                            }
                                        }]
                                    }
                                    usage_db.collection('entertainment').insert(firstObject);
                                }
                            });
                        }
                    })
                }
                else if (category === 'Productivity') {
                    console.log('Productivity Coming Soon');
                }
                else {
                    console.log('Others Coming Soon');
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
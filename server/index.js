const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var crawler = require('./components/crawlerTrain');
const currentDate = require('./components/currentDate').today;
var convDate = require('./components/currentDate').convertDate;
var dateAndMonth = require('./components/currentDate').dateAndMonth;

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
        "date": new Date(currentDate),
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
        "date": new Date(currentDate),
        "productiveTime": {
            "time": 0
        }
    }

    subCats['others'] = {
        "date": new Date(currentDate),
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
                                if (err) { resolve(false); console.log('Error ' + err); }
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
        "date": new Date(currentDate),
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
        "date": new Date(currentDate),
        "productiveTime": {
            "time": 0
        }
    }

    subCats['others'] = {
        "date": new Date(currentDate),
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
    });
}

/*
    id, start (in millisecs), end (in millisecs)
*/
app.post('/api/getuserhistory', urlencodedParser, (req, res) => {
    var data = {};
    var id = req.body.id;
    var startDate, endDate;
    var condition = {}
    if (req.body.today === undefined) {
        startDate = req.body.start;
        endDate = req.body.end;
        condition = {
            'dates.date': {
                '$gte': new Date(startDate), '$lt': new Date(endDate)
            }
        }
    }
    else {
        condition = {
            'dates.date': new Date(currentDate)
        }
    }
    var pro = new Promise((resolve, reject) => {
        usage_db.collection('productivity').aggregate(
            { $match: { 'user_id': id } },
            { $unwind: '$dates' },
            { $match: condition },
            { $group: { user_id: '$user_id', dates: { $push: '$dates.date' } } }).toArray().then(x => {
                var objArray = [];
                if (x.length) {
                    x.forEach(y => {
                        var obj = {};
                        obj['date'] = dateAndMonth(new Date(y.dates.date));
                        obj['used'] = y.dates.productiveTime.time;
                        objArray.push(obj);
                    });
                    data['productivity'] = objArray;
                }
                resolve(objArray);
            })
            .catch(x => {
                console.log(x);
                resolve({ 'message': 'Invalid user id' })
            })
    });

    var oth = new Promise((resolve, reject) => {
        usage_db.collection('others').aggregate(
            { $match: { 'user_id': id } },
            { $unwind: '$dates' },
            { $match: condition },
            { $group: { user_id: '$user_id', dates: { $push: '$dates.date' } } }).toArray().then(x => {
                var objArray = [];
                if (x.length) {
                    x.forEach(y => {
                        if (y.dates.others.limit !== -1) {
                            var obj = {};
                            obj['date'] = dateAndMonth(new Date(y.dates.date));
                            obj['limit'] = y.dates.others.limit;
                            obj['used'] = y.dates.others.used;
                            objArray.push(obj);
                        }
                    });
                    data['others'] = objArray;
                }
                resolve(objArray);
            })
            .catch(x => {
                console.log(x);
                resolve({ 'message': 'Invalid user id' })
            })
    });

    var ent = new Promise((resolve, reject) => {
        usage_db.collection('entertainment').aggregate(
            { $match: { 'user_id': id } },
            { $unwind: '$dates' },
            { $match: condition },
            { $group: { user_id: '$user_id', dates: { $push: '$dates.date' } } }).toArray().then(x => {
                var objArray1 = [], objArray2 = [], objArray3 = [];
                if (x.length) {
                    x.forEach(y => {
                        var obj1 = {}, obj2 = {}, obj3 = {};
                        obj1['date'] = dateAndMonth(new Date(y.dates.date));
                        obj2['date'] = dateAndMonth(new Date(y.dates.date));
                        obj3['date'] = dateAndMonth(new Date(y.dates.date));
                        // obj['limits'] = [y.dates.gaming.limit, y.dates.onlinetv.limit, y.dates.socialmedia.limit];
                        // obj['used'] = [y.dates.gaming.used, y.dates.onlinetv.used, y.dates.socialmedia.used];
                        if (y.dates.gaming.limit !== -1) {
                            obj1['limit'] = y.dates.gaming.limit;
                            obj1['used'] = y.dates.gaming.used;
                        }
                        if (y.dates.onlinetv.limit !== -1) {
                            obj2['limit'] = y.dates.onlinetv.limit;
                            obj2['used'] = y.dates.onlinetv.used;
                        }
                        if (y.dates.socialmedia.limit !== -1) {
                            obj3['limit'] = y.dates.socialmedia.limit;
                            obj3['used'] = y.dates.socialmedia.used;
                        }
                        objArray1.push(obj1);
                        objArray2.push(obj2);
                        objArray3.push(obj3);
                    });
                    data['gaming'] = objArray1;
                    data['onlinetv'] = objArray2;
                    data['socialmedia'] = objArray3;
                }
                resolve([objArray1, objArray2, objArray3]);
            })
            .catch(x => {
                console.log(x);
                resolve({ 'message': 'Invalid user id' })
            })
    });

    Promise.all([pro, oth, ent]).then(x => {
        console.log(x);
        res.send({ 'data': data });
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
        usage_db.collection('limits').find({ 'user_id': req.body.id }).toArray().then(x => {
            if (x.length) {
                usage_db.collection('limits').updateOne({ 'user_id': req.body.id }, { $set: { "gaming": gaming, 'onlinetv': onlinetv, 'socialmedia': socialmedia, 'others': others } }, (err, res) => {
                    if (err) {
                        console.log(err);
                        reject('Error ' + err);
                    }
                    else {
                        usage_db.collection('entertainment').find({ 'user_id': req.body.id }).toArray().then(x => {
                            if (x.length) {
                                if (x[0].dates.length && convDate(x[0].dates[0].date) === currentDate) {
                                    usage_db.collection('entertainment').updateOne({ 'user_id': req.body.id }, { '$set': { 'dates.0.gaming.limit': gaming, 'dates.0.onlinetv.limit': onlinetv, 'dates.0.socialmedia.limit': socialmedia } }, (err, res) => {
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
                usage_db.collection('limits').insert({ "user_id": req.body.id, "gaming": gaming, 'onlinetv': onlinetv, 'socialmedia': socialmedia, 'others': others });
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

app.post('/api/getuserlimit', urlencodedParser, (req, res) => {
    var k = new Promise((resolve, reject) => {
        usage_db.collection('limits').find({ 'user_id': req.body.id }).toArray().then(x => {
            if (x.length) {
                x[0]['status'] = true;
                resolve(x[0]);
            }
            else
                resolve({ 'status': false });
        })
    });
    k.then(result => {
        res.send(result);
    })
        .catch(err => {
            console.log(err);
        });
})

app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
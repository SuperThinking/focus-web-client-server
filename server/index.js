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
var preDefined = {
    "https://www.youtube.com": "onlinetv",
    "https://youtube.com": "onlinetv",
    "http://www.medium.com": "productivity",
    "https://medium.com": "productivity"
}

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

exists = (category, id, subCategory, timeSpent) => {
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

    var result = {};
    return new Promise((resolve, reject) => {
        usage_db.collection(category).find({ 'user_id': id }).toArray().then(x => {
            if (x.length) {
                if (convDate(x[0].dates[0].date) === currentDate) {
                    result['status'] = true;
                    if (subCategory.length) {
                        let timeLeft = x[0].dates[0][subCategory].limit - x[0].dates[0][subCategory].used - timeSpent;
                        let tempObj = {}
                        if (x[0].dates[0][subCategory].limit === -1)
                            tempObj[subCategory] = -1;
                        else if (timeLeft <= 0)
                            tempObj[subCategory] = 0;
                        else
                            tempObj[subCategory] = timeLeft;
                        result['response'] = tempObj;
                    }
                    else
                        result['response'] = '{"productivity":-1}';
                    resolve(result);
                }
                else {
                    usage_db.collection('limits').find({ 'user_id': id }).toArray().then(y => {
                        if (y.length) {
                            if (category === 'entertainment') {
                                subCats[category].gaming.limit = parseInt(y[0].gaming);
                                subCats[category].onlinetv.limit = parseInt(y[0].onlinetv);
                                subCats[category].socialmedia.limit = parseInt(y[0].socialmedia);
                                let timeLeft = y[0][subCategory] - timeSpent;
                                let tempObj = {}
                                if (parseInt(y[0][subCategory]) === -1)
                                    tempObj[subCategory] = -1;
                                else if (timeLeft <= 0)
                                    tempObj[subCategory] = 0;
                                else
                                    tempObj[subCategory] = timeLeft;
                                result['response'] = tempObj;
                            }
                            else if (category === 'others') {
                                subCats[category].others.limit = parseInt(y[0].others);
                                let tempObj = {}
                                if (parseInt(y[0][subCategory]) === -1)
                                    tempObj[subCategory] = -1;
                                else if (timeLeft <= 0)
                                    tempObj[subCategory] = 0;
                                else
                                    tempObj[subCategory] = timeLeft;
                                result['response'] = tempObj;
                            }
                            usage_db.collection(category).update({ 'user_id': id }, {
                                '$push': {
                                    'dates': {
                                        '$each': [subCats[category]],
                                        '$position': 0
                                    }
                                }
                            }, (err, res) => {
                                if (err) { result['status'] = false; resolve(result); console.log('Error ' + err); }
                                else { result['status'] = true; resolve(result); }
                            });
                        }
                        else {
                            let tempObj = {};
                            tempObj[subCategory] = -1;
                            result['response'] = tempObj;
                            usage_db.collection(category).update({ 'user_id': id }, {
                                '$push': {
                                    'dates': {
                                        '$each': [subCats[category]],
                                        '$position': 0
                                    }
                                }
                            }, (err, res) => {
                                if (err) { result['status'] = false; resolve(result); console.log('Error ' + err); }
                                else { result['status'] = true; resolve(result); }
                            });
                        }
                    });
                }
            }
            else {
                result['status'] = false; resolve(result);
            }
        })
    });
}

upsertTime = (category, id, timeSpent, subCategory, res) => {
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

                    let timeLeft = parseInt(y[0][subCategory]) - timeSpent;

                    if (timeLeft <= 0)
                        subCats[category][subCategory].used = 0;
                    else
                        subCats[category][subCategory].used = timeSpent;
                    let tempObj = {};
                    if (parseInt(y[0][subCategory]) === -1)
                        tempObj[subCategory] = -1
                    else if (timeLeft <= 0)
                        tempObj[subCategory] = 0
                    else
                        tempObj[subCategory] = timeLeft
                    res.send(tempObj);
                }
                else if (category === 'others') {
                    subCats[category].others.limit = parseInt(y[0].others);
                    let timeLeft = parseInt(y[0][subCategory]) - timeSpent;

                    if (timeLeft <= 0)
                        subCats[category][subCategory].used = 0;
                    else
                        subCats[category][subCategory].used = timeSpent;

                    let tempObj = {};
                    if (parseInt(y[0][subCategory]) === -1)
                        tempObj[subCategory] = -1
                    else if (timeLeft <= 0)
                        tempObj[subCategory] = 0
                    else
                        tempObj[subCategory] = timeLeft
                    res.send(tempObj);
                }
                else {
                    subCats[category].productiveTime.time = timeSpent;
                }
                usage_db.collection(category).insert({
                    'user_id': id, 'dates': [subCats[category]]
                })
            }
            else {
                let tempObj = {};
                tempObj[subCategory] = -1
                res.send(tempObj);
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

app.post('/api/insert2', urlencodedParser, (req, res) => {
    console.log('finally!', req.body);
    let id = req.body.id;
    let category = req.body.category;
    let timeSpent = parseInt(req.body.timeSpent);
    if (category === 'gaming' || category === 'onlinetv' || category === 'socialmedia') {
        exists('entertainment', id, category, timeSpent).then(result => {
            if (result.status) {
                res.send(result.response);
                updateTime('entertainment', id, timeSpent, category);
            }
            else {
                upsertTime('entertainment', id, timeSpent, category, res);
            }
        });
    }
    else if (category === 'productivity') {
        exists('productivity', id, "", timeSpent).then(result => {
            res.send({ 'productivity': -1 });
            if (result.status)
                updateTime('productivity', id, timeSpent, null);
            else
                upsertTime('productivity', id, timeSpent, null);
        });
    }
    else {
        exists('others', id, 'others', timeSpent).then(result => {
            if (result.status) {
                res.send(result.response);
                updateTime('others', id, timeSpent, 'others');
            }
            else
                upsertTime('others', id, timeSpent, 'others', res);
        });
    }
})

/*
    {url:"www.url.com"}
*/
app.post('/api/getcategory', urlencodedParser, (req, res) => {
    let url = req.body.url;
    if (url in preDefined)
        res.send(`{"msg":"${preDefined[url]}", "status":"${true}"}`);
    else {
        axios(url).then(response => {
            var x = new Promise((resolve, reject) => {
                // resolve(parseClassify.findCategory(url));
                resolve(crawler.getCategory(url));
            });

            // Adds URL Category to MongoDB
            x.then((category) => {
                console.log(category);
                res.contentType('application/json');
                res.send(`{"msg":"${category}", "status":"${true}"}`);
            })
                .catch(error => {
                    console.log(error);
                    res.send(`{"msg":"Unable to parse the URL", "status":"${false}"}`);
                })

        })
            .catch(error => {
                console.log(error);
                res.send(`{"msg":"Unable to reach the URL", "status":"${false}"}`);
            })
    }
})

/*
    id, start (in millisecs), end (in millisecs)
    for today's usage => id, today:true
*/
app.post('/api/getuserhistory', urlencodedParser, (req, res) => {
    var data = {};
    var id = req.body.id;
    var startDate, endDate;
    var condition = {}
    if (req.body.today === undefined || !req.body.today) {
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
                            objArray1.push(obj1);
                        }
                        if (y.dates.onlinetv.limit !== -1) {
                            obj2['limit'] = y.dates.onlinetv.limit;
                            obj2['used'] = y.dates.onlinetv.used;
                            objArray2.push(obj2);
                        }
                        if (y.dates.socialmedia.limit !== -1) {
                            obj3['limit'] = y.dates.socialmedia.limit;
                            obj3['used'] = y.dates.socialmedia.used;
                            objArray3.push(obj3);
                        }
                        // objArray1.push(obj1);
                        // objArray2.push(obj2);
                        // objArray3.push(obj3);
                    });
                    if (objArray1.length) data['gaming'] = objArray1;
                    if (objArray2.length) data['onlinetv'] = objArray2;
                    if (objArray3.length) data['socialmedia'] = objArray3;
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

/* 
    {
        id:"USER ID",
        urls:[
            {url:"www.URL1.com", timeSpent:40},
            {url:"www.URL2.com", timeSpent:50},
            {url:"www.URL3.com", timeSpent:60},
        ]
    }
*/
app.post('/api/insert', urlencodedParser, (req, res) => {
    var urls = req.body.urls;
    var id = req.body.id;
    if (id !== undefined && urls.length) {
        res.contentType('application/json');
        res.send(`{"message":"Urls sent for processing"}`);
        for (let i in urls) {
            let url = urls[i].url;
            let timeSpent = parseInt(urls[i].timeSpent);
            console.log(i, url);
            axios(url).then(response => {
                console.log("INSIDE=> " + url);
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
                // res.contentType('application/json');
                // res.send(`{"message":"URL : ${url} added"}`);
            })
                .catch(error => {
                    console.log(error);
                    // res.contentType('application/json');
                    // res.send('{"message":"Unable to reach URL"}');
                })
        }
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
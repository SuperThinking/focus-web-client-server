//YET TO BE IMPLEMENTED
//WILL HAVE TO CHANGE A LOT OF PREVIOUS DATA
//https://monkeylearn.com/blog/practical-explanation-naive-bayes-classifier/

//NOTES
//Tried Laplace Smoothing, but didn't work.

var datasetCounts = {
    'Gaming': 20825,
    'ECommerce': 13391,
    'all': 22763,
    'Online TV': 8310,
    'Productivity': 10674,
    'Social Media': 7477
}

naiveBayes = (a, b, aw) => {
    var n = 1, d1 = 0, d2 = datasetCounts['all'] + aw;
    var k_a = Object.keys(a);
    for (let i = 0; i < k_a.length; i++) {
        d1 = 1;
        if(k_a[i] in b)
            d1 = (b[k_a[i]][0]+1)
        n *= ((10000*d1) / d2);
    }
    return n;
}

findnaiveBayes = (a, b) => {
    var scores = {};
    for (let i in b)
    {
        var z = naiveBayes(a, b[i], datasetCounts[i]);
        scores[z] = i;
    }
    return scores;
}

module.exports = {
    findnaiveBayes
}
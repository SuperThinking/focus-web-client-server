cosineSimilarity = (a, b)=>{
    var n = 0, d1 = 0, d2 = 0;
    var k_a = Object.keys(a);
    for(let i=0; i<k_a.length; i++)
    {
        n+=((a[k_a[i]][2])*(b[k_a[i]]?b[k_a[i]][2]:0));
        d1 += (b[k_a[i]])?a[k_a[i]][2]*a[k_a[i]][2]:0;
        d2 += (b[k_a[i]])?b[k_a[i]][2]*b[k_a[i]][2]:0;
    }
    return (n!==0)?(n/((Math.sqrt(d1))*(Math.sqrt(d2)))):0;
}

findcosineSimilarity = (a, b)=>{
    scores = {}
    for(let i in b)
        scores[cosineSimilarity(a, b[i])]=i
    return scores;
}

module.exports = {
    findcosineSimilarity
}
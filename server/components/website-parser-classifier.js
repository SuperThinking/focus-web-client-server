var axios = require('axios');
var cheerio = require('cheerio');

parseAndGetContent = (url)=>{
    axios.get(url).then(res=>{
        const $ = cheerio.load(res.data);
        $('script').remove();
        $('img').remove();
        $('style').remove();
        $('meta').remove();
        var data = $('html *').contents().map(function() {
            return (this.type === 'text' && $(this).text().trim()[0]!='<' && $(this).text().trim().length>3) ? $(this).text().trim()+' ' : '';
        }).get().join('');
        console.log(data.split(' '));
    });
}

module.exports = {
    parseAndGetContent
}
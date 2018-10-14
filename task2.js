const express = require('express')
const cheerio = require("cheerio");
const request = require('request');
const async = require("async");
const app = express()
const port = 3001;
app.get('/I/want/title', (req, res, next) => {
    var addressesArray = [];
    
    if (!req.query.address) {
        res.set('Content-Type', 'text/html');
        res.status(404).send('<html><body><h1>Error 404: ' + req.url + ' should have some addresses</h1></body></html>');
    }
    var titleArray = [];
    async.waterfall([
        function getParameters(cb) {
            if (req.query.address instanceof Array)
                addressesArray = req.query.address;
            else
                addressesArray.push(req.query.address)
            cb(null, addressesArray)
        },
        function makeRequest(param, cb) {
            param.forEach(function (element, i) {
                let addresWithHttp = appendHTTP(element);
                request(addresWithHttp, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let $ = cheerio.load(body);
                        titleArray.push({name:element,title:$("title").html()})
                        if (titleArray.length == addressesArray.length) {
                            cb(titleArray)
                        }
                    }
                    if (typeof response === "undefined" || typeof body === "undefined") {
                        titleArray.push({name:element,title:'No Response'})
                        if (element.length == addressesArray.length) {
                            cb(titleArray)
                        }
                    }
                })
            }, this)
        }
    ], function (title) {
        res.set('Content-Type', 'text/html');
        let str = '<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>'
        for (let it = 0; it < title.length; it++) {
            str += `<li>Title of ${title[it].name} is : <strong>${title[it].title}</strong> </li>`;
            if ((it + 1) == title.length) {
                str += '</ul></html>';
                res.send(str)
            }
        }

    })
})


function appendHTTP(string) {
    let address="";
    if (string.substring(0, 7) != "http://" && string.substring(0, 8) != 'https://') {
       return address = "http://" + string;
    }
    else
    return string;
}
app.get("*",(req,res,next)=>{
    res.send('Not Found')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


const express = require('express')
const cheerio = require("cheerio");
const request = require('request');
const async = require("async");
const app = express();
const port = 3002;
var RSVP = require('rsvp');
app.get('/I/want/title', (req, res, next) => {


    if (!req.query.address) {
        res.set('Content-Type', 'text/html');
        res.status(404).send('<html><body><h1>Error 404: ' + req.url + ' should have some addresses</h1></body></html>');
    }

    getParams(req.query.address).then(makeReq).then((strw) => {

        res.set('Content-Type', 'text/html');
        var str = '<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>'

        str = str + strw + '</ul></html>';
        res.send(str)

    })
})

function getParams(params) {
    var addressesArray = [];
    return new RSVP.Promise(function (resolve, reject) {
        if (params instanceof Array)
            addressesArray = params;
        else
            addressesArray.push(params)
        resolve(addressesArray)

    })
}
function makeReq(param) {
    var titleArray = [];

    return new RSVP.Promise(function (resolve, reject) {
        let count = 0;
        let str = "";
        param.forEach(function (element, i) {
            let addresWithHttp = appendHTTP(element);
            request(addresWithHttp, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    if (++count == param.length) {
                        str += `<li>Title of ${element} is : <strong>${$("title").html()}</strong> </li>`;
                        resolve(str)
                    }
                    else {
                        str += `<li>Title of ${element} is : <strong>${$("title").html()}</strong> </li>`;
                    }
                }
                if (typeof response === "undefined" || typeof body === "undefined") {
                    if (++count == param.length) {
                        str += `<li>Title of ${element} is : <strong>No Response</strong> </li>`;
                        resolve(str)
                    }
                    else {
                        str += `<li>Title of ${element} is : <strong>No Response</strong> </li>`;
                    }
                }
            })
        })
    })
}
function sendResponse(arr) {
    res.set('Content-Type', 'text/html');
    var str = '<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>'
    for (var it = 0; it < title.length; it++) {
        str += `<li>Title of ${param[it]} is : <strong>${title[it]}</strong> </li>`;
        if ((it + 1) == title.length) {
            str += '</ul></html>';
            res.send(str)
        }
    }

}

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


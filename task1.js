const express = require('express')
const cheerio = require("cheerio");
const request = require('request');
const app = express()
const port = 3000
const str = '<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>';
app.get('/I/want/title', (req, res, next) => {
    let addressesArray = [];
    if (!req.query.address) {
        res.set('Content-Type', 'text/html');
        res.status(404).send('<html><body><h1>Error 404: ' + req.url + ' should have some addresses</h1></body></html>');
    }
    if (req.query.address instanceof Array)
        addressesArray = req.query.address;
    else
        addressesArray.push(req.query.address)
    res.writeHeader(200, { "Content-Type": "text/html" });
    res.write(str)
    let count = 0;
    for (let i in addressesArray) {
        makeRequest(addressesArray[i], (str) => {
            res.write(str)
            if (++count == addressesArray.length) {
                res.write('</ul></html>')
                res.end()
            }

        })
    }
})
function makeRequest(add, cb) {
    let addresWithHttp = appendHTTP(add);
    request(addresWithHttp, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);
            cb(`<li>Title of ${add} is : <strong>${$("title").html()}</strong></li>`)
        }
        if (typeof response === "undefined" || typeof body === "undefined") {
            cb(`<li>Title of ${add} is :<strong> No Response</strong></li>`)
        }
    })
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


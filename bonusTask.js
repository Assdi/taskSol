const express = require('express')
const cheerio = require("cheerio");
const request = require('request');
const async = require("async");
const app = express();
var fs = require('fs');
const port = 3003;
const { Observable, Subject, ReplaySubject, from, of, range, forkJoin, bindNodeCallback } = require('rxjs');
const { map, filter, switchMap, mergeMap, pipe, reduce, tap } = require('rxjs/operators');


app.get('/I/want/title', (req, res, next) => {
    let addressesArray = [];

    if (!req.query.address) {
        res.set('Content-Type', 'text/html');
        res.status(404).send('<html><body><h1>Error 404: ' + req.url + ' should have some addresses</h1></body></html>');
    }
    if (req.query.address instanceof Array)
        addressesArray = req.query.address;
    else
        addressesArray.push(req.query.address);
    let a = [];

    from(addressesArray).pipe(
        mergeMap(address => {
            return new Observable(obs => {
                let addressWithHTTP = appendHTTP(address)
                console.log(addressWithHTTP)
                request(addressWithHTTP, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let $ = cheerio.load(body);
                        obs.next({name:address,title:$('title').html()})
                    }

                    else
                        obs.next({name:address,title:'No Response'})
                    obs.complete()
                })
            })
        }),
        reduce((allResponses, response) => {
            return allResponses += `<li>   Title of ${response.name} is : <strong> ${response.title}</strong>  </li>`;
        }, ''),
        tap(allResponses => {
            res.writeHeader(200, { "Content-Type": "text/html" });
            let str = '<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>'
            res.write(str + allResponses + '</ul')
            res.end()
        })
    ).subscribe()


})
function appendHTTP(string) {
    let address="";
    if (string.substring(0, 7) != "http://" && string.substring(0, 8) != 'https://') {
       return address = "http://" + string;
    }
    else
    return string;
}
app.get("*", (req, res, next) => {
    res.send('Not Found')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

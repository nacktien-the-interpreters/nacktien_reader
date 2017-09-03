// var request = require('request');
// request('http://nacktien-the-interpreters.github.io/feed.xml', function (error, response, body) {
//   console.log('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });
'use strict'
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

var Alexa = require('alexa-sdk')

// exports.handler = function(event, context, callback){
//     var alexa = Alexa.handler(event, context, callback);
// };

let articles = []

var FeedParser = require('feedparser')
var request = require('request') // for fetching the feed

var req = request('http://nacktien-the-interpreters.github.io/feed.xml')
var feedparser = new FeedParser([])

req.on('error', function () {
  // handle any request errors
})

req.on('response', function (res) {
    var stream = this // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'))
    }
    else {
        stream.pipe(feedparser)
    }
})

feedparser.on('error', function () {
  // always handle errors
})

feedparser.on('end', function () {
    var article = articles[Math.floor(Math.random()*articles.length)]
    console.log(article)
    console.log(article.length)
})



feedparser.on('readable', function () {
  // This is where the action is!
    var stream = this // `this` is `feedparser`, which is a stream
    var item

    while (item = stream.read()) {
    // console.log(item);
        // item.description = item.description.replace(/\<[^)]*?\> */gm, "")
    
        articles.push(item.summary)
    }

    // console.log(articles.length)
})

let finished = false;

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context, callback)
    
    function returnArticle(alexa){
        if (finished) {
            var article = articles[Math.floor(Math.random()*articles.length)]
            alexa.emit(':tell', article)
        }else{
            feedparser.on('end', function () {
                var article = articles[Math.floor(Math.random()*articles.length)]
                alexa.emit(':tell', article)
                finished = true
            })
        }
    }


    var handlers = {
        'LaunchRequest': function () {
            returnArticle(this)
        },
        'SayHello': function () {
            returnArticle(this)
        },
        'AMAZON.CancelIntent': function () {
            this.emit('SessionEndedRequest')
        },
        'Unhandled': function () {
            returnArticle(this)
        }
    }

    alexa.registerHandlers(handlers)
    alexa.execute()

}



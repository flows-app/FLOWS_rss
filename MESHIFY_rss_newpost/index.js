const AWS = require("aws-sdk");
const FEEDPARSER = require("feedparser");
const REQUEST = require('request');

exports.handler = (event, context,callback) => {
  console.log("event");
  console.log(event);
  console.log("context");
  console.log(context);

  var feedparser = new FEEDPARSER();

  //var req = request('http://somefeedurl.xml')
  var req = REQUEST(event.url);

  req.on('error', function (error) {
    // handle any request errors
  });

  req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    }
    else {
      stream.pipe(feedparser);
    }
  });

  feedparser.on('error', function (error) {
    // always handle errors
  });

  var result = [];

  feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;
    let title = meta.title;
    let description = meta.description;
    let date = meta.date;
    let link = meta.link;

    let feed = {
      title: title,
      description: description,
      date: date,
      link: link
    };

    while (item = stream.read()) {
      //console.log(item);
      let title =  item.title;
      let description = item.description;
      let summary = item.summary;
      let date = item.date;
      let link = item.link;
      let guid = item.guid;

      let entry ={
        title: title,
        description: description,
        summary: summary,
        date: date,
        link: link,
        guid: guid,
        feed: feed,
        dedupid: feed.link+item.link
      };
      result.push(entry);
      console.log(JSON.stringify(entry,null,2));
    }
  });
  feedparser.on('end', function(){
    console.log(JSON.stringify(result,null,2));
    callback(null,result);
  });
}

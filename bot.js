console.log("the bot is starting");
var fs = require("fs");
var path = require("path");
var Twit = require("twit");
var config = require("./config");

var T = new Twit(config);

/* var params = {
	q: 'comics since:2017-4-14',
	count: 2
}

T.get('search/tweets', params, gotData);

function gotData(err, data, response) {
	var tweets = data.statuses;
	for (var i = 0; i<tweets.length; i++) {
		console.log(tweets[i].text);
	}
	//console.log(data);
}
*/

//User Stream
var stream = T.stream("user");

//Anytime someone follows me
stream.on("follow", followed);

function followed(eventMsg) {
  console.log("Follow event!");
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  tweetIt("@" + screenName + "  thanks for following!");
}

//Anytime someone tweets me
stream.on("tweet", tweetEvent);

function tweetEvent(eventMsg) {
  //console.log('eventMsg');
  //var fs = require('fs');
  //var json = JSON.stringify(eventMsg,null,2);
  //fs.writeFile("tweet.json", json);

  var replyto = eventMsg.in_reply_to_screen_name;
  var text = eventMsg.text;
  var from = eventMsg.user.screen_name;

  console.log(replyto + " " + from);

  if (replyto === "SuperBo78959631") {
    var newtweet = "@" + from + "  tell me about your favorite Airstream";
    tweetIt(newtweet);
  }
}

function tweetIt(txt) {
  var tweet = {
    status: txt
  };

  T.post("statuses/update", tweet, tweeted);

  function tweeted(err, data, response) {
    if (err) {
      console.log("Something went wrong!");
    } else {
      console.log("It worked!");
    }
  }
}
// find latest tweet according the query 'q' in params
var retweet = function() {
  var params = {
    q: "#airstream",
    result_type: "recent",
    lang: "en"
  };
  T.get("search/tweets", params, function(err, data) {
    // if there no errors
    if (!err) {
      // grab ID of tweet to retweet
      var retweetId = data.statuses[0].id_str;
      // Tell T to retweet
      T.post(
        "statuses/retweet/:id",
        {
          id: retweetId
        },
        function(err, response) {
          if (response) {
            console.log("Retweeted!!!");
          }
          // if there was an error while tweeting
          if (err) {
            console.log(
              "Something went wrong while RETWEETING... Duplication maybe..."
            );
          }
        }
      );
    }
    // if unable to Search a tweet
    else {
      console.log("Something went wrong while SEARCHING...");
    }
  });
};

var retweetA = function() {
  var params = {
    q: "#Airstream",
    result_type: "recent",
    lang: "en"
  };
  T.get("search/tweets", params, function(err, data) {
    // if there no errors
    if (!err) {
      // grab ID of tweet to retweet
      var retweetId = data.statuses[0].id_str;
      // Tell T to retweet
      T.post(
        "statuses/retweet/:id",
        {
          id: retweetId
        },
        function(err, response) {
          if (response) {
            console.log("Retweeted!!!");
          }
          // if there was an error while tweeting
          if (err) {
            console.log(
              "Something went wrong while RETWEETING... Duplication maybe..."
            );
          }
        }
      );
    }
    // if unable to Search a tweet
    else {
      console.log("Something went wrong while SEARCHING...");
    }
  });
};

// grab & retweet as soon as program is running...
retweet();
retweetA();
// retweet in every 2 minutes
setInterval(retweet, 60 * 1000 * 6);
setInterval(retweetA, 60 * 1000 * 13);

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function() {
  var params = {
    q: "#airstream",
    result_type: "recent",
    lang: "en"
  };
  // find the tweet
  T.get("search/tweets", params, function(err, data) {
    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet); // pick a random tweet

    // if random tweet exists
    if (typeof randomTweet != "undefined") {
      // Tell T to 'favorite'
      T.post("favorites/create", { id: randomTweet.id_str }, function(
        err,
        response
      ) {
        // if there was an error while 'favorite'
        if (err) {
          console.log("CANNOT BE FAVORITE... Error");
        } else {
          console.log("FAVORITED... Success!!!");
        }
      });
    }
  });
};

// grab & 'favorite' as soon as program is running...
favoriteTweet();
// 'favorite' a tweet in every 3 minutes
setInterval(favoriteTweet, 60 * 1000 * 5);

// function to generate a random tweet tweet
function ranDom(arr) {
  var index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

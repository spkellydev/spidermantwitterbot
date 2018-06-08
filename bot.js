var fs = require("fs");
var path = require("path");
const logger = require("./util/logger");
var Twit = require("twit");
var config = require("./config");

var T = new Twit(config);
logger.info("Initizialization", { twitter: "bot started" });

const airstreamHashes = [
  "liveriveted",
  "EndlessCaravan",
  "tinyhouse",
  "vanlife",
  "rvlife",
  "airstreamlife",
  "airstream",
  "Airstream",
  "rv",
  "camper",
  "camperlife",
  "airstreamdreams",
  "airstreamrenovation",
  "travel",
  "travellife",
  "tinyhousemovement",
  "airstreamambassadors",
  "roadtrip",
  "motorhome",
  "traveltrailer",
  "Glamping",
  "glamping",
  "homeiswhereyouparkit",
  "vintagetrailer",
  "gorving",
  "rvliving",
  "fulltimerv",
  "nomad",
  "boondocking",
  "Alumapalooza",
  "camping",
  "getaway",
  "digitalnomad",
  "adventure",
  "caravan",
  "caravans",
  "lifegoals"
];
//User Stream
var stream = T.stream("user");

//Anytime someone follows me
stream.on("follow", followed);

function followed(eventMsg) {
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;

  if (screenName) {
    tweetIt("@" + screenName + "  thanks for following!");
    logger.info("Event", {
      twitter: "Follow Event",
      screenName: screenName,
      name: name
    });
  } else {
    logger.bug("Event", { twitter: "Could not Follow", eventMsg: eventMsg });
  }
}

//Anytime someone tweets me
stream.on("tweet", tweetEvent);

function tweetEvent(eventMsg) {
  var replyto = eventMsg.in_reply_to_screen_name;
  var text = eventMsg.text;
  var from = eventMsg.user.screen_name;

  console.log(replyto + " " + from);

  if (replyto === "airstreamiest") {
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
      logger.bug("Event", {
        twitter: "Tweet Event",
        err: err
      });
    } else {
      console.log(data);
      logger.info("Event", {
        twitter: "Tweet Event",
        updateData: data
      });
    }
  }
}

function filterByScreenName(tweets) {
  const blacklist = ["airstreamiest", "airstreamsc", "airstream4sale"];
  let usable = [];
  tweets.forEach((tweet, i) => {
    if (!blacklist.includes(tweet.user.screen_name.toLowerCase())) {
      usable.push({
        screen_name: tweet.user.screen_name,
        id_str: tweet.id_str,
        text: tweet.text
      });
    }
  });

  return usable;
}

var retweet = function(q) {
  if (typeof q === "undefined") {
    console.log("no q");
    return;
  }

  var params = {
    q: "#" + q,
    result_type: "recent",
    lang: "en"
  };

  T.get("search/tweets", params, function(err, data) {
    // if there no errors
    if (!err) {
      // grab ID of tweet to retweet

      let availableRetweets = data.statuses;
      availableRetweets = filterByScreenName(availableRetweets);
      logger.info("retweet", availableRetweets);

      var retweetId = availableRetweets[0].id_str;

      // Tell T to retweet
      T.post(
        "statuses/retweet/:id",
        {
          id: retweetId
        },
        function(err, response) {
          if (response.id_str !== "undefined") {
            console.log("Retweeted!!!");
            logger.info("Event", {
              twitter: "Retweet Event",
              tweetID: response.id_str,
              tweet: response.text,
              hashtags: response.entities
            });
          }
          // if there was an error while tweeting
          if (err) {
            logger.bug("Event", {
              twitter: "Retweet Event",
              err: err.message
            });
          }
        }
      );
    }
    // if unable to Search a tweet
    else {
      console.log("Something went wrong while SEARCHING...");
      logger.bug("Search", {
        twitter: "Search Failed",
        err: JSON.stringify(err.message)
      });
    }
  });
};

// grab & retweet as soon as program is running...
retweet("airstream");
// retweet in every 6 minutes
setInterval(retweet, 60 * 1000 * Math.floor(Math.random() * 20));

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function() {
  var params = {
    q: "#liveriveted",
    result_type: "recent",
    lang: "en"
  };
  // find the tweet
  T.get("search/tweets", params, function(err, data) {
    // find tweets
    var tweet = filterByScreenName(data.statuses);
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
          logger.bug("Event", {
            twitter: "Favorite Event",
            nonfavoritedTweet: randomTweet
          });
        } else {
          console.log("FAVORITED... Success!!!");
          logger.info("Event", {
            twitter: "Favorite Event",
            tweetID: randomTweet.id_str,
            text: randomTweet.text
          });
        }
      });
    }
  });
};

// grab & 'favorite' as soon as program is running...
favoriteTweet();
// 'favorite' a tweet in every 5 minutes
setInterval(favoriteTweet, 60 * 1000 * 15);

// function to generate a random tweet tweet
function ranDom(arr) {
  if (arr === undefined) {
    logger.bug("Rate Limiting", { timeout: "30 minutes" });
    setTimeout(function() {
      var index = Math.floor(Math.random() * arr.length);
      return arr[index];
    }, 60 * 1000 * 30);
  } else {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }
}

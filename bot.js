console.log('the bot is starting');
var fs = require('fs');
var path = require('path');
var Twit = require('twit');
var config = require('./config');


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
var stream = T.stream('user');

//Anytime someone follows me
stream.on('follow', followed);

function followed(eventMsg) {
	console.log('Follow event!');
	var name = eventMsg.source.name;
	var screenName = eventMsg.source.screen_name;
	tweetIt('@' + screenName + '  thanks for following!');
}


//Anytime someone tweets me
stream.on('tweet', tweetEvent);

function tweetEvent(eventMsg) {
	//console.log('eventMsg');
	//var fs = require('fs');
	//var json = JSON.stringify(eventMsg,null,2);
	//fs.writeFile("tweet.json", json);

	var replyto = eventMsg.in_reply_to_screen_name;
	var text = eventMsg.text;
	var from = eventMsg.user.screen_name;

	console.log(replyto + ' ' + from);

	if (replyto === 'tweeter__parker') {
		var newtweet = '@' + from + ' thank you for tweeting at me!';
		tweetIt(newtweet);
	}
}



function tweetIt(txt) {
	var tweet = {
		status: txt
	}

	T.post('statuses/update', tweet, tweeted);




	function tweeted(err, data, response) {
		if(err) {
			console.log("Something went wrong!");
		} else {
			console.log("It worked!");
		}
	}	
}
// find latest tweet according the query 'q' in params
var retweet = function() {
    var params = {
        q: '#spiderman',
        q: '#spider-man', // test
        result_type: 'recent',
        lang: 'en'
    }
    T.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err) {
          // grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell T to retweet
            T.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (response) {
                    console.log('Retweeted!!!');
                }
                // if there was an error while tweeting
                if (err) {
                    console.log('Something went wrong while RETWEETING... Duplication maybe...');
                }
            });
        }
        // if unable to Search a tweet
        else {
          console.log('Something went wrong while SEARCHING...');
        }
    });
}

// grab & retweet as soon as program is running...
retweet();
// retweet in every 2 minutes
setInterval(retweet, 60*1000*2);

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function(){
  var params = {
      q: '#spidey',
      q: '#marvel',  // REQUIRED
      result_type: 'recent',
      lang: 'en'
  }
  // find the tweet
  T.get('search/tweets', params, function(err,data){

    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell T to 'favorite'
      T.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'favorite'
        if(err){
          console.log('CANNOT BE FAVORITE... Error');
        }
        else{
          console.log('FAVORITED... Success!!!');
        }
      });
    }
  });
}


function pick_random_image(images){
  return images[Math.floor(Math.random() * images.length)];
}

function upload_random_image(images){
  console.log('Opening an image...');
  var image_path = path.join(__dirname, '/images/' + pick_random_image(images)),
      b64content = fs.readFileSync(image_path, { encoding: 'base64' });

  console.log('Uploading an image...');

  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
    if (err){
      console.log('ERROR:');
      console.log(err);
    }
    else{
      console.log('Image uploaded!');
      console.log('Now tweeting it...');

      T.post('statuses/update', {
        media_ids: new Array(data.media_id_string)
      },
        function(err, data, response) {
          if (err){
            console.log('ERROR:');
            console.log(err);
          }
          else{
            console.log('Posted an image!');
          }
        }
      );
    }
  });
}


fs.readdir(__dirname + '/images', function(err, files) {
  if (err){
    console.log(err);
  }
  else{
    var images = [];
    files.forEach(function(f) {
      images.push(f);
    });

  /*
    You have two options here. Either you will keep your bot running, and upload images using setInterval (see below; 10000 means '10 milliseconds', or 10 seconds), --
  */
    setInterval(function(){
      upload_random_image(images);
    }, 1000*60*20);

  /*
    Or you could use cron (code.tutsplus.com/tutorials/scheduling-tasks-with-cron-jobs--net-8800), in which case you just need:
  */

    // upload_random_image(images);
  }
});


// grab & 'favorite' as soon as program is running...
favoriteTweet();
// 'favorite' a tweet in every 6 minutes
setInterval(favoriteTweet, 60*1000*6);

// function to generate a random tweet tweet
function ranDom (arr) {
  var index = Math.floor(Math.random()*arr.length);
  return arr[index];
};

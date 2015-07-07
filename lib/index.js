//
//  RTD2 - Twitter bot that tweets about the most popular github.com news
//  Also makes new friends and prunes its followings.
//
var Bot = require('./bot'),
  Markov = require("./markov"),
  config = require('../config');

var bot = new Bot(config.twitter);

console.log('CTBot: Running.');

var markov = new Markov(config.markov);

if (config.autoFollow) {
  setInterval(function() {
    bot.followRandom(function(err, reply) {
      if (err) return handleError(err);

      var name = reply.screen_name;
      var id = reply.id;
      console.log('\nFollowed @' + name);

      setTimeout(function() {
        bot.isFollowingMe(id, function(err, reply) {
          if (err) {
            return handleError(err);
          }

          if (reply && reply.length > 0) { //He followed me
            setTimeout(function() {
              bot.unfollow(id, function(err, reply) {
                if (err) {
                  console.log("Couldn´t unfollow. " + err);
                  return;
                }
                console.log('\nUnfollowed @' + reply.screen_name);
              });
            }, getRandomInt(4 * 60 * 60, 5 * 60 * 60) * 1000); //Random between 4 and 5 hours
          } else { //He didnt follow me
            bot.unfollow(id, function(err, reply) {
              if (err) {
                console.log("Couldn´t unfollow. " + err);
                return;
              }
              console.log('\nUnfollowed @' + reply.screen_name + ".\nHe is not my friend >:(");
            });
          }
        });

      }, getRandomInt(4 * 60 * 60, 5 * 60 * 60) * 1000); //Random between 4 and 5 hours
    });
  }, 65000);
}

var queries = [
  //'@LVPesCSGO',
  '#csgo',
  '@ESEA',
  '@FACEIT',
  '#CSGOProLeague'
];

if (config.autoRetweet) {
  bot.retweetRandom(queries.join(' OR '));
  setInterval(function() {
    bot.retweetRandom(queries.join(' OR '));
  }, getRandomInt(15 * 60, 25 * 60) * 1000);
}


//MARKOV Tweet
var learnQueries = [
  //'@LVPesCSGO',
  '#csgo',
  '@ESEA',
  '@FACEIT',
  '#CSGOProLeague'
];



var stream = bot.twit.stream('statuses/filter', {
  track: learnQueries.join(","),
  language: 'es, en'
})

stream.on('tweet', function(tweet) {
  //Skip retweets
  if (!tweet.text.startsWith("RT")) {
    markov.learn(tweet.text);
  }
});

setInterval(function() {
  bot.tweet(markov.ask(), function(err, data, retweet) {
    if (err) return handleError(err);
    console.log('\nTweet: ' + (data ? data.text : data));
  });
}, getRandomInt(10 * 60, 20 * 60) * 1000)



function handleError(err) {
  console.error('Error(' + err.statusCode + "): " + err.data);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
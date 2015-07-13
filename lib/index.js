var fs = require('fs');

var Bot = require('./bot'),
  Markov = require("./markov"),
  config = require('../config');

var bot = new Bot(config.twitter);

console.log('CTBot: Running.');

if (config.markov && config.markov !== false) {
  //Load Markov memory
  console.log("(Markov) Loading memory.");
  try {
    var memory = readFileSync("./saved_memory.json");
    var count = readFileSync("./saved_count.json");
  } catch (e) {
    console.log("(Markov) There wasnt a memory saved.");
  }
  var markov = new Markov(config.markov, memory, count);

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
    language: config.lang || 'es, en'
  });

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
  }, getRandomInt(20 * 60, 40 * 60) * 1000);


  //Save Markov memory
  setInterval(function() {
    writeFile("./saved_count.json", markov.count, function(err) {
      if (err) return console.error(err);
      console.log("\n(Markov) Saved memory.");

      writeFile("./saved_memory.json", markov.memory, function(err) {
        if (err) return console.error(err);
        console.log("(Markov) Saved memory.");
      });
    });
  }, 20 * 60 * 1000);
}


if (config.autoFollow) {
  setInterval(function() {
    bot.followRandom(function(err, reply) {
      if (err) return handleError(err);

      var name = reply.screen_name;
      var id = reply.id;
      console.log('\nFollowed @' + name);

      setTimeout(function() {
        bot.isFollowingMe(id, function(result) {
          if (result) { //He followed me
            setTimeout(function() {
              bot.unfollow(id, function(err, reply) {
                if (err) {
                  console.log("Couldn´t unfollow. " + err);
                  return;
                }
                console.log('\nUnfollowed @' + reply.screen_name);
              });
            }, 3 * 60 * 60 * 1000); //Random between 4 and 5 hours
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
      }, 4 * 60 * 60 * 1000); //Random between 4 and 5 hours
    });
  }, 130000);
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
  }, getRandomInt(30 * 60, 50 * 60) * 1000);
}



function handleError(err) {
  console.error('Error(' + err.statusCode + "): " + err.data);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readFileSync(file, options) {
  options = options || {}
  if (typeof options === 'string') {
    options = {
      encoding: options
    }
  }

  var shouldThrow = 'throws' in options ? options.throw : true

  if (shouldThrow) { // i.e. throw on invalid JSON
    return JSON.parse(fs.readFileSync(file, options), options.reviver)
  } else {
    try {
      return JSON.parse(fs.readFileSync(file, options), options.reviver)
    } catch (err) {
      return null
    }
  }
}

function writeFile(file, obj, options, callback) {
  if (callback == null) {
    callback = options
    options = {}
  }

  var spaces = typeof options === 'object' && options !== null ? 'spaces' in options ? options.spaces : this.spaces : this.spaces

  var str = ''
  try {
    str = JSON.stringify(obj, options ? options.replacer : null, spaces) + '\n'
  } catch (err) {
    if (callback) return callback(err, null)
  }

  fs.writeFile(file, str, options, callback)
}
var fs = require('fs');

var Bot = require('./bot'),
  Markov = require("./markov"),
  config = require('../config');

var bot = new Bot(config.twitter);
var currentFollowings = [];


console.log('CTBot: Running.');

if (config.markov && config.markov.enabled !== false) {
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
    track: learnQueries.join(", "),
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
  var followCycle = function() {
    followRandom(function(id, name) {
        setTimeout(function() {
          bot.isFollowingMe(id, function(result) {
            if (result) { //He followed me
              setTimeout(function() {
                unfollow(id);
              }, 3 * 60 * 60 * 1000); //Random between 4 and 5 hours
            } else { //He didnt follow me
              unfollow(id, (err) => {
                console.log('\nHe is not my friend >:(');
              });
            }
          });
        }, 4 * 60 * 60 * 1000); //Random between 4 and 5 hours
      });
  }

  setInterval(function() {
    followCycle();
  }, 130000, );
  
  followCycle();
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


process.on('exit', function () {
  console.log('Exiting!');

  //Unfollow current follows
  for(var id in currentFollowings) {
    if(currentFollowings[id] != null && id != "random") {
      console.log('Unfollowing ' + id);
      unfollow(id);
    }
  }
});

//Catch ctrl+c event
process.on('SIGINT', function() {
  console.log('Exiting!');

  //Unfollow current follows
  for(var id in currentFollowings) {
    if(currentFollowings[id] != null && id != "random") {
      console.log('Unfollowing ' + id);
      unfollow(id);
    }
  }
});


function followRandom(callback)
{
  bot.followRandom(function(err, reply) {
    if (err) return handleError(err);


    var name = reply.screen_name;
    var id = reply.id;

    console.log('\nFollowed @' + name);

    if(callback) callback(id, name);
  });
}

function unfollow(id, callback)
{
  bot.unfollow(id, function(err, reply) {
    currentFollowings[id] = null;

    if (err)
      console.log("Couldn´t unfollow. " + err);
    else
      console.log('\nUnfollowed @' + reply.screen_name);
    
    if(callback) callback(err);
  });
}




function handleError(err) {
  if(err[0])
    console.error('Error(' + err[0].code + "): ");
  console.error(err);
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

//UTIL
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
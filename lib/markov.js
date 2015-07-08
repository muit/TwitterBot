/************
 * Requires *
 ************/
var mongoose = require("mongoose");
var Word = require("./models/word");
var StartWord = require("./models/start_word");

/****************
 * Markov Class *
 ****************/
function Markov(config) {
  var self = this;

  self.config = config;

  self.separator = config.separator;
  self.order = config.order;
  /*
  self.log("Using database '" + config.database + "'");

  mongoose.connect("mongodb://localhost/" + config.database);

  mongoose.connection.on('error', function(err) {
    self.log('Connection error:' + err);
    process.exit(1);
  });
  mongoose.connection.once('open', function() {
    self.log('Connected.');
    self.registry("Mi nombre es Miguel.");

    self.registry("Madrid es muy caluroso.");
  });
  */
}

Markov.prototype = {
  config: null,
  memory: {},
  separator: ' ',
  order: 2,
  learnSize: 8000,

  count: 0,

  learn: function(txt) {
    this.count++;
    if(this.count > this.learnSize){
      this.reset();  
    }

    var mem = this.memory;
    this.breakText(txt, learnPart);

    this.log("Learned '" + txt + "'");

    function learnPart(key, value) {
      if (!mem[key]) {
        mem[key] = [];
      }
      mem[key].push(value);

      return mem;
    }
  },

  ask: function(seed) {
    if (!seed) {
      seed = this.genInitial();
    }

    return seed.concat(this.step(seed, [])).join(this.separator);
  },

  step: function(state, ret) {
    var nextAvailable = this.memory[state] || [''],
      next = nextAvailable.random();

    //we don't have anywhere to go
    if (!next) {
      return ret;
    }

    ret.push(next);

    var nextState = state.slice(1);
    nextState.push(next);
    return this.step(nextState, ret);
  },

  breakText: function(txt, cb) {
    var parts = txt.split(this.separator),
      prev = this.genInitial();

    parts.forEach(step);
    cb(prev, '');

    function step(next) {
      cb(prev, next);
      prev.shift();
      prev.push(next);
    }
  },

  genInitial: function() {
    var ret = [];

    for (
      var i = 0; i < this.order; ret.push(''), i++
    );

    return ret;
  },

  reset: function(){
    this.memory = {};
    this.count = 0;
  },

  log: function(message) {
    console.log("(Markov) " + message);
  }
};
module.exports = Markov;

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};
var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var wordSchema = new Schema({
  text: {
    type: String,
    unique: true,
    required: true
  },

  relations: [{
    type: String,
    unique: true
  }]
});

module.exports = mongoose.model("Word", wordSchema);
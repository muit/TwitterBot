var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var startWordSchema = new Schema({
  text: {
      type: String,
      unique: true,
      required: true
  }
});

module.exports = mongoose.model("StartWord", startWordSchema);
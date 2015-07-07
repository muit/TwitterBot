var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var endWordSchema = new Schema({
  text: {
      type: String,
      unique: true,
      required: true
  }
});

module.exports = mongoose.model("EndWord", endWordSchema);
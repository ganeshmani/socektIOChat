var mongoose = require('mongoose');
var chatSchema = mongoose.Schema;

var chatModel = new chatSchema({
  userName : { type : String,default : null,required : true },
  To : { type : String,default : null },
  chatmessage : {type : String, default:null},
  room : { type : String , default : null },
  date : { type : Date,default : null }
  });

mongoose.model('chatModel',chatModel);

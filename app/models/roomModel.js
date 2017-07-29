var mongoose = require('mongoose');
var roomSchema = mongoose.Schema;

var roomModel = new roomSchema({
  name1 : { type : String,default : "",required : true },
  name2 : { type : String,default : "",required:true },
  members : [],
  lastActive : {type:Date,default:Date.now},
   createdOn : {type:Date,default:Date.now}

  });

mongoose.model('roomModel',roomModel);

var express = require('express');

var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var fs = require('fs');
var flash = require('req-flash');
var userName = "";
var userlist = {};
var targetUser = "";
var path = require('path');

var mongoose = require('mongoose');



var session = require('express-session')({
  name : 'myCookie',
  secret : 'myAppSecret',
  resave : true,
  httpOnly : true,
  saveUninitialized : true,
  cookie : { secure  : false }
}),
sharedsession = require("express-socket.io-session");

var events = require('events');

var eventEmitter = new events.EventEmitter();

var passport = require('passport');
var Strategy = require('passport-google-oauth2').Strategy;

var http = require('http').Server(app);

var io = require('socket.io')(http);
app.use(bodyParser.json({ limit: '10mb',extended : true }));
app.use(bodyParser.urlencoded({ limit : '10mb',extendede : true }));
app.use(logger('dev'));
app.set('view engine','jade');
app.set('views',path.join(__dirname + '/app/views'));
app.use(cookieParser());

//var nodemailer = require('nodemailer');

var dbPath = "mongodb://http://ec2-13-58-234-143.us-east-2.compute.amazonaws.com/chatapp";

app.use(session);
//io.use(sharedsession(session));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
db = mongoose.connect(dbPath);

mongoose.connection.once('open',function()
{
   console.log("database is connected successfully");
});

passport.use(new Strategy({
  clientID : '878965640615-94omdvh1ebj6i2jioq14u8g2hqo7jtce.apps.googleusercontent.com',
  clientSecret : '1toKTWjwiyF9hN9P6LW9mSl4',
  callbackURL : 'http://localhost:3000/users/login/facebook/return'
},
 function(accessToken,refreshToken,profile,cb){
   return cb(null,profile);
 }));

passport.serializeUser(function(user,cb){
  cb(null,user);
});

passport.deserializeUser(function(obj,cb){
  cb(null,obj);
});


fs.readdirSync('./app/models').forEach(function(file){
    if(file.indexOf('.js'))
    {
      require('./app/models/'+file);
    }
});

fs.readdirSync('./app/controller').forEach(function(files){
      if(files.indexOf('.js'))
      {
        var route = require('./app/controller/'+files);

        route.controller(app);
      }
});

var auth = require('./middlewares/auth');
//var mongoose = require('mongoose');
var UserModel = mongoose.model('UserModel');
app.use(function(request,response,next){
  if(request.session && request.session.user){
   UserModel.findOne({'email' : request.session.user.email},function(err,result){
      if(result)
      {
        request.session.user = result;
        delete request.session.password;
        next();
      }
      else{

      }
   });
  }


});



var userModel = mongoose.model('UserModel');
var chatModel = mongoose.model('chatModel');
var roomModel = mongoose.model('roomModel');

var readchatEvent;

/*io.use(function(socket, next) {
    var req = socket.handshake;
    var res = {};
    cookieParser(req, res, function(err) {
        if (err) return next(err);
        session(req, res, next);
    })
});*/

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.html');
  userName = req.session.user.userName;

});


io.sockets.on('connection', function(socket){
   //console.log(userName);

   socket.user = userName;
   if(userName != null && userName !=''){
      userlist[socket.user] = socket.id;
      //console.log(userlist[socket.user].id);
      io.sockets.emit('usernames',Object.keys(userlist));
   }
     io.to(socket.id).emit('username load',socket.user);

     socket.broadcast.emit('status message',socket.user+" came online");
     socket.broadcast.emit('status message',socket.user+' has joined the chat');


   socket.on('chat message', function(data){

     console.log("socket room"+socket.room);

     eventEmitter.emit('savechat',{
       userName : socket.user,
       To : targetUser,
       chatmessage : data.msg,
       room : socket.room,
       date:  Date.now()
     });


     io.to(socket.room).emit('chat message',{ msg :data.msg , user: socket.user, date:data.date});
     //console.log('message: ' + msg);
   });

   readchatEvent = function(result,username,room){
     console.log("reachedchatevent userName :"+username);

     io.to(userlist[username]).emit('old chat message',{
          result : result,
          room : room
     });
   }

   socket.on('disconnect',function(){
       console.log(socket.user+'has left');
       socket.broadcast.emit('status message',socket.user+' has left');
       if(!socket.user) return;
       delete userlist[socket.user];
       io.sockets.emit('usernames',Object.keys(userlist));
   });

   socket.on('user',function(msg){
      socket.broadcast.emit('chat message',socket.user+" came online");

   });

   socket.on('user load',function(user){

       if(user in userlist){
        targetUser = user;
       }
       socket.leave(socket.room);
       eventEmitter.emit('getdata',{ name1 : socket.user+"-"+targetUser , name2 : targetUser+"-"+socket.user  });
       //userlist[targetUser].emit('load user',targetUser);
       addRoom = function(roomId) {
        socket.room = roomId;
        console.log("roomId : " + socket.room);
        socket.join(socket.room);
        io.to(userlist[socket.user]).emit('user load', socket.room);
      };

   });

   socket.on('typing alert',function(){
      // console.log('typing alert');
       socket.to(socket.room).broadcast.emit('typing alert', socket.user+" is typing ");
   });

   socket.on('oldchathistory', function(data) {
     data.username = socket.user;
    eventEmitter.emit('read-chat', data);
  });
 });

   eventEmitter.on('read-chat',function(data){
       console.log("readchat room : "+data.roomid);
        chatModel.find({})
          .where('room').equals(data.roomid)
          .exec(function(err,res){
              if(err){
                console.log('Error'+err);
              }
              else{
                console.log("result readchat : "+res);
                  console.log("username readchat : "+data.username);
                readchatEvent(res, data.username,data.roomid);
              }

          });
       });

       eventEmitter.on('readchatEvent',function(data){


       });

   eventEmitter.on('savechat',function(data){
         newChat = new chatModel({
           userName : data.userName,
           To : data.To,
           chatmessage : data.chatmessage,
           room : data.room,
           date:  data.date

         });

         newChat.save(function(err,res){
           if(err){
             console.log("Save Error"+err);
           }
           else if (res ==null || res == undefined || res == "") {
             console.log("chat is not saved");
           }
           else{
             console.log("chat is saved");
           }
         });
   });

  eventEmitter.on('getdata',function(room){
    console.log("Room1"+room.name1);
    console.log("Room2"+room.name2);
    roomModel.find({
     $or : [{
       name1 : room.name1 } , { name1 : room.name2 }, { name2 : room.name1 }, { name2 : room.name2 }] }, function(err,res){
          if(err){
            console.log("Error : "+err);
          }
          else{
            if(res == null || res == undefined || res == ''){
              var today = Date.now();

        newRoom = new roomModel({
          name1: room.name1,
          name2: room.name2,
          lastActive: today,
          createdOn: today
        });

        newRoom.save(function(err, newResult) {

          if (err) {
            console.log("Error : " + err);
          } else if (newResult == "" || newResult == undefined || newResult == null) {
            console.log("Some Error Occured During Room Creation.");
          } else {
            addRoom(newResult._id); //calling setRoom function.
          }
        });

      } else {
        var jresult = JSON.parse(JSON.stringify(res));
        addRoom(jresult[0]._id); //calling setRoom function.
      }
    }
  });
});




http.listen(3000,function(){
  console.log("app is listening to port 3000");
});

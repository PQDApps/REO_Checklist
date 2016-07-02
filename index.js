var express = require('express');
var app = require('express')();
var router = express.Router();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var assert = require('assert');
var fs = require('fs')
  , gm = require('gm');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

// New socket connection
io.on('connection', function(socket){
  // Socket connection successful
  console.log('a user connected '+ socket.id);

  // Assign room
  socket.on('joinroom' , function(room, player) {
    console.log("User joined room: " + room);
    socket.join(room);
    //socket.room = room;
  });
  
  // Socket chat message
  socket.on('chat message', function(msg, room) {
    io.to(room).emit('chat message', msg);
    //io.emit('chat message', msg);
  });

  // Socket disconnection execute following function
  socket.on('disconnect', function() {    
    console.log("Disconnected from socekt server:" + socket.id);
    var minusPlayer;
    for(var i = 0; i < users.length; i++){
      if(users[i].socketId == socket.id){
        minusPlayer = i;
      }
    }
    users.splice(minusPlayer, 1);
    numberOfClients = users.length; // Decrement when user disconnects    
  });
});



// API Example: localhost:5000/api
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// Stuff
router.get('/login', function(req, res){
  // annotate an image
  gm('/img/meYoshi.jpg')
  .stroke("#ffffff")
  .drawCircle(10, 10, 20, 10)
  .font("Helvetica.ttf", 12)
  .drawText(30, 20, "GMagick!")
  .write("/img/drawing.png", function (err) {
    if (!err) console.log('done');
    console.log(err);
  });
  res.status(200).send({message : "HELLO"})
})

//Sign up API, userName and password
router.post('/signupnow', function(req,res){
  console.log(req);
  //res.json({message: req.body});
  var user = req.body.userName;
  var pass = req.body.password;
  var userExists = false;
  //var resultOfInsert = saveNewUser(user, pass);
  MongoClient.connect(mongoURL, function(err, db) {
  if (!err) {
    var users = db.collection("users");
    var cursor = db.collection('users').findOne({ "email" : user});
    cursor.each(function(err, doc){
      assert.equal(err, null);
      if (doc != null) {
        userExists = true;               
      }  
    });
    users.insert({email: user, password: pass}, function createUser (err, result){
        if (err) {
          res.json({Success: false, error: err})           
        }        
        console.log(result);
        res.json({Status: 'Success'});
        //res.sendStatus(200);                  
      });
    }
  })
  //res.json({Status: true});
  //res.sendStatus(200); 
})

// Register our api urls with /api
app.use('/api', router);

http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});
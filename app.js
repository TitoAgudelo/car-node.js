
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , mongoose = require('mongoose')
  , stylus = require('stylus')
  , nib = require('nib')
  , http = require('http')
  , path = require('path')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


// Mongo

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name  : { type: String },
	price : { type: Number },
	amount: { type: Number }
});

var db = mongoose.connect('mongodb://localhost/products')
	, model = mongoose.model('Data', ProductSchema)
	, Data = mongoose.model('Data')
;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// IO

var products = {};

io.sockets.on('connection', function (socket) {

  socket.on('handle', function (data) {
    Data.findById(data.obj[0], function(err, p) {
      p.x=data.obj[1];
      p.y=data.obj[2];
      p.save();
    });
    socket.broadcast.emit('handle', data);
  });

  socket.on('disconnect', function(){
    //mongoose.disconnect();
    delete users[socket.user];
    io.sockets.emit('update', users);
  });

});

// Routes
app.get('/', routes.index);

app.listen(3000);
console.log('Express server listening on port ' + app.get('port'));
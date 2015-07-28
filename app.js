
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , stylus = require('stylus')
  , nib = require('nib')
  , http = require('http')
  , path = require('path')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


// Mongo
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name  : { type: String },
	price : { type: Number },
	amount: { type: Number },
  inCart: { type: Boolean }
});

var db = mongoose.connect('mongodb://localhost/test');
var Model = mongoose.model('Data', ProductSchema);
var Data = mongoose.model('Data');

// CRUD create
Model.create(
  {
    name: 'Product 3', 
    price: 50, 
    amount: 50,
    inCart: false
  }, 
  function(err, model){
    if(err) console.log(err);
    else console.log(model);
});


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

//development only
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
/* get all products */
app.get('/', function (req, res, next) {
  Model.find( function(err, model){
    if(err) res.send(err);
    res.render('index', { products: model, max: model.length });
  }).where('inCart').equals(false);
});

/* get one product by id */
app.get('/products/:id', function (req, res, next) {
  Model.findById(req.params.id, function(err, model){
    if(err) res.send(err);
    res.json(model);
  });
});

/* put product to sent to cart option */
app.put('/:id', function(req, res, next) {
  var query = { _id: req.params.id };
  var callback =  function() {
      Model.find( function(err, model) {
        if(err) res.send(err);
        res.render('cart', { products: model, max: model});
      }).where('inCart').equals('true');
  };
  Model.findOneAndUpdate(query, { $set: { inCart: true }}, callback);
  // Model.findByIdAndUpdate(req.params.id, req.body, function (err, model) {
  //   if (err) return next(err);
  //   res.json(model);
  // });
});


app.listen(3000);
console.log('Express server listening on port ' + app.get('port'));
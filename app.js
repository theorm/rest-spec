var express = require('express');
var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID;
var RestSchema = require('./lib/restSchema');
var schema = RestSchema.validator('./schemas/');

var app = express();

app.use(function(req, res, next) {
  if (req.method !== 'GET' && !req.is('json')) {
    res.send(406); // not acceptable
  } else {
    next();
  }
});
app.use(express.json({strict: true}));


var bananas = [
  {id:1, name:'one'},
  {id:2, name:'two'},
];

bananas.find_by_id = function(id) {
  return _.find(this, function(b) {
    return b.id == id;
  });
}

app.get('/bananas', schema('get_bananas'), function(req, res) {
  res.json(bananas);
});

app.post('/bananas', schema('banana'), function(req, res) {

  var newBanana = req.body;

  if (!newBanana.id) {
    newBanana.id = new ObjectID();
  }

  if (bananas.find_by_id(newBanana.id)) {
    res.send(409, 'This ID already exists.')
  } else {
    bananas.push(newBanana);
    res.send(204)
  }

});

app.get('/bananas/:id', function(req, res) {
  var banana = bananas.find_by_id(req.params.id)
  res.json(banana)
});

// ----------------------
RestSchema.explorer('/spec', app)

app.listen(3000);
console.log('Listening on port 3000');

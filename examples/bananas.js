var express = require('express');
var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID;

var RestSchema = require('../lib/restSchema');
var schema = RestSchema.validator(__dirname + '/schemas/');

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
};

var BananasApi = function(bananas) {
  return {
    list: function(req, res) {
      var limit = req.query.limit || 10;
      res.json(bananas.slice(0, limit));
    },
    get: function(req, res) {
      var banana = bananas.find_by_id(req.params.id)
      if (banana) {
        res.json(banana);
      } else {
        res.send(404);
      }
    },
    post: function(req, res) {
      var newBanana = req.body;

      if (!newBanana.id) {
        newBanana.id = new ObjectID();
      }

      if (bananas.find_by_id(newBanana.id)) {
        res.send(409, 'This ID already exists.');
      } else {
        bananas.push(newBanana);
        res.send(204);
      }
    }
  }
}

var api = BananasApi(bananas);

app.get('/bananas', schema('get_bananas'), api.list);
app.get('/bananas/:id', api.get);
app.post('/bananas', schema('banana'), api.post);

// ----------------------
RestSchema.explorer('/docs', app)

app.listen(3000);
console.log('Listening on port 3000');

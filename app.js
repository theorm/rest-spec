var express = require('express');
var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID;

var JaySchema = require('jayschema');
var jayschema = new JaySchema(JaySchema.loaders.http);

var schemas = {
  'banana': {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "id": {"type": "integer"}
    },
    "required": ["id", "name"],
    "additionalProperties": false,
  }
};

function schema(name) {
  var schema_instance = schemas[name];
  
  return function(req, res, next) {
    jayschema.validate(req.body, schema_instance, function(errs) {
      if (errs) { 
        console.error(errs); 
        res.send(400, errs)
      } else {
        next();
      }
    });
  }
}

var app = express();

app.use(function(req, res, next) {
  if (req.method !== 'GET' && !req.is('json')) {
    res.send(406); // not acceptable
  } else {
    next();
  }
});
app.use(express.json({strict: true}));


app.listen(3000);
console.log('Listening on port 3000');

var bananas = [
  {id:1, name:'one'},
  {id:2, name:'two'},
];

bananas.find_by_id = function(id) {
  return _.find(this, function(b) {
    return b.id == id;
  });
}

app.get('/bananas', function(req, res) {
  res.json(bananas);
});

app.post('/bananas', schema('banana'), function(req, res) {

  var newBanana = req.body;
  console.log(newBanana)
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


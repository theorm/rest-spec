var JaySchema = require('jayschema');
var jayschema = new JaySchema(JaySchema.loaders.http);
var fs = require('fs');

var schemas = {};
var defaultSchemasPath = '.';

function schema(schemaName) {

  var schemaName = schemaName;
  var schema = schemas[schemaName];

  var schemaValidator = function(req, res, next) {
    console.log('Path "' + req.route.path + '", Schema "' + schemaName + '".');

    var payload = ['GET', 'DELETE'].indexOf(req.method) >= 0 ? req.query : req.body;
    console.log(payload);

    jayschema.validate(payload, schema, function(errs) {
      if (errs) { 
        console.error(errs); 
        res.send(400, errs)
      } else {
        next();
      }
    });
  }

  schemaValidator.__restSchema = schema;
  schemaValidator.__restSchemaName = schemaName;

  return schemaValidator;
}


function loadSchemas(schemasPath) {
  var files = fs.readdirSync(schemasPath);

  files.forEach(function(file) {
    var filePath = schemasPath + '/' + file;
    var schemaName = file.replace('.json', '')

    if (fs.statSync(filePath).isFile()) {
      var content = fs.readFileSync(filePath);
      try {
        content = JSON.parse(content);
        schemas[schemaName] = content;
      } catch(jsonError) {
        console.log('Error parsing schema "' + schemaName + '": ' + jsonError)
      }
    }
  });

  console.log('Schemas loaded: ' + Object.keys(schemas));
}


function analyzeRoutes(routes) {
  var descriptions = [];

  Object.keys(routes).forEach(function(method) {
    
    var endpoints = routes[method];

    endpoints.forEach(function(endpoint) {

      var description = {
        method: method,
        path: endpoint.path
      }

      if (endpoint.callbacks.length) {
        var callback = endpoint.callbacks[0];
        if (callback.__restSchema && callback.__restSchemaName) {

          description.name = callback.__restSchemaName;
          description.schema = callback.__restSchema;

        }
      }

      descriptions.push(description);

    });

  });

  return descriptions;
};


function schemasExplorer(app) {
  var app = app;

  return function(req, res) {
    var descriptions = analyzeRoutes(app.routes);
    res.json(descriptions);
  }
}


exports.validator = module.exports.validator = function(schemasPath) {
  loadSchemas(schemasPath || defaultSchemasPath);
  return schema;
}

exports.explorer = module.exports.explorer = schemasExplorer;

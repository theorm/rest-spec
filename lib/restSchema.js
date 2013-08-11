var JaySchema = require('jayschema');
var jayschema = new JaySchema(JaySchema.loaders.http);
var fs = require('fs');
var _ = require('underscore');
var explorer = require('./restApiExplorer');

var schemas = {};
var defaultSchemasPath = '.';

function presentError(error) {
  switch(error.constraintName) {
    case 'additionalProperties':
      return {field: error.testedValue, error: 'Extra field not allowed'};
      break;
    case 'type':
      return {
        field: error.instanceContext.replace('#/', ''), 
        error: 'Type must be "' + error.constraintValue + '"'
      };
      break;
    case 'required':
      return {field: error.desc.replace('missing: ', ''), error: 'Required.'};
      break;
    case 'pattern':
      return {
        field: error.instanceContext.replace('#/', ''), 
        error: 'Must match ' + error.constraintValue
      };
      break;
    default:
      console.log(error);
      return {};
      break;
  }
}

function presentErrors(errors) {
  var fieldErrors = _.map(errors, function(error) {
    return presentError(error);
  });
  return {
    description: 'Some fields failed to validate',
    fields: fieldErrors
  }
}

function schema(schemaName) {

  var schemaName = schemaName;
  var schema = schemas[schemaName];

  var schemaValidator = function(req, res, next) {
    // console.log('Path "' + req.route.path + '", Schema "' + schemaName + '".');

    var payload = ['GET', 'DELETE'].indexOf(req.method) >= 0 ? req.query : req.body;

    jayschema.validate(payload, schema, function(errs) {
      if (errs) { 
        res.send(422, presentErrors(errs))
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
        console.error('Error parsing schema "' + schemaName + '": ' + jsonError)
      }
    }
  });

  console.log('Schemas loaded: ' + Object.keys(schemas));
}


exports.validator = module.exports.validator = function(schemasPath) {
  loadSchemas(schemasPath || defaultSchemasPath);
  return schema;
}

exports.explorer = explorer.explorer;

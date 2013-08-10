var express = require('express');

function presentError(error) {
  switch(error.constraintName) {
    case 'additionalProperties':
      return {field: error.testedValue, error: 'Not allowed'};
      break;
    case 'type':
      return {field: error.instanceContext.replace('#/', ''), error: 'Type must be "' + error.constraintValue + '"'};
      break;
    case 'required':
      return {field: error.desc.replace('missing: ', ''), error: 'Required.'};
      break;
    default:
      console.log(error);
      return {};
      break;
  }
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

function jsonEndpoints(app, req, res) {
  var descriptions = analyzeRoutes(app.routes);
  res.json(descriptions);
}

function apiExplorer(path, app) {
  app.get(path + '/', function(req, res, next) {
    if (req.query.json) {
      console.log(req.query)
      jsonEndpoints(app, req, res, next);
    } else {
      res.sendfile(__dirname + '/static/explorer.html');
    }
  })

  app.use(path, express.static(__dirname + '/static'));
}

exports.explorer = apiExplorer;

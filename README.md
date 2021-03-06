# rest-spec

Request data validating library for RESTful APIs. *rest-pec* can validate _POST/PUT/PATCH_ JSON data as well as _GET/DELETE_ query string parameters using [JSON schema](http://json-schema.org/) and is easy to use with [express.js](http://expressjs.com/). It generates endpoint documentation on the fly too.

## Example

Say, we run an API for a blog. We could define our schema for a blog post like this and save it in a `post.json` file:

```json
{
    "type": "object",
    "properties": {
        "title": {
            "type": "string", 
            "description": "Title of the post."
        },
        "body": {
            "type": "string",
            "description": "Text body of the post"
        },
        "tags": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true,
            "description": "Post tags"
        }
    },
    "required": ["title", "body"],
    "additionalProperties": false,
    "description": "Blog post"
}
```

Our API code references this schema in a middleware that will return a `422` reponse with a list of errors before the main body of the endpoint is executed. The name of the schema is taken from the filename.

```javascript
var express = require('express');
var RestSpec = require('rest-spec');
var schema = RestSpec.validator(__dirname); // look for spec files in current directory
var storage = require('myWickedStorage');

var app = express();

app.post('/posts', schema('post'), function(req, res, next) {
    var newPost = req.body;
    newPost = storage.posts.add(newPost, function(post) {
        res.json(newPost);
    }, function(error) {
        res.json(400, error);
    });
});

// make API documentation accessible at `/docs/` URL. 
RestSchema.explorer('/docs', app)

app.listen(3000);
console.log('Running API on port 3000');

```

POSTing malformed request will make API return `422` with the reason:

```bash
$ curl -XPOST -H "Content-Type: application/json" -d '{"title": "My first post", "kittens": true}' http://localhost:3000/posts

{
  "description": "Some fields failed to validate",
  "fields": [
    {
      "field": "body",
      "error": "Required."
    },
    {
      "field": "kittens",
      "error": "Extra field not allowed"
    }
  ]
}
```

Note the `explorer` bit in the api code:
```javascript
RestSchema.explorer('/docs', app)
```

It maps dynamically generated documentation to `/docs`.

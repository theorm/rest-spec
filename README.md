# restSpec

Request data validating library for RESTful APIs. RestSpec can validate _POST/PUT/PATCH_ JSON data as well as _GET/DELETE_ query string parameters using (JSON schema)[http://json-schema.org/] and is easy to use with [express.js](http://expressjs.com/). It generates endpoint documentation on the fly too.

## Example

Say, we run an API for a blog. We could define our schema for a blog post like this and save it as a `post.json` file:

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

Our API code references this schema in a middleware that will return a `400` reponse with a list of errors before the main body of the endpoint is executed. The name of the schema is taken from the filename.

```javascript
var express = require('express');
var RestSpec = require('restSpec');
var schema = RestSpec.validator(__dirname);
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

RestSchema.explorer('/docs', app)

app.listen(3000);
console.log('Running API on port 3000');

```

POSTing malformed request will make API return `400` with an explanation:

```bash
$ curl -XPOST -H "Content-Type: application/json" -d '{"title": "My first post"}' http://localhost:3000/posts

{
  "description": "Some fields failed to validate",
  "fields": [
    {
      "field": "body",
      "error": "Required."
    }
  ]
}
```

Note the `explorer` bit in the api code:
```javascript
RestSchema.explorer('/docs', app)
```

It enabled dynamically generated documentation of the API on `/docs`.

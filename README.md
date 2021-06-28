# nodejs-recruitment-task

## Movie API

### `POST /movies`
Adds and saves movie with detailed information from OMDb by movie title. Only registered users can use this method. If movie with the same title already exists API returns 303 code with the existsing movie detailes. Pramaters are passed in json format
**Parameters:**
* `title` (String) - name of movie

**Result:**

HTTP code 200 If successfully created new movie. Body contains json with detailed information of the movie. 
HTTP code 303 If movie already exists. Body contains json with detailed information of movie.
HTTP code 401 If user is not authorized
HTTP code 403 If user exceed limit for free 5 movies per month
HTTP code 404 If movie was not found in OMDb database

**Example**

Request
```
curl --location --request POST '0.0.0.0:5000/movies' --header 'Content-Type: application/json' --header 'Authorization: Bearer <token>' --data-raw '{"title": "Terminator"}'
```
Response
```
{"title":"Terminator","releaseDate":null,"genre":"Short, Action, Sci-Fi","director":"Ben Hernandez"}
```


### `GET /movies`
Returns movies create by the specified user.

**Example**

Request
```
curl --location --request GET '0.0.0.0:5000/movies' --header 'Authorization: Bearer <token>'
```
Response
```
[{"title":"Terminator","releaseDate":null,"genre":"Short, Action, Sci-Fi","director":"Ben Hernandez"}]
```

## Run locally

1. Clone this repository
1. Run from root dir

```
JWT_SECRET=secret docker-compose up -d
```

`JWT_SECRET` environment variable must have the same value as it is used for Auth service. By default the Movie API service will start on port `5000` but you can override
the default value by setting the `APP_PORT` env var

```
APP_PORT=8081 JWT_SECRET=secret docker-compose up -d
```

To stop the Movie API service run

```
docker-compose down   
```

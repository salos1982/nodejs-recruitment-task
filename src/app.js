const express = require("express");
require('express-async-errors');
const { authMiddleware } = require('./middleware/auth')
const { APIError } = require('./apiError')
const MovieAPI = require('./movieAPI');
const OMDbService = require('./externalService/OMDbService');
const config = require('../config');
const JSONFileDataStorage = require('./dataStorage/JSONFileDataStorage');

const PORT = 5000;

const app = express();
app.use(express.json({ limit: '1000kb' }));
app.use(authMiddleware);

const api = new MovieAPI(new JSONFileDataStorage(), new OMDbService(config.OMDbApiKey));

app.post('/movies', async (req, res) => {
  const { title } = req.body;
  const { user } = req;

  if (!title) {
    return res.status(400).json({ message: 'argument title missing'});
  }

  try {
    const movieData = await api.createMovie(title, user);
    if (movieData.created) {
      return res.status(200).send(movieData.movie);
    }
    
    return res.status(303).send(movieData.movie);
  } catch(err) {
    if (err instanceof APIError) {
      res.status(err.code).json({ message: err.message });
    } else {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
});

app.get('/movies', async (req, res) => {
  const movies = await api.getMoviesByUser();
  res.status(200).json(movies);
});

const server = app.listen(PORT, () => {
  console.log(`Movie service is running at port ${PORT}`);
});

module.exports = {
  app,
  server,
  api,
}
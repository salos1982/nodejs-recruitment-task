const express = require("express");
require('express-async-errors');
const { authMiddleware } = require('./middleware/auth')
const { APIError } = require('./DomainObjects/APIError')
const MovieAPI = require('./movieAPI');
const OMDbService = require('./externalService/OMDbService');
const config = require('../config');
const MongooseDataStorage = require('./dataStorage/MongooseDataStorage');

const PORT = 5000;

const app = express();
app.use(express.json({ limit: '1000kb' }));
app.use(authMiddleware);

let api;

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
  const { user } = req;

  const movies = await api.getMoviesByUser(user);
  res.status(200).json(movies);
});

let server = null;
function getServer() {
  return server;
}

function getDatabaseUrl() {
  if (process.env.NODE_ENV === 'test') {
    return config.testMongoDbUrl;
  }

  return config.mongoDbUrl;
}

function getStorage() {
  if (api) {
    return api.dataStorage;
  }

  return null;
}

async function startServer() {
  const dataStorage = new MongooseDataStorage(getDatabaseUrl())
  await dataStorage.init();

  api = new MovieAPI(dataStorage, new OMDbService(config.OMDbApiKey));

  server = app.listen(PORT, () => {
    console.log(`Movie service is running at port ${PORT}`);
  });
}

const startServerPromise = startServer();

module.exports = {
  app,
  getServer,
  getStorage,
  startServerPromise,
}
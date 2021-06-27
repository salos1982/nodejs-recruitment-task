const moment = require('moment');
const mongoose = require('mongoose');
const config = require('../../config');
const Movie = require('../DomainObjects/Movie');

const MoviesStorage = require('../interface/moviesStorage');
const MoviesModel = require('./MoviesModel');

class MongooseDataStorage extends MoviesStorage {
  constructor(databaseUrl) {
    super();
    this.databaseUrl = databaseUrl;
  }

  async init() {
    mongoose.Promise = global.Promise;
    mongoose.connection.on('connected', () => {
      console.log('MongoDB is connected');
    });
    mongoose.connection.on('error', err => console.error(`MongoDB connection has occurred error: ${err}`));
  
    await mongoose.connect(this.databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  }

  async close() {
    mongoose.connection.close();
  }

  async getMoviesForUser(userId) {
    const moviesData = await MoviesModel.find({createdBy: userId})
    
    return moviesData.map(item => {
      const movie = new Movie();
        movie.title = item.title;
        movie.releaseDate = Date.parse(item.releaseDate);
        movie.genre = item.genre;
        movie.director = item.director;
        return movie;
    });
  }

  async saveMovie(movie, userId) {
    const prevDoc = await MoviesModel.findOneAndUpdate(
      { title: movie.title }, 
      {
        releaseDate: movie.releaseDate,
        genre: movie.genre,
        director: movie.director,
        createdBy: userId,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    return !prevDoc;
  }

  async getCreatedMoviesCountThisMonth(userId) {
    const startDate = moment().startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();
    const createdByUserMoviesCount = await MoviesModel.aggregate([
      { $match: { createdBy: userId, createdAt: { $gte: startDate, $lte: endDate }}},
      { $count: 'count' },
    ])
    return createdByUserMoviesCount.length ? createdByUserMoviesCount[0].count : 0;
  }

  async reset() {
    await MoviesModel.deleteMany();
  }

  async getMovieByTitle(title) {
    return await MoviesModel.findOne({ title });
  }
}

module.exports = MongooseDataStorage;
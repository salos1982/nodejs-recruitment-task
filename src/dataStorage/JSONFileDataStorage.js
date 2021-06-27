const fs = require('fs');
const Movie = require('../Movie');

const MoviesStorage = require('../moviesStorage');

class JSONFileDataStorage extends MoviesStorage {
  constructor() {
    super();
    this.filePath = 'db.json';
  }

  async getMoviesForUser() {
    if (fs.existsSync(this.filePath)) {
      const data = JSON.parse(fs.readFileSync(this.filePath));
      return data.map(item => {
        const movie = new Movie();
        movie.title = item.title;
        movie.releaseDate = Date.parse(item.releaseDate);
        movie.genre = item.genre;
        movie.director = item.director;
        return movie;
      })
    }
    
    return [];
  }

  async saveMovie(movie, userId) {
    const allMovies = await this.getMoviesForUser();
    const movieData = { ...movie };
    movieData.createdBy = userId;
    movieData.createdAt = new Date();
    allMovies.push(movieData);
    fs.writeFileSync(this.filePath, JSON.stringify(allMovies));
  }

  async getCreatedMoviesCountThisMonth(userId) {
    const allMovies = await this.getMoviesForUser();
    const count = allMovies.reduce((accum, curValue) => accum + ((curValue.createdBy === userId) ? 1: 0), 0);
    return count;
  }

  async reset() {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }

  async getMovieByTitle(title) {
    const allMovies = await this.getMoviesForUser();
    return allMovies.find(item => item.title === title);
  }
}

module.exports = JSONFileDataStorage;
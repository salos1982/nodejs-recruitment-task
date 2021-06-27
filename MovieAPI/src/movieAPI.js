const { APIError } = require('./DomainObjects/APIError');
const MoviesLogic = require('./DomainObjects/MoviesLogic');

class MovieAPI {
  constructor(dataStorage, externalInfoService) {
    this.dataStorage = dataStorage;
    this.externalInfoService = externalInfoService;
    this.logic = new MoviesLogic(dataStorage);
  }

  async createMovie(title, user) {
    await this.logic.checkAllowedToCreateMovie(user);

    const existingMovie = await this.dataStorage.getMovieByTitle(title);
    if (existingMovie) {
      return {
        movie: existingMovie,
        created: false,
      }
    }
    
    const movie = await this.externalInfoService.getMovieInfo(title);
    if (movie) {
      await this.dataStorage.saveMovie(movie, user.id);
      return {
        movie,
        created: true,
      }
    }
      
    throw new APIError(404, 'movie not found');
  }

  async getMoviesByUser(user) {
    return await this.dataStorage.getMoviesForUser(user.id);
  }
}

module.exports = MovieAPI
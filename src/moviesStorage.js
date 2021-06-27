class MoviesStorage {
  async getAllMovies() {
    throw new Error('not implemented');
  }

  async saveMovie(movie, userId) {
    throw new Error('not implemented');
  }

  async getCreatedMoviesCountThisMonth(userId) {
    throw new Error('not implemented');
  }

  async reset() {
    throw new Error('not implemented');
  }

  async getMovieByTitle(title) {
    throw new Error('not implemented');
  }
}

module.exports = MoviesStorage;
class MoviesStorage {
  async getMoviesForUser(userId) {
    throw new Error('not implemented');
  }

  /**
  * Save movie to database. Returns true for new one and false for existing ones
  * @param {Movie} movie 
  * @param {Number} userId 
  */
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
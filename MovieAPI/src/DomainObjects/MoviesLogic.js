const config = require('../../config');
const { APIError } = require('./APIError');

class MoviesLogic {
  constructor(dataStorage) {
    this.dataStorage = dataStorage;
  }

  async checkAllowedToCreateMovie(user) {
    if (user.role === 'basic') {
      const userCreatedMoviewsCount = await this.dataStorage.getCreatedMoviesCountThisMonth(user.id);
      if (userCreatedMoviewsCount >= config.maxBasicUserMoviesPerMonth) {
        throw new APIError(403, 'you exeed free quota')
      }
    }
  }
}

module.exports = MoviesLogic;
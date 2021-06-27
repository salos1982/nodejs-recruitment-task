const axios = require('axios');

const MoviesExternalService = require('../interface/moviesExtenalService');
const { APIError } = require('../DomainObjects/APIError');
const Movie = require('../DomainObjects/Movie');

class OMDbService extends MoviesExternalService {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.apiUrl = 'http://www.omdbapi.com/';
  }

  async getMovieInfo(title) {
    if (!title) {
      throw new APIError(400, 'title must not be null or empty');
    }

    const response = await this.runRequest({t: title});
    if (response.Response === 'False') {
      return null;
    }

    if (response.Error) {
      console.error(response.Error);
      return null;
    }

    const movie = new Movie();
    movie.title = response.Title;
    if (response.ReleaseDate) {
      movie.releaseDate = Date.parse(response.ReleaseDate);
    } else {
      movie.releaseDate = null;
    }
    
    movie.genre = response.Genre;
    movie.director = response.Director;

    return movie;
  }

  async runRequest(params) {
    const query = { ...params };
    query.apiKey = this.apiKey;

    try {
      const options = {
        params: query,
      }
      return await axios(this.apiUrl, options).then(response => response.data);
    } catch(err) {
      console.error(err);
      throw new APIError(503, err.message);
    }
    
  }
}

module.exports = OMDbService;

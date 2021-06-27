const { APIError } = require('../src/apiError');
const MovieAPI = require('../src/movieAPI');
const User = require('../src/User');

describe('test movie api createMovie', () => {
  it('successful creation', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async saveMovie(movie, userId) {
        this.called = true;
        this.movie = movie;
        return true;
      },

      async getCreatedMoviesCountThisMonth(userId) {
        return 0;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(1, 'premium', 'Test Test');
    const { movie, created } = await api.createMovie(movieTitle, user);
    expect(movie).toMatchObject({
      title: movieTitle,
      ...staticMovieInfo,
    })
    expect(created).toBe(true);
    expect(movieStorage.called).toBe(true);
    expect(movieStorage.movie).toBe(movie);
  })
  
  it('successful duplicate creation', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async saveMovie(movie, userId) {
        this.called = true;
        this.movie = movie;
        return true;
      },

      async getCreatedMoviesCountThisMonth(userId) {
        return 0;
      },

      async getMovieByTitle(title) {
        return this.movie;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(1, 'premium', 'Test Test');
    let { movie, created } = await api.createMovie(movieTitle, user);
    expect(movie).toMatchObject({
      title: movieTitle,
      ...staticMovieInfo,
    })
    expect(created).toBe(true);
    expect(movieStorage.called).toBe(true);
    expect(movieStorage.movie).toBe(movie);

    ({ movie, created } = await api.createMovie(movieTitle, user));
    expect(movie).toMatchObject({
      title: movieTitle,
      ...staticMovieInfo,
    })
    expect(created).toBe(false);
  })

  it('external service throw error', async () => {
    const movieExternalService = {
      async getMovieInfo(title) {
        throw new APIError(503, 'external error');
      }
    }

    const movieStorage = {
      async saveMovie(movie, userId) {
        this.called = true;
        return true;
      },

      async getCreatedMoviesCountThisMonth(userId) {
        return 0;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(1, 'premium', 'Test Test');
    expect(api.createMovie(movieTitle, user)).rejects.toMatchObject({
      code: 503,
      message: 'external error',
    })
  })

  it('external service could not find movie', async () => {
    const movieExternalService = {
      async getMovieInfo(title) {
        return null;
      }
    }

    const movieStorage = {
      async saveMovie(movie, userId) {
        this.called = true;
        return true;
      },

      async getCreatedMoviesCountThisMonth(userId) {
        return 0;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'klk sdkflk';
    const user = new User(1, 'premium', 'Test Test');
    expect(api.createMovie(movieTitle, user)).rejects.toMatchObject({
      code: 404,
      message: 'movie not found',
    })
    expect(movieStorage.called).not.toBeTruthy();
  })

  it('dataStorage throw error', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async saveMovie(movie, userId) {
        throw new APIError(500, 'external error');
      },

      async getCreatedMoviesCountThisMonth(userId) {
        return 0;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(1, 'premium', 'Test Test');
    expect(api.createMovie(movieTitle, user)).rejects.toMatchObject({
      code: 500,
      message: 'external error',
    })
  })

  it('create more than 5 movies for basic user', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async getCreatedMoviesCountThisMonth(userId) {
        return 5;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(2, 'basic', 'Test Test');
    expect(api.createMovie(movieTitle, user)).rejects.toMatchObject({
      code: 403,
      message: 'you exeed free quota',
    })
  });

  it('create 5th movie for basic user', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async getCreatedMoviesCountThisMonth(userId) {
        return 4;
      },

      async saveMovie(movie, userId) {
        this.called = true;
        this.movie = movie;
        return true;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(2, 'basic', 'Test Test');
    const { movie, created } = await api.createMovie(movieTitle, user);
    expect(movie).toMatchObject({
      title: movieTitle,
      ...staticMovieInfo,
    })
    expect(created).toBe(true);
    expect(movieStorage.called).toBe(true);
    expect(movieStorage.movie).toBe(movie);
  });

  it('create more than 5 movies for premium user', async () => {
    const staticMovieInfo = {
      released: new Date('2021-06-25'),
      genre: 'comedy',
      director: 'Me Me',
    };

    const movieExternalService = {
      async getMovieInfo(title) {
        return {
          title,
          ...staticMovieInfo,
        }
      }
    }

    const movieStorage = {
      async getCreatedMoviesCountThisMonth(userId) {
        return 5;
      },

      async saveMovie(movie, userId) {
        this.called = true;
        this.movie = movie;
        return true;
      },

      async getMovieByTitle(title) {
        return null;
      },
    }

    const api = new MovieAPI(movieStorage, movieExternalService);
    const movieTitle = 'my movie';
    const user = new User(2, 'premium', 'Test Test');
    const { movie, created } = await api.createMovie(movieTitle, user);
    expect(movie).toMatchObject({
      title: movieTitle,
      ...staticMovieInfo,
    })
    expect(created).toBe(true);
    expect(movieStorage.called).toBe(true);
    expect(movieStorage.movie).toBe(movie);
  });
});
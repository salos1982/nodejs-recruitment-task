const config = require('../config');
const MongooseDataStorage = require('../src/dataStorage/MongooseDataStorage');
const MoviesModel = require('../src/dataStorage/MoviesModel');
const Movie = require('../src/DomainObjects/Movie');

describe('test MongooseDataStorage api', () => {
  let dataStorage = null;

  beforeAll( async () => {
    const mongoUrl = process.env.TEST_MONGO_URL || config.testMongoDbUrl;
    dataStorage = new MongooseDataStorage(mongoUrl);
    await dataStorage.init();
  })

  afterAll(async () => {
    await dataStorage.close();
  })

  beforeEach(async () => {
    dataStorage.reset();
  })

  it('save Movie', async () => {
    const userId = 1;
    const movie = new Movie();
    movie.title = 'aaaa';
    movie.releaseDate = new Date();
    movie.genre = 'comedy';
    movie.director = 'bbbb';

    const result = await dataStorage.saveMovie(movie, userId);
    expect(result).toBe(true);
  })

  it('save Movie duplicate', async () => {
    const userId = 1;
    const movie = new Movie();
    movie.title = 'aaaa';
    movie.releaseDate = new Date();
    movie.genre = 'comedy';
    movie.director = 'bbbb';

    let result = await dataStorage.saveMovie(movie, userId);
    expect(result).toBe(true);

    result = await dataStorage.saveMovie(movie, userId);
    expect(result).toBe(false);
  });

  it('get movies for user', async () => {
    const firstUserId = 1;
    const firstMovie = new Movie();
    firstMovie.title = 'aaaa';
    firstMovie.releaseDate = new Date();
    firstMovie.genre = 'comedy';
    firstMovie.director = 'bbbb';

    const firstResult = await dataStorage.saveMovie(firstMovie, firstUserId);
    expect(firstResult).toBe(true);

    const secondUserId = 2;
    const secondMovie = new Movie();
    secondMovie.title = 'aaaa2';
    secondMovie.releaseDate = new Date();
    secondMovie.genre = 'comedy';
    secondMovie.director = 'bbbb2';
    const secondResult = await dataStorage.saveMovie(secondMovie, secondUserId);
    expect(secondResult).toBe(true);

    const firstUserMovies = await dataStorage.getMoviesForUser(1);
    expect(firstUserMovies.length).toBe(1);
    expect(firstUserMovies[0].title).toBe(firstMovie.title);

    const secondUserMovies = await dataStorage.getMoviesForUser(2);
    expect(secondUserMovies.length).toBe(1);
    expect(secondUserMovies[0].title).toBe(secondMovie.title);
  });

  it('test created movies this month created today', async () => {
    const userId = 1;

    for (let i = 0; i < 5; i++) {
      const movie = new Movie();
      movie.title = `aaaa ${i}`;
      movie.releaseDate = new Date();
      movie.genre = 'comedy';
      movie.director = 'bbbb';

      let result = await dataStorage.saveMovie(movie, userId);
      expect(result).toBe(true);
    }

    const createdMovies = await dataStorage.getCreatedMoviesCountThisMonth(userId);
    expect(createdMovies).toBe(5);
  });

  it('test created movies this month created today and earlier', async () => {
    const userId = 1;

    for (let i = 0; i < 5; i++) {
      const movie = new Movie();
      movie.title = `aaaa ${i}`;
      movie.releaseDate = new Date();
      movie.genre = 'comedy';
      movie.director = 'bbbb';

      let result = await dataStorage.saveMovie(movie, userId);
      expect(result).toBe(true);
    }

    let createdMovies = await dataStorage.getCreatedMoviesCountThisMonth(userId);
    expect(createdMovies).toBe(5);

    await MoviesModel.updateOne({ title: 'aaaa 0'}, { createdAt: Date.parse('2021-01-01') });

    createdMovies = await dataStorage.getCreatedMoviesCountThisMonth(userId);
    expect(createdMovies).toBe(4);
  });

  it('get movie by title when does not exist', async () => {
    const movie = await dataStorage.getMovieByTitle('test');
    expect(movie).toBeNull();
  })

  it('get movie by title when exists', async () => {
    const userId = 1;

    for (let i = 0; i < 5; i++) {
      const movie = new Movie();
      movie.title = `aaaa ${i}`;
      movie.releaseDate = new Date();
      movie.genre = 'comedy';
      movie.director = 'bbbb';

      let result = await dataStorage.saveMovie(movie, userId);
      expect(result).toBe(true);
    }

    const movie = await dataStorage.getMovieByTitle('aaaa 2');
    expect(movie).not.toBeNull();
  })
});
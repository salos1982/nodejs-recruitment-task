const OMDbService = require('../src/externalService/OMDbService');
const config = require('../config')

describe('test OMDbService', () => {
  it('test with correct title', async () => {
    const service = new OMDbService(config.OMDbApiKey);
    const movieTitle = 'Terminator';
    const movie = await service.getMovieInfo(movieTitle);
    expect(movie.title).toBe(movieTitle);
  })

  it('test with incorrect title', async () => {
    const service = new OMDbService(config.OMDbApiKey);
    const movieTitle = 'askdn lajlshdlk alsdhl';
    const movie = await service.getMovieInfo(movieTitle);
    expect(movie).toBe(null);
  })

  it('test with null title', async () => {
    const service = new OMDbService(config.OMDbApiKey);
    const movieTitle = null;
    expect(service.getMovieInfo(movieTitle)).rejects.toMatchObject({
      code: 400,
      message: 'title must not be null or empty'
    });
  })
});

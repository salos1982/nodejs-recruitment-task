const request = require('supertest');
const axios = require('axios');

const { app, getServer, getStorage, startServerPromise } = require('../src/app');
const config = require('../config');

function getAuthUrl() {
  return process.env.AUTH_URL || config.authUrl;
}

async function getBasicUserToken() {
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      username: 'basic-thomas',
      password: 'sR-_pcoow-27-6PAwCD8',
    }
  }
  const url = getAuthUrl();
  const response = await axios(url, authOptions);
  return response.data.token;
}

async function getPremiumUserToken() {
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      username: 'premium-jim',
      password: 'GBLtTyq3E_UNjFnpo9m6',
    }
  }
  const url = getAuthUrl();
  const response = await axios(url, authOptions);
  return response.data.token;
}

describe('api call tests', () => {
  afterAll(async () => {
    await getServer().close();
    await getStorage().close();
  })

  beforeEach(async() => {
    if (getStorage()) {
      await getStorage().reset();
    }
  })

  beforeAll(async () => {
    await startServerPromise;
  })

  it('create single movie', async () => {
    const userToken = await getPremiumUserToken();
    const title = 'Terminator';

    const response = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Terminator' })
      .expect(200)
      .expect('Content-Type', /json/);
    
      expect(response.body.title).toBe(title);
  })
 
  it('create 6 movies for basic user', async () => {
    const userToken = await getBasicUserToken();

    const movies = [
      'Terminator',
      'Desperado',
      'Terminator 2',
      'The Shawshank Redemption',
      'The Godfather',
      'Pulp Fiction',
    ]

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: movies[i] })
        .expect(200)
        .expect('Content-Type', /json/);
    }

    await request(app)
        .post('/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: movies[5] })
        .expect(403)
  })

  it('create 6 movies for premium user', async () => {
    const userToken = await getPremiumUserToken();

    const movies = [
      'Terminator',
      'Desperado',
      'Terminator 2',
      'The Shawshank Redemption',
      'The Godfather',
      'Pulp Fiction',
    ]

    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: movies[i] })
        .expect(200)
        .expect('Content-Type', /json/);
    }
  })

  it('check unauthorized user', async () => {
    await request(app)
    .post('/movies')
    .send({ title: 'Terminator' })
    .expect(401)
  })

  it('check no authorization scheme', async () => {
    const userToken = await getPremiumUserToken();

    await request(app)
    .post('/movies')
    .set('Authorization', `${userToken}`)
    .send({ title: 'Terminator' })
    .expect(401)
  })

  it('check wrong authorization scheme', async () => {
    const userToken = await getPremiumUserToken();

    await request(app)
    .post('/movies')
    .set('Authorization', `sheme ${userToken}`)
    .send({ title: 'Terminator' })
    .expect(401)
  })

  it('check invalid authorization token', async () => {
    const userToken = await getPremiumUserToken();

    await request(app)
    .post('/movies')
    .set('Authorization', `Bearer asdlkansdnalnsd;snd;ljsnd;abskdlalksbdlkbaskblkb`)
    .send({ title: 'Terminator' })
    .expect(401)
  })

  it('test getting movies', async () => {
    const userToken = await getPremiumUserToken();
    const title = 'Terminator';

    const createResponse = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(createResponse.body.title).toBe(title);

    const getResponse = await request(app)
      .get('/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(getResponse.body).toHaveLength(1);
    expect(getResponse.body[0].title).toBe(title);
  })
})
const request = require('supertest');
const axios = require('axios');

const { app, server, api } = require('../src/app');
const config = require('../config');

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
  const response = await axios(config.authUrl, authOptions);
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
  const response = await axios(config.authUrl, authOptions);
  return response.data.token;
}

describe('api call tests', () => {
  afterAll(async () => {
    await server.close();
  })

  beforeEach(async() => {
    await api.dataStorage.reset();
  })
  it('create single movie', async () => {
    const userToken = await getPremiumUserToken();

    await request(app)
    .post('/movies')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Terminator' })
    .expect(200)
    .expect('Content-Type', /json/);
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
})
const { User } = require('../../models/user');
const { Books } = require('../../models/books');
const request = require('supertest');

beforeAll(() => {
})

afterAll(async () => {
  await server.close();
})

describe('auth middleware', () => {

  beforeEach(() => {
    server = require('../../index');
  })
  afterEach(async () => {
    await Books.deleteMany({});
    await server.close();
  });

  let token;

  const exec = () => {
    return request(server)
      .post('/api/books')
      .set('x-auth-token', token)
      .send({ title: 'book1', author: 'author1', ISBN: '1234567890' });
  }

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

});
const { Books } = require('../../models/books');
const { User } = require('../../models/user');
const { createUserObject } = require('../../src/userutil');
const request = require('supertest');
const { userSchema } = require('../../models/user');
const config = require("config");

const origin = "127.0.0.1:3000";

beforeAll(() => {
  // NOTE! config/test.json should have "requiresApiKey": false
  // for these tests to work
  if (config.get("requiresApiKey")) {
    console.log('For this test unit config/test.json should have "requiresApiKey": false');
  }
})

afterAll(async () => {
  await server.close();
})

describe('auth middleware', () => {

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await Books.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  let token;

  const exec = () => {
    return request(server)
      .post('/api/books')
      .set('authorization', token)
      .send({ title: 'book1', author: 'author1', ISBN: '1234567890' });
  }

  beforeEach(async () => {
    // Create a new test user
    // result = await createUser("test", "test@domain.com", "12345678aB.");
    // token = result.token;
    user = {
      email: "test@mail.com",
      password: "123456789aB.",
      name: "testuser",
      isAdmin: true,
      host: "http://localhost:3000",
      api_key: "",
      usage: [
        {
          data: "2021-10-12",
          count: 1,
        }
      ]
    };
    const usr = await createUserObject(user, origin);
    token = usr.token;
    user = usr.user;
    // console.log("TOKEN=", token);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should return 400 if no token is provided or invalid', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 401 if unauthorized', async () => {
    token = 'Bearer blah.blah.blah';

    const res = await exec();

    expect(res.status).toBe(401);
  });

});
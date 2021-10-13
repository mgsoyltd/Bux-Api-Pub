const request = require('supertest');
const { Books } = require('../../models/books');
const { User } = require('../../models/user');
const { createUserObject } = require('../../src/userutil');
const mongoose = require('mongoose');

const origin = "127.0.0.1:3000";

let server;
var token;
var user;

const createTestUser = async (isAdmin = true) => {
  user = {
    email: "test@mail.com",
    password: "123456789aB.",
    name: "testuser",
    isAdmin: isAdmin,
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
  return usr;
}

beforeAll(async () => {
  server = require('../../index');
  await createTestUser();
  // console.log("TOKEN:", token);
});

afterAll(async () => {
  await Books.deleteMany({});
  await User.deleteMany({});
  await server.close();
  await mongoose.connection.close();
});

describe('/api/books', () => {

  beforeEach(() => {
  });

  afterEach(async () => {
    await Books.deleteMany({});
  });

  describe('GET /', () => {

    it('should return all books', async () => {
      const books = [
        { title: 'book1', author: 'author1', ISBN: '1234567890', image: {} },
        { title: 'book2', author: 'author2', ISBN: '1234567891', image: {} }
      ];

      await Books.collection.insertMany(books);

      const res = await request(server)
        .get('/api/books')
        .set('authorization', token)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.title === 'book1')).toBeTruthy();
      expect(res.body.some(g => g.title === 'book2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {

    it('should return a book if valid id is passed', async () => {
      const book = new Books({ title: 'book1', author: 'author1', ISBN: '1234567893', image: {} });
      await book.save();

      const res = await request(server)
        .get('/api/books/' + book._id)
        .set('authorization', token)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', book.title);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server)
        .get('/api/books/1')
        .set('authorization', token)
        .send();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no book with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server)
        .get('/api/books/' + id)
        .set('authorization', token)
        .send();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {

    // Define the happy path, and then in each test, we change 
    // one parameter that clearly aligns with the title of the 
    // test. 
    let title;

    beforeEach(async () => {
      title = 'book1';
    })

    afterEach(async () => {
      await Books.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .post('/api/books')
        .set('authorization', token)
        .send({ title: title, author: 'author1', ISBN: '12345678904', description: "", pages: 100, imageURL: "", public_id: "", image: {} });
    }

    it('should return 400 if client is not logged in', async () => {
      const save_token = token;
      token = '';
      const res = await exec();
      token = save_token;

      expect(res.status).toBe(400);
    });

    it('should return 400 if book title is empty', async () => {
      title = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if book title is more than 255 characters', async () => {
      title = new Array(257).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the book if it is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);

      const book = await Books.find({ title: 'book1' });

      expect(book).not.toBeNull();
    });

    it('should return the book if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'book1');
    });
  });

  describe('PUT /:id', () => {
    let newName;
    let book;
    let id;

    beforeEach(async () => {
      // Before each test we need to create a book and 
      // put it in the database.      
      book = new Books({ title: 'book1', author: 'author1', ISBN: '1234567896', image: {} });
      await book.save();

      id = book._id;
      newName = 'updatedName';
    })

    afterEach(async () => {
      await Books.deleteMany({});
    });

    const exec = async () => {
      return await request(server)
        .put('/api/books/' + id)
        .set('authorization', token)
        .send({ title: newName, author: 'author1', ISBN: '1234567895', image: {} });
    }

    it('should return 400 if client is not logged in', async () => {
      const save_token = token;
      token = '';
      const res = await exec();
      token = save_token;

      expect(res.status).toBe(400);
    });

    it('should return 400 if book title is empty', async () => {
      newName = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if book title is more than 255 characters', async () => {
      newName = new Array(257).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if book with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({});   // Should find nothing
    });

    it('should update the book if input is valid', async () => {
      await exec();

      const updatedBooks = await Books.findById(book._id);

      expect(updatedBooks.title).toBe(newName);
    });

    it('should return the updated book if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', newName);
    });
  });

  describe('DELETE /:id', () => {
    let book;
    let id;

    const exec = async () => {
      return await request(server)
        .delete('/api/books/' + id)
        .set('authorization', token)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a book and 
      // put it in the database.      
      book = new Books({ title: 'book1', author: 'author1', ISBN: '1234567897', image: {} });
      await book.save();

      id = book._id;
    });

    afterEach(async () => {
      await Books.deleteMany({});
      await User.deleteMany({});
    });

    it('should return 400 if client is not logged in', async () => {
      const save_token = token;
      token = '';
      const res = await exec();
      token = save_token;

      expect(res.status).toBe(400);
    });

    it('should return 403 if the user is not an admin', async () => {
      await createTestUser(false);  // isAdmin=false

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      await createTestUser();
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no book with the given id was found', async () => {
      await createTestUser();
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the book if input is valid', async () => {
      await createTestUser();
      await exec();

      const bookInDb = await Books.findById(id);

      expect(bookInDb).toBeNull();
    });

    it('should return the removed book', async () => {
      await createTestUser();
      const res = await exec();

      expect(res.body).toHaveProperty('_id', book._id.toHexString());
      expect(res.body).toHaveProperty('title', book.title);
    });
  });

});
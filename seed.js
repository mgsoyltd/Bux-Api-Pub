const mongoose = require("mongoose");
const config = require("config");
const { User } = require("./models/user");
const { Books } = require("./models/books");
const { Readings } = require("./models/readings");

const users =
  [{
    "name": "Eki Kauhalevi",
    "email": "eki@domain.com",
    "password": "654321",
    "isAdmin": true
  }, {
    "name": "Julia Kauhalevi",
    "email": "julia@domain.com",
    "password": "$2b$10$0jR/1.J0MqsAM2dXX243du6fPUoHyfWP0GkmZZRJtKpPfeK1StM4u",
  }, {
    "name": "Joni Kauhalevi",
    "email": "joni@domain.com",
    "password": "$2b$10$76Xn9WBI7uuM1AWI4JFE0eSj1mWb91UphU9shrHdtiATkLZblWIMa",
  }];

const books =
  [{
    "title": "Emily ja Huvipuisto",
    "author": "Philip Reeve ja Sarah McIntyre",
    "ISBN": "978-952-230-536-7",
    "description": "",
    "pages": 246,
    "imageURL": ""
  }, {
    "title": "Kurnivamahainen Kissa",
    "author": "Magdalena Hai",
    "ISBN": "978-951-23-6323-0",
    "description": "",
    "pages": 46,
    "imageURL": ""
  }, {
    "title": "Tarina Sinisestä Planeetasta",
    "author": "Andri Smær Magnason",
    "ISBN": "952-5321-32-0",
    "description": "",
    "pages": 93,
    "imageURL": ""
  }, {
    "title": "Peppi Pitkätossu",
    "author": "Astrid Lindgren ja Lauren Child",
    "ISBN": "978-951-0-33397-6",
    "description": "",
    "pages": 203,
    "imageURL": ""
  }];

const readings =
  [{
    "users_id": {
      "$oid": "60367532fcaca511b4742089"
    },
    "books_id": {
      "$oid": "6033cd27e556ba0c11323fd5"
    },
    "current_page": 39,
    "time_spent": 180,
    "rating": 5,
    "comments": "Peppi rules!",
    "updatedAt": {
      "$date": "2021-02-23T22:19:10.033Z"
    }
  }];

async function seed() {
  await mongoose.connect(config.get("db"));

  await User.deleteMany({});
  await Books.deleteMany({});
  await Readings.deleteMany({});

  for (let user of users) {
    const movies = genre.movies.map(movie => ({
      ...movie,
      genre: { _id: genreId, name: genre.name }
    }));
    await Movie.insertMany(movies);
  }

  mongoose.disconnect();

  console.info("Done!");
}

seed();

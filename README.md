## Introduction

This project is the backend REST API of Bux - a books reading goals app.

This is the implementation of Bux API using:

- Node.js
- Express
- Mongoose
- jsonwebtoken (RS256 algorithm)
- crypto

## Setup

Make sure to follow all these steps exactly as explained below. Do not miss any steps or you won't be able to run this application.

### Install MongoDB

To run this project, you need to install the latest version of MongoDB Community Edition first.

https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.
In development run mongod.

### Generate public/private keypair

Next, you will need to generate a public/private keypair into config folder.
The `.gitignore` automatically ignores the private key.

```
node generateKeypair.js
```

### Install the Dependencies

Next, from the project folder, install the dependencies:

```
    npm i
```

### Run the Tests

You're almost done! Run the tests to make sure everything is working:

```
    npm test
```

All tests should pass.

If you're going to use API Key solution, then set config to have "requiresApiKey": true.
To test API Key solution, run a separate test file below.

```
    npm run test-apikeys
```

### Start the Server

```
    npm run dev     Development
```

```
    npm start       Production
```

This will launch the Node server on port 3000. If that port is busy, you can set a different point in config/default.json.

Open up your browser and head over to:

http://localhost:3000

You should see the Bux API welcome message.
That confirms that you have set up everything successfully.

### Environment Variables

In production the following environment variables must be set:

    bux_jwtPrivateKey   <yourSecureKey>
    bux_db              <database connection string>

Optional environment variables:

    API_MAX             <maxinum API calls per day>
                        Only when config.requiresApiKey=true> Default is 100.

### License & copyright

© Copyright Morning Glow Solutions Oy Ltd

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

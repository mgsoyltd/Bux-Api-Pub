## Introduction

This project is the backend REST API of Bux - a books reading goal app.

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

### Start the Server

```
    npm run dev     Development
```

```
    npm start       Production
```

This will launch the Node server on port 3900. If that port is busy, you can set a different point in config/default.json.

Open up your browser and head over to:

http://localhost:3900/api/books?$expand=\*

You should see the list of genres. That confirms that you have set up everything successfully.

### Environment Variables

In production the following environment variables must be set:

    bux_jwtPrivateKey   <yourSecureKey>
    bux_db              <database connection string>

Optional environment variables:

    API_MAX             <maxinum API calls per day>
                        Only when config.requiresApiKey=true> Default is 100.
                        
### Copyright

© Copyright Morning Glow Solutions Oy Ltd
All Rights Reserved.

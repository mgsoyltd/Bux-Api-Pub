const request = require('supertest');
const { User } = require('../../../models/user');
const { createUserObject } = require('../../../src/userutil');
const mongoose = require('mongoose');
const { getApiKey } = require('../../../middleware/apikeys');
const config = require("config");


const origin = "127.0.0.1:3000";
let server;
let token;
let user;

beforeAll(async () => {

    // NOTE! config/test.json should have "requiresApiKey": true 
    // for these tests to work
    if (!config.get("requiresApiKey")) {
        console.log('For this test unit config/test.json should have "requiresApiKey": true');
    }

    server = require('../../../index');
})

afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
})

describe('/api/users', () => {

    beforeEach(() => {
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('GET /', () => {

        beforeEach(async () => {
            user = {
                // _id: mongoose.Types.ObjectId().toHexString(),
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
        });

        afterEach(async () => {
            await User.deleteMany({});
        });

        it('should return all users', async () => {

            const res = await request(server)
                .get('/api/users')
                .set('authorization', token)
                .set('x-api-key', user.api_key)
                .set('origin', origin)
                .send();

            // console.log(user);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.name === 'testuser')).toBeTruthy();
        });

        // it('should return invalid API KEY 403 due to different origin', async () => {

        //     const res = await request(server)
        //         .get('/api/users')
        //         .set('authorization', token)
        //         .set('x-api-key', user.api_key)
        //         .set('origin', "127.0.0.1:3001")
        //         .send();

        //     expect(res.status).toBe(403);
        // });

        it('should return invalid API KEY 403', async () => {

            const res = await request(server)
                .get('/api/users')
                .set('authorization', token)
                .set('x-api-key', "")
                .set('origin', origin)
                .send();

            expect(res.status).toBe(403);
        });

        it('should increase API usage counter', async () => {

            var res = await request(server)
                .get('/api/users')
                .set('authorization', token)
                .set('x-api-key', user.api_key)
                .set('origin', origin)
                .send();

            expect(res.status).toBe(200);

            var account = await User.findOne(
                {
                    // host: origin,
                    api_key: user.api_key
                });

            expect(account.usage[0].count).toBe(1);

            res = {};
            res = await request(server)
                .get('/api/users')
                .set('authorization', token)
                .set('x-api-key', user.api_key)
                .set('origin', origin)
                .send();

            expect(res.status).toBe(200);

            account = await User.findOne(
                {
                    host: origin,
                    api_key: user.api_key
                });
            expect(account.usage[0].count).toBe(2);

        });

        it('should return Max API calls exceeded', async () => {

            await User.deleteMany({});
            let user = {
                // _id: mongoose.Types.ObjectId().toHexString(),
                email: "test@mail.com",
                password: "123456789aB.",
                name: "testuser",
                isAdmin: true,
                host: "http://localhost:3000",
                api_key: "",
                usage: [
                    {
                        data: "2021-10-12",
                        count: 0,
                    }
                ]
            };

            const origin = "http://localhost:3000";
            const usr = await createUserObject(user, origin, 257);
            token = usr.token;
            user = usr.user;
            const api_key = user.api_key;

            const res = await request(server)
                .get('/api/users')
                .set('authorization', token)
                .set('x-api-key', api_key)
                .set('origin', origin)
                .send();

            expect(res.status).toBe(429);
        });
    });
});
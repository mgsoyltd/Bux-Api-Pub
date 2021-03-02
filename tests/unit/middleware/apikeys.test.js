const request = require('supertest');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const { getApiKey } = require('../../../middleware/apikeys');
const _ = require("lodash");

let server;

beforeAll(() => {
})

afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
})

describe('/api/users', () => {

    beforeEach(() => {
        server = require('../../../index');
    })
    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {

        it('should return all users', async () => {

            var user = {
                _id: mongoose.Types.ObjectId().toHexString(),
                email: "test@mail.com",
                password: "adskflsdjflkdsjf",
                name: "testuser",
                isAdmin: true,
                host: "http://localhost:3000",
                api_key: "",
                usage: [
                    {
                        data: "2021-02-26",
                        count: 1,
                    }
                ]
            };

            const origin = "http://localhost:3000";
            user = new User(user);
            const token = user.generateAuthToken();
            user = getApiKey(user, {
                header: jest.fn().mockReturnValue(origin)
            });
            const api_key = user.api_key;
            user.usage[0].count = 1;

            await User.collection.insertOne(user);

            const res = await request(server)
                .get('/api/users')
                .set('x-auth-token', token)
                .set('x-api-key', api_key)
                .set('origin', origin)
                .send();

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.name === 'testuser')).toBeTruthy();
        });
    });

    it('should return invalid API KEY 403 due to different origin', async () => {

        var user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: "test@mail.com",
            password: "adskflsdjflkdsjf",
            name: "testuser",
            isAdmin: true,
            host: "http://localhost:3000",
            api_key: "",
            usage: [
                {
                    data: "2021-02-26",
                    count: 1,
                }
            ]
        };

        const origin = "http://localhost:3000";
        user = new User(user);
        const token = user.generateAuthToken();
        user = getApiKey(user, {
            header: jest.fn().mockReturnValue(origin)
        });
        const api_key = user.api_key;
        user.usage[0].count = 1;

        await User.collection.insertOne(user);

        const res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)
            .set('x-api-key', api_key)
            .set('origin', "http://localhost:3001")
            .send();

        expect(res.status).toBe(403);
    });

    it('should return invalid API KEY 403', async () => {

        var user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: "test@mail.com",
            password: "adskflsdjflkdsjf",
            name: "testuser",
            isAdmin: true,
            host: "http://localhost:3000",
            api_key: "",
            usage: [
                {
                    data: "2021-02-26",
                    count: 1,
                }
            ]
        };

        const origin = "http://localhost:3000";
        user = new User(user);
        const token = user.generateAuthToken();
        user = getApiKey(user, {
            header: jest.fn().mockReturnValue(origin)
        });
        const api_key = user.api_key;
        user.usage[0].count = 1;

        await User.collection.insertOne(user);

        const res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)
            .set('x-api-key', "")
            .set('origin', origin)
            .send();

        expect(res.status).toBe(403);
    });

    it('should increase API usage counter', async () => {

        var user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: "test@mail.com",
            password: "adskflsdjflkdsjf",
            name: "testuser",
            isAdmin: true,
            host: "http://localhost:3000",
            api_key: "",
            usage: [
                {
                    data: "2021-02-26",
                    count: 1,
                }
            ]
        };

        const origin = "http://localhost:3000";
        user = new User(user);
        const token = user.generateAuthToken();
        user = getApiKey(user, {
            header: jest.fn().mockReturnValue(origin)
        });
        const api_key = user.api_key;
        user.usage[0].count = 1;

        await User.collection.insertOne(user);

        var res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)
            .set('x-api-key', api_key)
            .set('origin', origin)
            .send();

        expect(res.status).toBe(200);

        var account = await User.findOne(
            {
                host: origin,
                api_key: api_key
            });

        expect(account.usage[0].count).toBe(2);

        res = {};
        res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)
            .set('x-api-key', api_key)
            .set('origin', origin)
            .send();

        expect(res.status).toBe(200);

        account = await User.findOne(
            {
                host: origin,
                api_key: api_key
            });
        expect(account.usage[0].count).toBe(3);

    });

    it('should return Max API calls exceeded', async () => {

        var user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            email: "test@mail.com",
            password: "adskflsdjflkdsjf",
            name: "testuser",
            isAdmin: true,
            host: "http://localhost:3000",
            api_key: "",
            usage: [
                {
                    data: "2021-02-26",
                    count: 1,
                }
            ]
        };

        const origin = "http://localhost:3000";
        user = new User(user);
        const token = user.generateAuthToken();
        user = getApiKey(user, {
            header: jest.fn().mockReturnValue(origin)
        });
        const api_key = user.api_key;
        user.usage[0].count = 257;

        await User.collection.insertOne(user);

        const res = await request(server)
            .get('/api/users')
            .set('x-auth-token', token)
            .set('x-api-key', api_key)
            .set('origin', origin)
            .send();

        expect(res.status).toBe(429);
    });

});
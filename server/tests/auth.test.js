import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';
import User from '../src/models/User.js';
let database;
const app = createApp();
const account = { name: 'Test Gardener', email: 'gardener@example.com', password: 'garden-secret-123' };
let token;
before(async () => { process.env.JWT_SECRET = 'test-only-secret-at-least-thirty-two-characters'; database = await MongoMemoryServer.create(); await connectDatabase(database.getUri('moodgarden_test')); await User.init(); });
after(async () => { await mongoose.disconnect(); await database?.stop(); });
test('register persists a bcrypt hash and issues a JWT without leaking the hash', async () => {
 const result = await request(app).post('/api/auth/register').send(account).expect(201);
 token = result.body.data.token; assert.equal(result.body.data.user.name, account.name); assert.equal('passwordHash' in result.body.data.user, false);
 const saved = await User.findOne({ email: account.email }).select('+passwordHash'); assert.ok(saved); assert.notEqual(saved.passwordHash, account.password); assert.equal(await bcrypt.compare(account.password, saved.passwordHash), true);
 assert.equal(jwt.verify(token, process.env.JWT_SECRET).sub, saved.id);
 assert.equal((await User.findById(saved.id)).passwordHash, undefined);
});
test('duplicate normalized email returns 409', async () => { await request(app).post('/api/auth/register').send({ ...account, email: 'GARDENER@example.com' }).expect(409); });
test('login and authenticated me return current database user', async () => {
 const result = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password }).expect(200);
 const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${result.body.data.token}`).expect(200);
 assert.equal(me.body.data.user.email, account.email); assert.equal('passwordHash' in me.body.data.user, false);
});
test('wrong password and unknown account return 401', async () => { for (const data of [{ email: account.email, password: 'wrong-password' }, { email: 'nobody@example.com', password: account.password }]) await request(app).post('/api/auth/login').send(data).expect(401); });
test('missing, invalid, expired, and wrong-algorithm tokens return 401', async () => {
 await request(app).get('/api/auth/me').expect(401);
 const subject = jwt.decode(token).sub;
 const expired = jwt.sign({}, process.env.JWT_SECRET, { subject, expiresIn: -1, issuer: 'moodgarden', audience: 'moodgarden-web' });
 const wrongAlgorithm = jwt.sign({}, process.env.JWT_SECRET, { subject, algorithm: 'HS384', issuer: 'moodgarden', audience: 'moodgarden-web' });
 for (const value of ['garbage', expired, wrongAlgorithm]) await request(app).get('/api/auth/me').set('Authorization', `Bearer ${value}`).expect(401);
});
test('malformed registration data returns 400', async () => {
 for (const data of [{}, { ...account, name: ' ' }, { ...account, name: {} }, { ...account, email: 'bad' }, { ...account, password: 'short' }, { ...account, password: '🌷'.repeat(20) }, { ...account, email: {} }]) await request(app).post('/api/auth/register').send(data).expect(400);
 await request(app).post('/api/auth/register').set('Content-Type', 'application/json').send('{').expect(400);
});
test('deleted account token and logged-out request are rejected', async () => {
 await User.deleteOne({ email: account.email }); await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401); await request(app).get('/api/auth/me').expect(401);
});

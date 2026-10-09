import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { httpError, issueToken, publicUser } from '../utils/auth.js';

function credentials(body) {
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') throw httpError(400, 'Email and password are required.');
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, 'Please enter a valid email address.');
  if (body.password.length < 8 || Buffer.byteLength(body.password, 'utf8') > 72) throw httpError(400, 'Password must be at least 8 characters and at most 72 UTF-8 bytes.');
  return { email, password: body.password };
}

export async function register(request, response) {
  const { email, password } = credentials(request.body);
  if (typeof request.body.name !== 'string' || !request.body.name.trim() || request.body.name.trim().length > 80) throw httpError(400, 'Please enter a name of 1–80 characters.');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: request.body.name.trim(), email, passwordHash });
  response.status(201).json({ data: { user: publicUser(user), token: issueToken(user) } });
}

export async function login(request, response) {
  const { email, password } = credentials(request.body);
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !await bcrypt.compare(password, user.passwordHash)) throw httpError(401, 'Email or password is incorrect.');
  response.json({ data: { user: publicUser(user), token: issueToken(user) } });
}

export async function me(request, response) {
  const user = await User.findById(request.user.id);
  if (!user) throw httpError(401, 'This account is no longer available. Please log in again.');
  response.json({ data: { user: publicUser(user) } });
}

import jwt from 'jsonwebtoken';

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

export function issueToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: '7d', algorithm: 'HS256', issuer: 'moodgarden', audience: 'moodgarden-web' });
}

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

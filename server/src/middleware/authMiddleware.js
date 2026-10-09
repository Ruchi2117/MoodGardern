import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { httpError } from '../utils/auth.js';

export function requireAuth(request, _response, next) {
  const match = request.headers.authorization?.match(/^Bearer (\S+)$/i);
  if (!match) return next(httpError(401, 'Please log in to continue.'));
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'moodgarden', audience: 'moodgarden-web' });
    if (typeof payload === 'string' || !mongoose.isObjectIdOrHexString(payload.sub)) throw new Error('Invalid subject');
    request.user = { id: payload.sub };
    next();
  } catch {
    next(httpError(401, 'Your session has expired or is invalid. Please log in again.'));
  }
}

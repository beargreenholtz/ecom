import type express from 'express';
import jwt from 'jsonwebtoken';

import HttpError from '../models/http-error';

const checkAuth = (
  req: express.Request & { userData?: { userId: string } },
  _: express.Response | express.RequestHandler,
  next: express.NextFunction
) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('auth fail');
    }

    const decodedToken = jwt.verify(
      token,
      'supersecret_dont_share'
    ) as IDecodedToken;

    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('auth failed', 401);

    return next(error);
  }
};

export interface IDecodedToken {
  readonly userId: string;
}

export default checkAuth;

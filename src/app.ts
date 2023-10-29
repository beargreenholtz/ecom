import express, { type ErrorRequestHandler } from 'express';

import userRouter from './routes/users-routes';
import HttpError from './models/http-error';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  (_: express.Request, res: express.Response, next: express.NextFunction) => {

	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PATCH, DELETE, PUT'
    );
    next();
  }
);

app.use('/user', userRouter);

app.use(() => {
  const error = new HttpError('Could not find this route.', 404);

  throw error;
});

app.use(((error, _, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
}) as ErrorRequestHandler);

export default app;

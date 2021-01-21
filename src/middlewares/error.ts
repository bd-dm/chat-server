import { ErrorRequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const error = (): ErrorRequestHandler => (err, req, res, _next) => {
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
    },
  });
};

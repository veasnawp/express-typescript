import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(400);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError") {
    // && err.kind === 'ObjectId'
    statusCode = 400;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

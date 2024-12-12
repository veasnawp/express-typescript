import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import 'dotenv/config'

import connectDB from "./mongodb/connect.js";

import url from 'url';
import path from 'path';
import { asyncHandler, errorHandler, notFound } from "./middlewares/index.js";
import { PORT } from "./app/constants.js";

import appRouters from "./router/index.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __publicDir = path.join(process.cwd(), 'public');

const app = express();

app.use(
  express.json(),
  express.static('public'),
  bodyParser.urlencoded({ extended: true }),
);

let CORS_ORIGIN = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split('|') : process.env.CORS_ORIGIN;

app.use(
  compression() as any,
  cookieParser(),
  bodyParser.json(),
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

connectDB();

appRouters(app);

app.get("/goto/*", asyncHandler((req, res) => {
  const path = req.originalUrl.replace('/goto/', '/')
  res.redirect(path)
}))

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Express boilerplate backend" }).end()
})

app.post("/", (req, res) => {
  res.status(200).send({ message: "Welcome to Express boilerplate backend" }).end()
})

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app;

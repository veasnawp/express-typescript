import express from "express";
import usersRoutes from "./users.js";
import authRoutes from "./auth.js";
import nodeRoutes from "./node.js";

const router = express.Router();

const apiRoutes = (): express.Router => {
  usersRoutes(router);
  authRoutes(router);
  return router;
}

const extraRoutes = (): express.Router => {
  nodeRoutes(router);
  return router;
}

export default function appRouters(app: express.Express) {
  app.use('/api/v1', apiRoutes());
  app.use('/', extraRoutes());
};

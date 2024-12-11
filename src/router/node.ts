import { imageToBase64 } from "../lib/index.js";
import { asyncHandler } from "../middlewares/index.js";
import type { Router } from "express";

const toBase64 = asyncHandler(async (req, res) => {
  let url = req.body?.url || req.query.url;
  if (!url) return res.sendStatus(404);

  const base64 = await imageToBase64(url);
  res.status(200).send({ data: base64 });
});

export default (router: Router) => {
  router.route("/app/image-convert/base64").get(toBase64).post(toBase64);
};

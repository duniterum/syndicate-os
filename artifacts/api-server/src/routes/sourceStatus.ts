import { Router, type IRouter } from "express";
import { GetSourceStatusResponse } from "@workspace/api-zod";
import { sourceStatusResponse } from "../data/sourceStatus";

const router: IRouter = Router();

router.get("/source-status", (_req, res) => {
  const data = GetSourceStatusResponse.parse(sourceStatusResponse);
  res.json(data);
});

export default router;

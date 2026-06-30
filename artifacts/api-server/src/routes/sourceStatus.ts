import { Router, type IRouter } from "express";
import { sourceStatusResponse } from "../data/sourceStatus";

const router: IRouter = Router();

router.get("/source-status", (_req, res) => {
  res.json(sourceStatusResponse);
});

export default router;

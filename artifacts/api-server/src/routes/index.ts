import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sourceStatusRouter from "./sourceStatus";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sourceStatusRouter);

export default router;

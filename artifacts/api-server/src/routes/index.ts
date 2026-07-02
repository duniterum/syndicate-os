import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sourceStatusRouter from "./sourceStatus";
import protocolRealityRouter from "./protocolReality";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sourceStatusRouter);
router.use(protocolRealityRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sourceStatusRouter from "./sourceStatus";
import protocolRealityRouter from "./protocolReality";
import sourceValidateRouter from "./sourceValidate";
import joinQuoteRouter from "./joinQuote";
import holderIndexRouter from "./holderIndex";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sourceStatusRouter);
router.use(protocolRealityRouter);
router.use(sourceValidateRouter);
router.use(joinQuoteRouter);
router.use(holderIndexRouter);

export default router;

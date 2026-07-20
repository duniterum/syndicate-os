import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sourceStatusRouter from "./sourceStatus";
import protocolRealityRouter from "./protocolReality";
import sourceValidateRouter from "./sourceValidate";
import joinQuoteRouter from "./joinQuote";
import holderIndexRouter from "./holderIndex";
import verifyLinksRouter from "./verifyLinks";
import backboneStatusRouter from "./backboneStatus";
import backboneFeedRouter from "./backboneFeed";
import capitalStandingRouter from "./capitalStanding";
import receiptLookupRouter from "./receiptLookup";
import receiptCardRouter from "./receiptCard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sourceStatusRouter);
router.use(protocolRealityRouter);
router.use(sourceValidateRouter);
router.use(joinQuoteRouter);
router.use(holderIndexRouter);
router.use(verifyLinksRouter);
router.use(backboneStatusRouter);
router.use(backboneFeedRouter);
router.use(capitalStandingRouter);
router.use(receiptLookupRouter);
router.use(receiptCardRouter);

export default router;

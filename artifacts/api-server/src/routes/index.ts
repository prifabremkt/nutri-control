import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import foodsRouter from "./foods";
import diaryRouter from "./diary";
import hydrationRouter from "./hydration";
import recipesRouter from "./recipes";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(foodsRouter);
router.use(diaryRouter);
router.use(hydrationRouter);
router.use(recipesRouter);
router.use(progressRouter);

export default router;

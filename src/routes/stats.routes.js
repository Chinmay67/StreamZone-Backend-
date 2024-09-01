import { Router } from "express";
import { getChannelStats } from "../controllers/Stat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();
router.use(verifyJWT)

router.route("/studio/channel-stats").get(getChannelStats)

export default router
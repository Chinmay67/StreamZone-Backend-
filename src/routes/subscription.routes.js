import { Router } from 'express';
import {
    checkUserSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);



router.route("/subscriptionStatus/:channelId").get(checkUserSubscription)
router.route("/u/:subscriberId").get(getUserChannelSubscribers);
export default router
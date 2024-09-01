import { Router} from "express";
import { getOtherUserVideos, getRandomVideos, getTrendingVideos, getVideoById } from "../controllers/video.controller.js";
import { getVideoComments } from "../controllers/comment.controller.js";
import { getOtherChannelProfile } from "../controllers/user.controller.js";
import { getOtherSubcriberCount } from "../controllers/subscription.controller.js";
// import { findUserById } from "../controllers/user.controller.js";

const router=Router()

router.route('/get-videos').get(getRandomVideos)
// router.route('/get-username').post()
router.route('/get-trending').get(getTrendingVideos)
router.route('/:videoId').get(getVideoById)
router.route("/comments/:videoId").get(getVideoComments)
router.route("/videos/:username").get(getOtherUserVideos)
router.route("/user/:username").get(getOtherChannelProfile)
router.route("/subscriberCount/:id").get(getOtherSubcriberCount)
export default router

import { Router} from "express";
import { getOtherUserVideos, getRandomVideos, getVideoById } from "../controllers/video.controller.js";
import { getVideoComments } from "../controllers/comment.controller.js";
import { getOtherChannelProfile } from "../controllers/user.controller.js";
// import { findUserById } from "../controllers/user.controller.js";

const router=Router()

router.route('/get-videos').get(getRandomVideos)
// router.route('/get-username').post()

router.route('/:videoId').get(getVideoById)
router.route("/comments/:videoId").get(getVideoComments)
router.route("/videos/:username").get(getOtherUserVideos)
router.route("/user/:username").get(getOtherChannelProfile)
export default router

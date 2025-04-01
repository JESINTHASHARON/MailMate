import { Router } from "express";
import { addMessage, getMessages,addImageMessage,addAudioMessage, getInitialContactswithMessages } from "../controllers/MessageController.js";
import multer from "multer";

const router = Router();
//multer is used for file handling in node.js
//uploaded files will be stored in upload/images as destination server
const upload = multer({dest:"uploads/recordings"});
const uploadImage=multer({dest:"uploads/images/"});

router.post("/add-message",addMessage)
router.get("/get-messages/:from/:to",getMessages);

//single() - single file upload
router.post("/add-image-message",uploadImage.single("image"),addImageMessage);
router.post("/add-audio-message",upload.single("audio"),addAudioMessage);

router.get("/get-initial-contacts/:from",getInitialContactswithMessages);

export default router;
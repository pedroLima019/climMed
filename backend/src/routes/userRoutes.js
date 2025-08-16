const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.get("/forgotPassword", userControllers.forgotPassword);
router.put("/resetPassword", userControllers.resetPassword);
router.delete("/deleteAccount", authMiddleware, userControllers.deleteAccount);

module.exports = router;

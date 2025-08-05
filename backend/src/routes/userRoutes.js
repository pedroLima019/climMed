const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.get("/forgotPassword", userControllers.forgotPassword);
router.put("/resetPassword", userControllers.resetPassword);
router.delete("/deleteAccount", userControllers.deleteAccount);

module.exports = router;

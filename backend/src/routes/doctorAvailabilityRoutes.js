const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/doctorAvailabilityControllers");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, availabilityController.createAvailability);
router.get("/", authMiddleware, availabilityController.getMyAvailability);
router.delete("/", authMiddleware, availabilityController.deleteAvailability);
router.get("/slots", authMiddleware, availabilityController.getAvailableSlots);

module.exports = router;

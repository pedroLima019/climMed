const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/doctorAvailabilityControllers");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, availabilityController.createAvailability);
router.get("/", authMiddleware, availabilityController.getMyAvailability);
router.delete("/", authMiddleware, availabilityController.deleteAvailability);
router.get(
  "/available-slots",
  authMiddleware,
  availabilityController.getAvailableSlots
);
router.put(
  "/availability",
  authMiddleware,
  availabilityController.updateAvailability
);

module.exports = router;

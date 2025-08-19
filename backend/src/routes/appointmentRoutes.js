const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentControllers");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, appointmentController.createAppointment);
router.get("/", authMiddleware, appointmentController.getAppointments);
router.patch(
  "/:id/cancel",
  authMiddleware,
  appointmentController.cancelAppointment
);
router.get(
  "/history",
  authMiddleware,
  appointmentController.getPastAppointments
);
router.post(
  "/available-slots",
  authMiddleware,
  appointmentController.getAvailableSlots
);

module.exports = router;

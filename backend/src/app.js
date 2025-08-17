const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const doctorAvailabilityRoutes = require("./routes/doctorAvailabilityRoutes");
app.use("/availability", doctorAvailabilityRoutes);

module.exports = app;

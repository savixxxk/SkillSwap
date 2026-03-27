const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tutorRoutes = require("./routes/tutorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/skillswap");

app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);

app.listen(5000, () => console.log("Server running"));
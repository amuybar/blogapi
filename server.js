require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3002;

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (if you have images or other assets)
app.use(express.static(path.join(__dirname, "public")));

// API Routes
routes(app);

// Catch-all route for invalid endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

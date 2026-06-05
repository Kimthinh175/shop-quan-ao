const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./core/routes");

const { notFound, errorHandler } = require('./core/middlewares/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logger
app.use(morgan("dev"));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Swagger Documentation
const setupSwagger = require('./core/config/swagger');
setupSwagger(app);

// Base Route
app.get("/", (req, res) => {
  res.json({
    message: "Lab Node.js API is running!",
    version: "1.0.0",
    documentation: "/api/welcome",
  });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

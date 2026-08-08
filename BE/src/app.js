const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./core/routes");

const { notFound, errorHandler } = require('./core/middlewares/errorHandler');

const app = express();

// Set trust proxy to get real IP behind load balancers like Render
app.set('trust proxy', 1);

// Security & Logging Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan("dev"));
app.use(cookieParser());

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

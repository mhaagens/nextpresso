import express from "express";
import bodyParser from "body-parser";

// Controllers
import HomeController from "controllers/home_controller";

// Helpers
import { NotFound } from "helpers/route_helpers";

// Server
const server = express();

// Middleware
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// Routes
server.use("/", HomeController.routes());
server.use(NotFound);

process.on("unhandledRejection", error => {
  throw new Error("Errors shouldn't get to this point!");
});

export default server;
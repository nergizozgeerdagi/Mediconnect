require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const { sequelize } = require("./models");
const cors = require("cors");
const helmet = require("helmet");

// CORS middleware
app.use(cors({
   origin: "*",
   methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
   allowedHeaders: "X-Requested-With,content-type",
   credentials: true
}));

// preflight 
app.options('*', cors());

// Helmet
app.use(helmet());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik hale getirme
app.use("/public", express.static(__dirname + "/public"));

// Routes & controllers
app.get("/api", (req, res) => res.json({ msg: "Api" }));
app.use("/api", require("./src/routes/user-route"));

// 404 error
app.use(function (req, res, next) {
   const { errorResponse } = require("./src/utils/constants");
   res.status(404).json(errorResponse("API NOT FOUND", res.statusCode));
});


let port = 3002;

app.listen(port, async () => {
   await sequelize.authenticate();
   // await sequelize.sync({ alter: true, force: true });

   console.log(`Server Started on port ${port}`);
});

module.exports = { app };

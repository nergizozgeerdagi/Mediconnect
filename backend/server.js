require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const { sequelize } = require("./models");
const cors = require("cors");
const helmet = require("helmet");

app.use(
   cors({
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      origin: "*",
   })
);
app.use(function (req, res, next) {
   // res.header("Access-Control-Allow-Origin", "*");
   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
   // next();
   res.setHeader("Access-Control-Allow-Origin", "*");
   
   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
   res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
   
   res.setHeader("Access-Control-Allow-Credentials", true);
   
   next();
});

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(__dirname + "/public"));

app.get("/api", (req, res) => res.json({ msg: " MC Backend API" }));
app.use("/api", require("./src/routes/user-route"));
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

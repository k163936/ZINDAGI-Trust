"use strict";

const express = require('express');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const multer = require('multer');
const port = process.env.PORT || 3000;
const mysql = require('mysql')

const passport = require('passport');
const flash = require('connect-flash');

// connect to database

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ZINDAGItrust",
});

connection.connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});

global.connection = connection;

//----------------------------------//

// Setting Environments //

require('./config/passport')(passport);

app.use(session({
  secret: 'justasecret',
  resave: true,
  saveUninitialized: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./routes/index.js")(app, passport);

app.listen(port, () => {
  console.log(`Server running on port: `, port);
});

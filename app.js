const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 3000;

const passport = require("passport");
const flash = require("connect-flash");

require("./routes/passport")(passport);

// app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(
  session({
    secret: "justasecret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./routes/index.js")(app, passport);

app.listen(port, () => {
  console.log(`Server running on port: `, port);
});

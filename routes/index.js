const express = require("express");

const nodemailer = require("nodemailer");
const path = require("path");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });

var mysql = require("mysql");
var dbconfig = require("./database");
var connection = mysql.createConnection(dbconfig.connection);

connection.query("USE " + dbconfig.database);

module.exports = (app, passport) => {
  app.get("/", function(req, res) {
    res.render("index");
  });

  app.get("/login", function(req, res) {
    res.render("login", {
      message: req.flash("loginMessage")
    });
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true
    }),
    function(req, res) {
      if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
      } else {
        req.session.cookie.expires = false;
      }
      res.redirect("/");
    }
  );

  app.get("/signup", function(req, res) {
    res.render("signup", {
      message: req.flash("signupMessage")
    });
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/login",
      failureRedirect: "/signup",
      failureFlash: true
    })
  );

  app.get("/profile", isLoggedIn, function(req, res) {
    let query = "SELECT * FROM users WHERE ID  = " + req.user.ID;
    connection.query(query, (err, rslt) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("profile", {
          user: rslt,
          result: rslt
        });
      }
    });
  });

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });
  /*******************************************************************/
  const router = express.Router();
  app.use("/profile", router);
  /*******************************************************************/
  router.get("/postDonation", isLoggedIn, function(req, res) {
    res.render("postDonation", {
      message: req.flash("loginMessage")
    });
  });

  router.post("/postDonation", isLoggedIn, function(req, res) {
    req.flash("info", "Flash is back!");
    if (req.body.password != req.user.password) {
      console.log(req.flash("info"));
      res.render("postDonation", {
        message: "Incorrect password, try again!"
      });
    } else {
      let query =
        "INSERT INTO donations (UID, amount, details, type) VALUES ('" +
        req.user.ID +
        "','" +
        req.body.amount +
        "','" +
        req.body.details +
        "','" +
        req.body.type +
        "');";

      console.log(query);
      connection.query(query, (err, result) => {
        if (err) {
          console.log("Query failed");
          res.redirect("/profile/postDonations");
        } else {
          console.log("Run sssss");
          res.redirect("/profile");
        }
      });
    }
  });

  router.get("/doner", function(req, res) {
    let query = "SELECT * FROM donations WHERE type = 'doner';";

    connection.query(query, function(err, result) {
      if (err) {
        console.log("Error in query");
      } else {
        res.render("doner", {
          user: req.user,
          result: result
        });
      }
    });
  });

  router.get("/accepter", function(req, res) {
    let query = "SELECT * FROM donations WHERE type = 'accepter';";

    connection.query(query, function(err, result) {
      if (err) {
        console.log("Error in query");
      } else {
        console.log(result);
        res.render("accepter", {
          user: req.user,
          result: result
        });
      }
    });
  });
  router.get("/myDonations", function(req, res) {
    let query =
      "SELECT * FROM donations WHERE " + req.user.ID + " = donations.UID;";

    connection.query(query, function(err, result) {
      if (err) {
        console.log("Error in query");
      } else {
        console.log(result);
        res.render("accepter", {
          user: req.user,
          result: result
        });
      }
    });
  });

  router.get("/post", function(req, res) {
    sendMail(req, res, req.user);
  });

  app.get("/hi", function(req, res) {
    res.render("edit-profile");
  });

  app.post("/upload", (req, res) => {
    fun_upload(req, res, err => {
      if (err) {
        res.render("edit-profile", {
          msg: err
        });
      } else {
        if (req.file == undefined) {
          res.render("edit-profile", {
            msg: "Error: No File Selected!"
          });
        } else {
          res.render("profile", {
            msg: "File Uploaded!",
            file: `uploads/${req.file.filename}`,
            user: "rslt"
          });
        }
      }
    });
  });
};

function isLoggedIn(req, res, next, data) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}

function sendMail(req, res, user01, email02) {
  console.log(user01.email);
  nodemailer.createTestAccount((error, account) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 25,
      auth: {
        user: "voodoosaeen@gmail.com",
        pass: "abc123xyz456"
      }
    });

    let mailOption = {
      from: '"Fahad Hussain", <voodoosaeen@gmail.com>',
      to: user01.email,
      subject: "Zindagi Trust",
      text:
        "Hi " +
        "arname" +
        " is out of oil!\nPlease change oil as soon as possiblie from the nearest oil changer!\n\nRegards\nAdmin@VMS.com"
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        return console.log(error);
      } else {
        res.redirect("/profile");
      }
    });
  });
}
// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Init Upload
const fun_upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("myImage");

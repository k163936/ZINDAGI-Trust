const express = require("express");

var mysql = require("mysql");
var bcrypt = require("bcrypt-nodejs");
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
          user: rslt
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
};

function isLoggedIn(req, res, next, data) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}

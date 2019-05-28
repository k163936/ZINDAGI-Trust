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
      // console.log(req.user.name)
      res.render("profile", {
        user: req.user
      });
    });
  
    app.get("/logout", function(req, res) {
      req.logout();
      res.redirect("/");
    });
  
    app.get("/postDonation", function(req, res) {
      res.render("postDonation", {
        message: req.flash("loginMessage")
      });
    });
  
    app.post("/postDonation", function(req, res) {});
  };
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
  
    res.redirect("/");
  }
  
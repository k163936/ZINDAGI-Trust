const LocalStrategy = require("passport-local").Strategy;

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.ID);
  });

  passport.deserializeUser(function(ID, done) {
    connection.query("SELECT * FROM users WHERE ID = ? ", [ID], (err, rows) => {
      done(err, rows[0]);
    });
  });

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },

      (req, username, password, done) => {
        connection.query(
          "SELECT * FROM users WHERE username = ? ",
          [username],
          (err, rows) => {
            if (err) return done(err);

            if (rows.length) {
              return done(
                null,
                false,
                req.flash("signupMessage", "That is already taken")
              );
            } else {
              var newUserMysql = {
                username: username,
                password: password,
                name: req.body.name
              };

              var insertQuery =
                "INSERT INTO users (name, username, password) values (?, ?, ?)";
              console.log(
                insertQuery,
                newUserMysql.name,
                newUserMysql.username,
                newUserMysql.password
              );
              connection.query(
                insertQuery,
                [
                  newUserMysql.name,
                  newUserMysql.username,
                  newUserMysql.password
                ],
                (err, rows) => {
                  newUserMysql.ID = rows.insertId;
                  return done(null, newUserMysql);
                }
              );
            }
          }
        );
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, username, password, done) {
        connection.query(
          "SELECT * FROM users WHERE username = ? ",
          [username],
          function(err, rows) {
            if (err) return done(err);

            if (!rows.length)
              return done(
                null,
                false,
                req.flash("loginMessage", "No User Found")
              );

            if (password != rows[0].password)
              return done(
                null,
                false,
                req.flash("loginMessage", "Wrong Password")
              );

            return done(null, rows[0]);
          }
        );
      }
    )
  );
};

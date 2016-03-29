var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport){
    // PASSPORT SESSION SETUP
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    // SIGNUP
    passport.use('local-signup', new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done){

        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
           User.findOne({'local.username': username}, function(err, user){
               // if error , return error
               if (err)
                   return done;

               if (user) {
                   return done(null, false, req.flash('signupMessage', "Ce nom d'utilisateur est déjà pris !"));
               } else {

                   // if there is no user with this username
                   // create user
                   var newUser = new User();

                   //set the user's local credentials
                   newUser.local.username = username;
                   newUser.local.password = newUser.generateHash(password);

                   // save the user
                   newUser.save(function(err) {
                       if(err)
                          throw err;

                       return done(null, newUser);
                   });
               }
           });
        });
    }));

    // LOGIN
    passport.use('local-login', new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        User.findOne({ 'local.username' : username}, function(err, user) {
            if (err)
                return done;

            // if no user is found, return message
            if (!user)
                return done(null, false, req.flash('loginMessage', "Cette utilisateur n'existe pas !"));

            // if the user is found but password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', "Mauvais mot de passe  !"));

            return done(null, user);
        })
    }));
};

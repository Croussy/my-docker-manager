var User = require('../models/user');
module.exports = function(req, res, done){
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirmation  = req.body.passwordConfirmation;
    var url = req.body.url;

    User.findOne({ 'local.username' : req.user.local.username}, function(err, user) {
        if (err)
            return done;

        // if no user is found, return message
        if (!user)
            return done(null, false, req.flash('settingsMessage', "Cette utilisateur n'existe pas !"));

        if (password != "" && passwordConfirmation!= "") {
            if (password == passwordConfirmation) {
                user.local.password = user.generateHash(password);

            } else {
                req.flash('settingsMessage', "Le mot de passe de confirmation ne correspond pas !");
                return res.redirect('/settings');
            }
        } else if(password == "" && passwordConfirmation != ""){
            req.flash('settingsMessage', "Le champ du mot passe ne peut pas être vide");
            return res.redirect('/settings');

        } else if(password != "" && passwordConfirmation == "") {
            req.flash('settingsMessage', "Le champ du mot passe de confirmation ne peut pas être vide");
            return res.redirect('/settings');
        }

        if(username != "") {
            user.local.username = username;
        }

        if(url != "") {
            user.local.url = url;
        }

        user.save();
        res.redirect("/");
    });
};

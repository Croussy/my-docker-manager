require('../config/configDocker.js');
var request = require('request');
var async = require("async");

module.exports = function(app, req, res, erreurMessage){
    var running_container = [];
    var allContainer = [];

    async.each(adresses,
        function(item, callback){

            request('http://'+ item +':'+ port +'/containers/json',function(error,response,body){
                if(!error && response.statusCode == 200){
                    running_container.push(item);
                    running_container.push(JSON.parse(body));
                }
            });
            request('http://'+ item +':'+ port +'/containers/json?all=1',function(error,response,body){
                if(!error && response.statusCode == 200){
                    allContainer.push(item);
                    allContainer.push(JSON.parse(body));
                    callback();
                }
            });
        },function(err){
            res.render("index.ejs", {
                title: "Accueil",
                user: req.user,
                panelTitle: "Tableau de bord",
                running: running_container,
                allContainer: allContainer,
                messageErreur: erreurMessage
            });
        }
    );
};

require('../config/configDocker.js');

// Request
var request=require('request');
var requestJson = require('request-json');

module.exports = function(app, passport){

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	// Call page
	app.get('/', isLoggedIn, function(req, res){
		var erreur = "";
		require("../controllers/containerController.js")(app, req, res, erreur);
	});

	// SETTINGS
	app.get('/settings', isLoggedIn, function(req, res) {
		res.render("settings.ejs", {
			title: "Mes paramètres",
			user: req.user,
			panelTitle: "Mes paramètres",
			message: req.flash('settingsMessage')
		});
	});

	app.post('/settings', function(req, res) {
		require('../controllers/userController.js')(req, res);
	});

	// SIGNUP, LOGIN ET LOGOUT
	app.get('/login', function(req, res){
		res.render("login.ejs", {
			title: "Login",
			user: false,
			message: req.flash('loginMessage')
		});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash : true
	}));

	app.get('/signup', function(req, res){
		res.render("signup.ejs", {
			title: "Signup",
			user: false,
			message: req.flash('signupMessage')
		});
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash : true
	}));

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});

	app.get('/startContainer/:id', isLoggedIn, function(req, res){
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.post('containers/'+id+'/start', null, function(err, response, body) {
			if(response.statusCode == 204){
                res.end(JSON.stringify(id));
			} else if (response.statusCode == 500) {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Le port du container déjà utilisé');
			} else if(response.statusCode == 304) {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Le container est déjà lancé');
			}
		});
	});

	app.get('/stopContainer/:id', isLoggedIn, function(req, res){
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.post('containers/'+id+'/stop', null, function(err, response, body) {
			if(response.statusCode == 204){
				res.end(JSON.stringify(id));
			}
			else if(response.statusCode == 304){
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Le container est déjà stoppé');
			}
		});
	});

	app.get('/detailsContainer/:id', isLoggedIn, function(req, res){
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.get('containers/'+id+'/json', null, function(err, response, body) {
			if(response.statusCode == 200){
				res.render("detailsContainer.ejs", {
					title: "Détail container",
					user: req.user,
					panelTitle: "Details de "+ body.Name,
					container: body,
					messageErreur: ''
				});
			}
		});
	});

	app.get('/renameContainer/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');

		client.get('containers/'+id+'/json', null, function(err, response, body) {
			if(response.statusCode == 200){
				res.render("renameContainer.ejs", {
					title: "Renommer du container",
					user: req.user,
					panelTitle: "Renommer le container",
					container: body,
					messageErreur: ''
				});
			}
		});
	});

	app.post('/renamedContainer/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		var name = req.body.nameContainer;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		var ancienName ="";

		client.get('containers/'+id+'/json', null, function(err, response, body) {
			if(response.statusCode == 200) {
				ancienName = body.Name;

				if(name == ancienName) {
					res.redirect("/detailsContainer/"+ id);
				}
				else {
					client.post('containers/'+id+'/rename?name='+name, null, function(err, response, body) {
						if(response.statusCode == 204){
							res.redirect("/detailsContainer/"+ id);
						}
					});
				}
			}
		});
	});

	app.get('/pauseContainer/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.post('containers/'+ id + '/pause', null, function(err, response, body) {
			if(response.statusCode == 204){
				res.end(JSON.stringify(id));
			}
			else if(response.statusCode == 304){
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Le container est déjà en pause');
			}
		})
	});

	app.get('/unpauseContainer/:id', isLoggedIn, function(req, res) {
		console.log('unpause');
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');

		client.post('containers/'+ id + '/unpause', null, function(err, response, body) {
			if(response.statusCode == 204){
				res.end(JSON.stringify(id));
			}
			else if(response.statusCode == 304){
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Le container est déjà en unpause');
			}
		})
	});

	app.get('/deleteContainer/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.delete('containers/'+id, null, function(err, response, body) {
			if(response.statusCode == 204) {
				res.redirect('/');
			}
		});
	});

	// IMAGES
	app.get('/images', isLoggedIn, function(req, res, next) {
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.get('images/json?all=0', null, function(err, response, body) {
			if(response.statusCode == 200) {
				res.render("listImage.ejs", {
					title: "Liste des images",
					user: req.user,
					panelTitle: "Images",
					images: body
				});
			}
		});
	});

	app.get('/deleteImage/:name', isLoggedIn, function(req, res) {
		var name = req.params.name;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.delete('images/' + name, null, function(err, response, body) {
			if (response.statusCode == 200) {
				res.redirect('/images');
			}
		});
	});

	app.get('/detailsImage/:name', isLoggedIn, function(req, res) {
		var name = req.params.name;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.get('images/' + name + '/json', null, function(err, response, body) {
			console.log(response.statusCode);
			if (response.statusCode == 200) {
				res.render("detailsImage.ejs", {
					title: "Detail de "+ body.RepoTags[0],
					user: req.user,
					panelTitle: "Detail de "+ body.RepoTags[0],
					image: body
				});
			}
		});
	});

	app.get('/searchImage/:image', isLoggedIn, function(req, res) {
		console.log("in");
		var image = req.params.image;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.get('images/search?term=' + image, null, function(err, response, body) {
			res.end(JSON.stringify(body));
		});
	});


	app.get('/container/:id', isLoggedIn, function(req, res){
		var id = req.params.id;
		var client = requestJson.createClient('http://'+ adresses[0] +':'+ port +'/');
		client.get('containers/'+id+'/json', null, function(err, response, body) {
			if(response.statusCode == 200){
				res.end(JSON.stringify(body));
			}
		});
	});

	// FUNCTIONS
	function isLoggedIn(req, res, next){
		if (req.isAuthenticated()){
			return next();
		}
		res.redirect('/login');
	}
};
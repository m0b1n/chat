'use strict';

var http = require('http'), express = require('express'), socket = require('socket.io'), sys = require('util'), path = require('path'), dal = require('./dal/db');

var bodyParser = require('body-parser');
var fs = require('fs');

var IP = '127.0.0.1';
var PORT = 3000;

var client = [], group = [], sockets = [], all = [];

var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
	extended : true
}));

app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(express.static('public/js'));
app.use(express.static('media'));

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.post('/user', function(req, res) {
	/**
	 * new users came here req.body = {name : "name", id:"id", pass:"pass",
	 * pass-confirm:"pass"} req.headers = {user-agent}
	 */

	var flag = false;

	var user = req.body;
	user.headers = req.headers;

	// semantecs
	// user registered before
	// DAL works here
	dal.get(user.id, function(err, data) {
		if (err) {
			console.log(err);
			dal.createUser("user", user.id, user.name, user.gender, user.pass,
					function(err) {
						res.render('app', {
							user : user
						});
					});
		} else {
			res.render('error-up', {
				user : user
			});
		}
	});

});

app.post('/da', function(req, res) {
	/**
	 * registered users came here req.body = {id:"id", pass:"pass"} req.headers =
	 * {user-agent}
	 */

	var flag = false;

	var user = req.body;
	user.headers = req.headers;

	// semantecs
	// user not registered

	dal.get(user.id, function(err, data) {
		if (err) {
			console.log(err);
			flag = true;
		}

		// if ok!
		if (!flag) {
			var cat = false;
			for (var i = 0; i < client.length; i++) {
				if (data.id === client[i].id) {
					cat = true;
				}
			}
			if (!cat) {
				res.render('app', {
					user : data
				});
			} else {
				res.render('error-logged', {
					user : data
				});
			}
		}
		// if user were not registerd
		if (flag) {
			res.render('error-in', {
				id : user.id,
				name : user.name
			});
		}
	});

});

var server = http.createServer(app).listen(PORT, IP);

var io = socket.listen(server);

console.log('server started listening on ' + IP + ' : ' + PORT);

function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
	
	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}
	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');
	
	return response;
}

function decodeBase64Audio(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
	
	console.log(type);
	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}
	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');
	
	return response;
}

io.on('connection', function(socket) {

	console.log('socket came in');
	var users = {
		id : "",
		name : ""
	};
	socket.users = users;
	sockets.push(socket);

	dal.getGroups(function(err, groups) {
		group = groups;
	});

	dal.getAll(function(err, alls) {
		all = alls;
	});

	socket.on('validation message', function(msg) {

		for (var i = 0; i < sockets.length; i++) {
			if (sockets[i] === socket) {
				socket.users = msg;
				client.push(msg);
				sockets[i] = socket;
			}
		}

		dal.setDateIn("dateIn", msg.id, new Date(), function(err) {
			if (err) {
				console.log(err);
			}
		});

		io.emit('sockets', client);
		io.emit('sockets-off', all);
		io.emit('groups', group);
	});

	socket.on('history', function(ids) {
		var msg = {
			sent : [],
			rec : []
		};

		console.log('sender ' + ids.me + ' : rec ' + ids.it);
		dal.getHistorySentTemp(ids.me, ids.it, function(err, data) {
			if (err) {
				console.log(err);
			}
			msg.sent = data;

			dal.getHistoryRecTemp(ids.me, ids.it, function(err, data) {
				if (err) {
					console.log(err);
				}
				msg.rec = data;

				socket.emit('historyBack', msg);
			});
		});
	});

	socket.on('historyGrp', function(ids) {
		var msg = {
			rec : []
		};

		dal.getHistoryGrpTemp(ids.it, function(err, data) {
			if (err) {
				console.log(err);
			}
			msg.rec = data;

			socket.emit('historyBackGrp', msg);
		});

	});

	socket.on('createGroup', function(msg) {
		var grp = {};

		grp.name = msg.name;
		grp.admin = msg.user.id;
		grp.id = msg.name;

		dal.createGroup("group", grp.id, grp.name, grp.admin, function(err,
				data) {
			if (err) {
				console.log(err);
			}
			console.log('grp saved');
		});

		group.push(grp);
		io.emit('groups', group);

	});

	socket.on('userGroup', function(msg) {
		var grp = {};

		grp.user = msg.user.id;
		grp.id = msg.name;

		dal.addUserGroup("groupMember", grp.id, grp.user, function(err, data) {
			if (err) {
				console.log(err);
			}
			console.log('usr grp saved');
			dal.createHistory("groupMsg", {
				id : grp.id
			}, {
				id : grp.id
			}, "خوش آمدید", new Date().getTime(), "text-type", function(err,
					data) {
				if (err) {
					console.log(err);
				}
			});
		});
	});

	socket.on('chat message', function(msg) {

		if (msg.type === 'img-type') 
		{
			var base64Data = decodeBase64Image(msg.msg);
			// if directory is not already created, then create it, otherwise
			// overwrite existing image
			fs.exists(path.join(__dirname, "media"), function(exists) {
				if (!exists) {
	                fs.mkdir(path.join(__dirname, "media"), function (e) {
	                   
	            			fs.writeFile(__dirname + "/media/" + new Date().getTime() + ".jpg", base64Data.data, function(
	            					err) {
	            				if (err) {
	            					console.log('ERROR:: ' + err);
	            					throw err;
	            				}
	            			});
	                   
	                });
	               
	            }else{ fs.writeFile(__dirname + "/media/" + new Date().getTime() + ".jpg", base64Data.data, function(
        					err) {
        				if (err) {
        					console.log('ERROR:: ' + err);
        					throw err;
        				}
        			});}
			});	
		}else if (msg.type === 'audio-type')
		{
			
		}else if (msg.type === 'video-type')
		{
			
		}else if (msg.type === 'other-type')
		{
			console.log('here dear!');
			
			var base64Data = decodeBase64Image(msg.msg);
			
			var ran = new Date().getTime();
			fs.exists(path.join(__dirname, "media"), function(exists) {
				if (!exists) {
	                fs.mkdir(path.join(__dirname, "media"), function (e) {
	                   
	            			fs.writeFile(__dirname + "/media/" + msg.name,base64Data.data, function(
	            					err) {
	            				if (err) {
	            					console.log('ERROR:: ' + err);
	            					throw err;
	            				}
	            			});
	                   
	                });
	               
	            }else{ fs.writeFile(__dirname + "/media/" + msg.name, base64Data.data, function(
        					err) {
        				if (err) {
        					console.log('ERROR:: ' + err);
        					throw err;
        				}
        			});}
			});
			socket.emit('other type', {add:msg.name});
			return;
		}

		dal.getGrp(msg.reciever.id, function(err, usr) {
			if (!err) {
				// flag = 'grup';
				msg.code = 'groupMsg';
				msg.date = new Date().getTime();
				dal.createHistory(msg.code, msg.sender, msg.reciever, msg.msg,
						msg.date, msg.type, function(err, data) {
							if (err) {
								console.log(err);
							}
						});
				dal.getGrpMember(msg.reciever.id, function(err, mems) {
					for (var i = 0; i < mems.length; i++) {
						if (mems[i].user !== msg.sender.id) {
							for (var j = 0; j < sockets.length; j++) {
								if (sockets[j].users.id === mems[i].user) {
									sockets[j].emit('chat message', msg);
								}
							}
						}
					}
				});
			}
		});

		dal.get(msg.reciever.id, function(err, usr) {
			if (!err) {
				// flag = 'usr';
				msg.code = 'member';
				msg.date = new Date().getTime();
				dal.createHistory(msg.code, msg.sender, msg.reciever, msg.msg,
						msg.date, msg.type, function(err, data) {
							if (err) {
								console.log(err);
							}
						});
				for (var i = 0; i < sockets.length; i++) {
					if (sockets[i].users.id === msg.reciever.id) {
						sockets[i].emit('chat message', msg);
					}
				}
			}
		});
	});

	socket.on('confirm user', function(data) {
		dal.getGrpMember(data.grp, function(err, mems) {
			if (err) {
				console.log(err);
			}
			var flag = false;
			for (var i = 0; i < mems.length; i++) {
				if (mems[i].user === data.usr.id) {
					flag = true;
				}
			}

			if (flag) {
				socket.emit('approve user', data.usr);
			} else {
				var cle = {
					id : ""
				};
				socket.emit('approve user', cle);
				var msg = {
					code : "groupMsg",
					msg : "may you confirm me?",
					sender : {
						id : data.usr.id,
						name : ""
					},
					reciever : {
						id : data.grp
					},
					type : 'approve-type'
				};

				console.log(msg);

				dal.createHistory(msg.code, msg.sender, msg.reciever, msg.msg,
						new Date().getTime(), msg.type, function(err) {
							if (err) {
								console.log(err);
							}
						});
			}

		});
	});

	socket.on('disconnect', function() {
		console.log('kicked');

		var idx = sockets.indexOf(socket);

		dal.setDateOut("dateOut", sockets[idx].users.id, new Date(), function(
				err) {
			if (err) {
				console.log(err);
			}
		});

		if (idx !== -1) {
			sockets.splice(idx, 1);
			client.splice(idx, 1);
		}
		io.emit('sockets', client);
	});

});

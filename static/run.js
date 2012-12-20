var http = require('http');
var fs = require('fs');
var touchedDB = require('./db.js');

// at any time we can call: touchedDB.createSoemthing

// Check port number
var port = process.env.PORT || parseInt(process.argv[2]);
if(!port) {
	console.log('ERROR: no port number provided.');
	console.log('Please run as: node static.js <port>');
	return;
}

// mime types
var mimes = {
	html : 'text/html',
	js : 'text/javascript',
	css : 'text/css',
	jpg : 'image/jpeg',
	png : 'image/png',
	ico : 'image/ico',
	svg : 'image/svg+xml'
}

// Generate validation code
function generateCode(len) {
	var r = Math.floor(Math.random() * 62);
	return len == 0 ? "" : generateCode(len - 1) + String.fromCharCode(r < 10 ? r + 48 : (r < 36 ? r + 65 - 10 : r + 97 - 36));
}

var adminCode = generateCode(24);
var files = {};
var waiting = null;
// Keyboard waits for y/Y input to grand write access
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(text) {
	if(waiting)
		waiting(text.match(/ *y(es)? */i));
});
// Run web server
http.createServer(function(req, res) {
	// check code if provided
	var filename = req.url.match('^/+([^?]*)')[1];
	var validCode = false;
	var reqCode = '';
	if(req.url.match(/[?&]code=/))
		reqCode = (req.url.match('[?&]code=([^&]*)') || [])[1];
	if(isMongoDB(filename)) {
		// check code from MongoDB (is true if docuemnt does not exist)
        /*
		getCollection(function(collection) {
			touchedDB.checkCode(collection, filename, reqCode, function(valid) {
				console.log(valid);
				handleRequest(req, res, valid, filename, reqCode);
			});
		});*/
		validCode = true;
		handleRequest(req, res, validCode, filename, reqCode);
	} else {
		validCode = (reqCode == adminCode) && files[filename];
		handleRequest(req, res, validCode, filename, reqCode);
	}

}).listen(port);

function handleRequest(req, res, validCode, filename, reqCode) {
	// serve appropriate file
	if(req.url.match('^/(index.html)?$')) {
		res.writeHead(303, {
			'location' : '/static/index.xml?run'
		});
		res.end();
	} else if(req.url.match('^/test/?$')) {
		res.writeHead(303, {
			'location' : '/test/index.html'
		});
		res.end();
	} else if(req.url.match(/[?&](save|edit|view|run|play)(&|$)/)) {
		// check security code for edit and save actions
		var mode = req.url.match(/[?&]([^&]*)(&|$)/)[1];
		if(mode == 'save') {
			if(validCode)
				saveFile(req, res, filename, reqCode);
			else
				denyAccess(res, 'Invalid security code');
		} else if(mode == 'play') {
			showTouched(res, filename, 'static/touched.html', '_play_');
		} else if(mode == 'view') {
			showTouched(res, filename, 'static/touched.html', '');
		} else if(mode == 'run') {
			showTouched(res, filename, 'static/execute.html', '');
		} else if(mode == 'edit' && validCode) {
			showTouched(res, filename, 'static/touched.html', reqCode);
		} else {
			if(waiting)
				waiting(false);
			console.log('Grant access to file : ' + filename + ' [y/n]?');
			waiting = function(granted) {
				if(granted) {
					files[filename] = true;
					res.writeHead(303, {
						'location' : '/' + filename + '?edit&code=' + adminCode
					});
					res.end();
				} else {
					denyAccess(res, 'Access denied: ' + filename);
				}
				waiting = null;
			}
		}
	} else if(req.url.match("/redirect/")) {
		var url = req.url.match("/redirect/(.*)")[1];
		redirect(res, url);
	} else {
		serveFile(res, filename, validCode);
	}
}

function serveFile(res, filename) {
	var mime = mimes[filename.replace(/[^.]*\./g, '')];
	readTouchedContent(filename, function(err, data) {
		if(data) {
			res.writeHead(200, {
				'Content-Type' : mime || 'text/plain'
			});
			res.end(data)
		} else {
			res.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			res.end('File does not exist.');
		}
	});
}

function showTouched(res, filename, template, code) {
	var g = 'grammar/' + filename.match('[^.]*$')[0] + '.g';
	fs.stat(g, function(err) {
		if(err) {
			res.writeHead(406, {
				'Content-Type' : 'text/plain'
			});
			res.end('The grammar indicated by the file suffix does not exist: ' + g);
		} else {
			show(res, filename, template, code, g);
		}

	});
}

function show(res, filename, template, code, g) {
	//console.log("get here");
	readTouchedContent(filename, function(err, content) {
		if(err) {
			if(code) {
				// create file or insert with code
				getCollection(function(collection) {
					touchedDB.insert(collection, "", filename, code);
				});
			} else {
				fs.readFile("static/create.html", function(err, data) {
					data = data.toString().replace(/<touched:code>/, generateCode(20))
					res.writeHead(200, {
						'Content-Type' : 'text/html'
					});
					res.end(data);
				})
				return;
			}
		}
		fs.readFile(template, function(err, data) {
			//console.log(data);
			res.writeHead(200, {
				'Content-Type' : 'text/html'
			});
			if(content)
				content = content.toString().replace(/^<touched[^>]*>|<\/touched>$/g, '');
			data = data.toString().replace(/<!--touched:content-->/, content || '');
			data = data.toString().replace(/<touched:file>/, filename);
			data = data.toString().replace(/<touched:code>/, code);
			data = data.toString().replace(/<touched:g>/, '/' + g);
			res.end(data);
		});
	});
}

function isMongoDB(name) {
	return name.match('Mongodb');
}

function readTouchedContent(name, callback) {
	if(isMongoDB(name)) {
		// all mongo dependencies are here, nowhere else
		getCollection(function(collection) {
			collection.find({
				name : name
			}, function(err, cursor) {
				cursor.nextObject(function(err, obj) {
					callback(obj == null, obj && obj.value);
				});
			});
		});
	} else {
		fs.readFile(name, callback);
	}
}

function redirect(res, url) {
	console.log('redirect ' + url);
	var comps = url.match("http://([^/:]+)(:[0-9]+)?(.*)");
	if(comps) {
		var options = {
			host : comps[1],
			port : comps[2] || 80,
			path : comps[3] || '/',
		};
		http.get(options, function(red) {
			red.setEncoding('utf8');
			if(red.statusCode >= 300 && red.statusCode < 310 && red.headers.location) {
				// redirecting
				redirect(res, red.headers.location);
			} else {
				res.writeHead(red.statusCode);
				red.on('data', function(chunk) {
					res.write(chunk);
				});
				red.on('end', function() {
					res.end();
				});
			}
		});
	} else {
		res.writeHead(400);
		res.end();
	}
}

function denyAccess(res, message) {
	console.log(message);
	res.writeHead(406, {
		'Content-Type' : 'text/plain'
	});
	res.end(message);
}

function saveFile(req, res, filename, reqcode) {
	console.log('saving: ' + filename);
	//console.log(res);
	console.log(req.url);
	var body = '<touched>';
	if(req.method == 'POST') {
		console.log("get here");

		req.on('data', function(data) {
			body += data;
			console.log("Partial body: " + body);
		});
		req.on('end', function() {
			body += '</touched>';
			console.log('BODY :' + body);

			if(!isMongoDB(filename)) {
				fs.writeFile(filename, body, function(err) {
					res.writeHead( err ? 406 : 200);
					res.end();
				});
			} else {
				getCollection(function(collection) {
					touchedDB.update(collection, body, filename, reqcode);
					res.end();
				});
			}
		});
	}
}

function getCollection(callback) {
	var mongodb = require('mongodb');
	var server = new mongodb.Server("dbh46.mongolab.com", 27467, {});
	var db = new mongodb.Db('thetaeditor', server, {});
	var colle;
	db.open(function(error, client) {
		client.authenticate('chao', 'thetaris88', function(err, val) {
			if(error) {
				console.log(error);
			}
			colle = new mongodb.Collection(client, 'puzzle_collection');
			callback(colle);
		});
	});
}
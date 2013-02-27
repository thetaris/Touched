var http = require('http');
var fs = require('fs');
var touchedDB = require('./db.js');

// at any time we can call: touchedDB.createSoemthing

// Check port number
var settingsFile = process.argv[2];
if(!settingsFile) {
	console.log('Not settings file defined. Using  settings.default.js.');
	settingsFile = 'settings.default.js';
}
var settings = require('./' + settingsFile);
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
	if(!req.url.match('^/')) {
		res.end();
		return;
	}
	var filename = req.url.match('^/+([^?]*)')[1];
	var validCode = false;
	var reqCode = '';
	if(req.url.match(/[?&]code=/))
		reqCode = (req.url.match('[?&]code=([^&]*)') || [])[1];
	if(isMongoDB(filename)) {
		// check code from MongoDB (is true if docuemnt does not exist)
		//first to get the content needs to be stored
		getPostContent(req, function(data) {
			touchedDB.checkCollection(settings, filename, reqCode, function(valid) {
				validCode = valid;
				handleRequest(data, req, res, validCode, filename, reqCode);
			})
		});
	} else {
		validCode = (reqCode == adminCode) && files[filename];
		getPostContent(req, function(content) {
			handleRequest(content, req, res, validCode, filename, reqCode);
		});
	}
}).listen(settings.port);

function handleRequest(content, req, res, validCode, filename, reqCode) {
	// serve appropriate file
	if(req.url.match('^/(index.html)?$')) {
		res.writeHead(303, {
			'location' : '/static/start.html'
		});
		res.end();
	} else if(req.url.match('^/test/?$')) {
		res.writeHead(303, {
			'location' : '/test/index.html'
		});
		res.end();
	} else if(req.url.match(/[?&](save|edit|view|run|play)(&|$)/) || strEndsWith(req.url, "puzzle")) {
		// check security code for edit and save actions
		var mode;
		if(strEndsWith(req.url, "puzzle"))
			mode = 'run';
		else
			mode = req.url.match(/[?&]([^&]*)(&|$)/)[1];
		if(mode == 'save') {
			if(validCode)
				saveFile(content, res, filename, reqCode);
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
			if(isMongoDB(filename)) {
				denyAccess(res, 'Access denied: ' + filename);
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
		}
	} else if(req.url.match("/redirect/")) {
		var url = req.url.match("/redirect/(.*)")[1];
		redirect(res, url);
	} else if(req.url.match("/check")) {
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});
		touchedDB.checkCollection(settings, req.url.substr(1, req.url.length - 7), reqCode, function(valid) {
			if(!valid)
				res.write("filename is in use");
			else
				res.write("filename is not in use");
			res.end();
		})
	} else if(req.url.match("/getAllItems")) {
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});
		touchedDB.getAllItems(settings, function(result) {
			res.write(result);
			res.end();
		})
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
	readTouchedContent(filename, function(err, content) {
		//if err, it means there is no such a file stored on Mongolab, needs to be created
		if(err) {
			//if there is a code, insert this file in the Mongolab, if not, read the create.html and ask the user to create
			if(code) {
				// create file or insert with code
				touchedDB.insertCollection(settings, filename, code);
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
	return settings.usemongodb && name.match('m/');
}

function readTouchedContent(name, callback) {
	if(isMongoDB(name)) {
		// all mongo dependencies are here, nowhere else
		touchedDB.readContent(settings, name, function(err, content) {
			callback(err, content);
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

function getPostContent(req, callback) {
	var body = '<touched>';
	if(req.method == 'POST') {
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			body += '</touched>';
			callback(body);
		});
	} else if(req.method == 'GET') {
		callback(null);
	}
}

//save the file either to the local file or to the Mongolab
function saveFile(content, res, filename, reqcode) {
	console.log('saving: ' + filename);
	if(!isMongoDB(filename)) {
		fs.writeFile(filename, content, function(err) {
			res.writeHead( err ? 406 : 200);
			res.end();
		});
	} else {
		touchedDB.updateCollection(settings, content, filename, reqcode);
		res.end();
	}
}

function strEndsWith(str, suffix) {
	return str.match(suffix + "$") == suffix;
}
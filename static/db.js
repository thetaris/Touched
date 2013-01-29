// handle file and db access
// NOT: checking security code
// NOT: sending responses to web client (browser)
var colle;
function insert(collection, content, filename, securitycode) {
	collection.insert({
		name : filename,
		value : content,
		code : securitycode
	}, {
		safe : true
	}, function(err, objects) {
		if(err)
			console.warn(err.message);
		if(err && err.message.indexOf('E11000 ') !== -1) {
			// this _id was already inserted in the database
		}
	});
}

function update(collection, content, docname, securitycode) {
	console.log("updating");
	collection.update({
		name : docname,
		code : securitycode
	}, {
		$set : {
			value : content
		}
	}, {
		safe : true
	}, function(err) {
		if(err)
			console.warn(err.message);
		else
			console.log('successfully updated');
	});
}

function checkCode(collection, filename, code, callback) {
	// load docment and check code
	collection.find({
		name : filename
	}, function(err, cursor) {
		cursor.nextObject(function(err, obj) {
			if(obj == null)
				callback(true);
			else {
				callback(obj.code == code);
			}
		});
	});
}

function getCollection(settings,callback) {
	if(!colle) {
		console.log("create collection");
		var mongodb = require('mongodb');
		var server = new mongodb.Server(settings.mongodbserver, 27467, {});
		var db = new mongodb.Db('thetaeditor', server, {w:1});
		db.open(function(error, client) {
			client.authenticate(settings.mongodbusername, settings.mongodbpassword, function(err, val) {
				if(error) {
					console.log(error);
				}
				colle = new mongodb.Collection(client, 'puzzle_collection');
				callback(colle);
			});
		});
	} else
		callback(colle);
}

function readContent(settings,name, callback) {
	getCollection(settings, function(collection) {
		collection.find({
			name : name
		}, function(err, cursor) {
			cursor.nextObject(function(err, obj) {
				callback(obj == null, obj && obj.value);
			});
		});
	});
}

function insertCollection(settings, filename, code) {
	getCollection(settings, function(collection) {
		insert(collection, "", filename, code);
	});
}

function updateCollection(settings, content, filename, reqcode) {
	getCollection(settings,function(collection) {
		update(collection, content, filename, reqcode);
	});
}

function checkCollection(settings, filename, reqCode, callback) {
	getCollection(settings, function(collection) {
		checkCode(collection, filename, reqCode, function(valid) {
			callback(valid);
		});
	});
}

exports.checkCollection = checkCollection;
exports.insertCollection = insertCollection;
exports.updateCollection = updateCollection;
exports.readContent = readContent;

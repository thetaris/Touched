// handle file and db access
// NOT: checking security code
// NOT: sending responses to web client (browser)

function insert(collection, content, filename, securitycode) {
	//console.log("insert");
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
			else{
				//console.log(obj.code);
				callback(obj.code==code);
			}
		});
	});
}

exports.checkCode = checkCode;
exports.insert = insert;
exports.update = update;

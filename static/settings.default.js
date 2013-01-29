// Set port to which the server should be listening
exports.port = process.env.PORT || 7008;

// Set the start page that is loaded by default
exports.startpage = '/static/index.xml?run';

// Set mongo access parameters for the files /m/*
exports.usemongodb = false;
exports.mongodbserver = 'your mongodb server name';
exports.mongodbusername = 'your mongodb user name';
exports.mongodbpassword = 'your mongadb password';

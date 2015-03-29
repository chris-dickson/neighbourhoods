var mysql = require('mysql');
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
	name 	: 'mysql-connection-pool',
	create 	: function(callback) {
		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : 'admin',
			database : 'neighbourhoods'
		});
		connection.connect();
		callback(null,connection);
	},
	destroy	: function(connection) {
		connection.end();
	},
	max : 10,
	idleTimeoutMillis : 30000,
	log : false
});

var open = function(callback) {
	pool.acquire(function(err,connection) {
		if (err) throw err;
		else {
			callback(connection);
		}
	});
};

var close = function(connection) {
	pool.release(connection);
};

module.exports.open = open;
module.exports.close = close;
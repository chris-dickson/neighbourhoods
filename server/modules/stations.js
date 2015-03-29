var connectionPool = require('./db/connection');
var get = function(callback) {
	connectionPool.open(function(connection) {

		connection.query('SELECT * from stations', function(err, rows, fields) {
			callback(rows);
		});

		connectionPool.close(connection);
	});
};
module.exports.get = get;
var connectionPool = require('../db/connection');

var TABLE_NAME = 'neighbourhoods';

var getAll = function(success,error) {
	connectionPool.open(function(conn) {

		function onError(err) {
			connectionPool.close(conn);
			if (error) error(err);
		}

		function onSuccess(rows) {
			connectionPool.close(conn);
			success(rows);
		}

		conn.query('SELECT * FROM ' + TABLE_NAME +';', function(err, rows, fields) {
			onSuccess(rows);
		});
	});
};

module.exports.TABLE_NAME = TABLE_NAME;
module.exports.getAll = getAll;
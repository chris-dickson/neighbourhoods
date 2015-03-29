var connectionPool = require('./db/connection');
var db_utils = require('./db/db_utils');
var Neighbourhoods = require('./rest/neighbourhoods');

var _getTableSpecs = function() {
	var tables = [];
	var nonNull = true;
	// Image data table
	var neighbourhoods = {
		name : Neighbourhoods.TABLE_NAME,
		columns : [	db_utils.createColumnString('id','varchar(255)',nonNull),
			db_utils.createColumnString('lat','DECIMAL(10,8)',nonNull),
			db_utils.createColumnString('lon','DECIMAL(11,8)',nonNull),
			db_utils.createColumnString('name','varchar(255)',nonNull),
			db_utils.createColumnString('searchString','varchar(255)',nonNull)],
		primaryKey : 'id'
	};

	// Image data table
	var rawResponses = {
		name : 'rawresponses',
		columns : [	db_utils.createColumnString('id','varchar(255)',nonNull),
			db_utils.createColumnString('source','varchar(255)',nonNull),
			db_utils.createColumnString('destination','varchar(255)',nonNull),
			db_utils.createColumnString('response','text')],
		primaryKey : 'id'
	};

	tables.push(neighbourhoods);
	tables.push(rawResponses);

	return tables;
}

var initialize = function(success,error) {
	connectionPool.open(function(connection) {

		function onSuccess() {
			connectionPool.close(connection);
			success();
		}

		function onError(err) {
			connectionPool.close(connection);
			if (error) error(err);
		}


		var specs = _getTableSpecs();
		db_utils.createTables(connection,specs,onSuccess,onError);
	});
};


module.exports.initialize = initialize;
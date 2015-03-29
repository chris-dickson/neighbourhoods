var Process = require('./../util/process_each');

function getTableNames(conn,schema,success,error) {
	var query = 'SELECT table_name as name FROM information_schema.tables WHERE table_schema = ' + conn.escape(schema);
	conn.query(query, function(err,rows) {
		if (err) {
			if (error) error(err);
		} else {
			var names = [];
			for (var i = 0; i < rows.length; i++) {
				names.push(rows[i].name);
			}
			success(names);
		}
	});
}

function tableExists(conn,schema,tablename,success,error) {
	var query = 'SELECT COUNT(*) as count ' +
		'FROM information_schema.tables ' +
		'WHERE table_schema = ' + conn.escape(schema) + ' ' +
		'AND table_name = ' + conn.escape(tablename) + ';';
	conn.query(query, function(err,rows) {
		if (err) {
			if (error) error(err);
		} else {
			var exists = rows[0].count === 1;
			success(exists);
		}
	});
}

function createTable(conn,name,columns,pk,success,error) {
	var query = 'CREATE TABLE `' + name + '` ';
	if (columns.length > 0) {
		query +=  ' ( ';
		for (var i = 0; i < columns.length - 1; i++) {
			query += columns[i] + ', ';
		}
		query += columns[columns.length - 1];
		if (pk) {
			query += ', PRIMARY KEY (`' + pk + '`)';
		}
		query += ')';
		query += ' ENGINE=InnoDB DEFAULT CHARSET=utf8;';
	}
	conn.query(query, function(err) {
		if (err) {
			if (error) error(err);
		} else {
			success();
		}
	});
}

function conditionalCreateTable(conn,schemaname,tableSpec,success,error) {
	console.log('\tChecking if table ' + tableSpec.name + ' exists');
	tableExists(conn,schemaname,tableSpec.name,function(bExists) {
		if (!bExists) {
			console.log('Creating table ' + tableSpec.name);
			createTable(conn, tableSpec.name, tableSpec.columns, tableSpec.primaryKey, function() {
				success();
			}, function(err) {
				if (error) error(err);
			});
		} else {
			success();
		}
	}, function(err) {
		if (error) error(err);
	});
}

function createTables(conn,tableSpecs,success,error) {

	function onComplete() {
		success();
	}

	var PID = Process.each(tableSpecs,function(spec,processNext) {

		function eachSuccess() {
			processNext();
		}

		function eachError(err) {
			Process.cancel(PID);
			if (error) error(err)
		}

		conditionalCreateTable(conn,'neighbourhoods',spec,eachSuccess,eachError);
	}, onComplete);
}

function createColumnString(name, type, nn) {
	return '`' + name + '` ' + type + ' ' + (nn ? 'NOT NULL' : '');
}

exports.tableExists = tableExists;
exports.getTableNames = getTableNames;
exports.conditionalCreateTable = conditionalCreateTable;
exports.createColumnString = createColumnString;
exports.createTable = createTable;
exports.createTables = createTables;
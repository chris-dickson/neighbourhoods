var connectionPool = require('../db/connection');
var Neighbourhoods = require('./neighbourhoods');
var UUID = require('../util/uuid');

var TABLE_NAME = 'rawresponses';

var get = function(success,error) {
    connectionPool.open(function(conn) {

        function onError(err) {
            connectionPool.close(conn);
            if (error) error(err);
        }

        function onSuccess(rows) {
            connectionPool.close(conn);
            success(rows);
        }

		var NEIGHBOURHOOD_TABLE = Neighbourhoods.TABLE_NAME;

		var sql = 'SELECT t1.name as source, t2.name as destination ' +
			' FROM ' + TABLE_NAME +
			' INNER JOIN ' + NEIGHBOURHOOD_TABLE + ' as t1 on ' + TABLE_NAME + '.source = t1.id ' +
			' INNER JOIN ' + NEIGHBOURHOOD_TABLE + ' as t2 on ' + TABLE_NAME + '.destination = t2.id';

        conn.query(sql, function(err, rows, fields) {
            if (err) {
                onError(err);
            } else {
                onSuccess(rows);
            }
        });
    });
};

var add = function(source,destination,response,success,error) {
    connectionPool.open(function(conn) {
        function onError(err) {
            connectionPool.close(conn);
            if (error) error(err);
        }

        function onSuccess() {
            connectionPool.close(conn);
            success();
        }

        var id = UUID.generate();

		var responseStr = JSON.stringify(response);

		console.log('Adding: \n\tsource:' + source + '\n\tdestination:' + destination + '\n\tresponse:' + responseStr + '\n');
        var sql = 'INSERT INTO ' + TABLE_NAME + ' (id,source,destination,response) ' +
            'VALUES (' + conn.escape(id) + ',' + conn.escape(source) + ',' + conn.escape(destination) + ',' + conn.escape(responseStr) + ')';
        conn.query(sql,function(err) {
            if (err) {
                onError(err);
            } else {
                onSuccess();
            }
        })
    });
}

module.exports.TABLE_NAME = TABLE_NAME;
module.exports.get = get;
module.exports.add = add;

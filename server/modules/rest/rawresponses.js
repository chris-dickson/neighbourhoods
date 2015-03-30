var connectionPool = require('../db/connection');
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

        conn.query('SELECT * FROM ' + TABLE_NAME, function(err, rows, fields) {
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

        var sql = 'INSERT INTO ' + TABLE_NAME + ' (id,source,destination,response) ' +
            'VALUES (' + conn.escape(id) + ',' + conn.escape(source) + ',' + conn.escape(destination) + ',' + conn.escape(response) + ')';
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

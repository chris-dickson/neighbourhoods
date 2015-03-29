var config = require('../config');

var getKey = function(success,error) {
	return config.google.apiKey;
};

module.exports.getKey = getKey;
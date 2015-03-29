var Process = (function () {
	var activeAsyncProcesses = {};

	var each = function (array, iterator, onComplete) {
		var id = UUID.generate();
		activeAsyncProcesses[id] = true;

		var next = function () {
			idx++;
			if (idx < array.length && activeAsyncProcesses[id]) {
				iterator(array[idx], function () {
					next.call();
				});
			} else if (activeAsyncProcesses[id]) {
				delete activeAsyncProcesses[id];
				if (onComplete) {
					onComplete();
				}
			}
		};
		var idx = -1;
		next();

		return id;
	};

	var cancelProcess = function (id) {
		if (activeAsyncProcesses[id]) {
			delete activeAsyncProcesses[id];
		}
	};

	var cancelAllProcesses = function () {
		for (var key in activeAsyncProcesses) {
			if (activeAsyncProcesses.hasOwnProperty(key)) {
				cancelProcess(key);
			}
		}
	};

	var isActive = function (id) {
		return activeAsyncProcesses[id];
	};

	return {
		each : each,
		cancelProcess : cancelProcess,
		cancelAllProcesses : cancelAllProcesses,
		isActive : isActive
	};
})();

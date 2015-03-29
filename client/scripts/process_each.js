var Process = {
	activeAsyncProcesses : {},
	each : function (array, iterator, onComplete) {
		var id = uuid.generate();
		this.activeAsyncProcesses[id] = true;

		var next = function () {
			idx++;
			if (idx < array.length && this.activeAsyncProcesses[id]) {
				iterator(array[idx], function () {
					next.call();
				});
			} else if (this.activeAsyncProcesses[id]) {
				delete this.activeAsyncProcesses[id];
				if (onComplete) {
					onComplete();
				}
			}
		};
		var idx = -1;
		next();

		return id;
	},
	cancelProcess : function (id) {
		if (this.activeAsyncProcesses[id]) {
			delete this.activeAsyncProcesses[id];
		}
	},
	cancelAllProcesses : function () {
		for (var key in this.activeAsyncProcesses) {
			if (this.activeAsyncProcesses.hasOwnProperty(key)) {
				cancelProcess(key);
			}
		}
	},
	isActive:function(id) {
		return this.activeAsyncProcesses[id];
	}
}


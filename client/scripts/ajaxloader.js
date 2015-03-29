var AjaxLoader = (function () {
	var _element = null;
	var _progress = null;


	var show = function() {
		if (!_element) {
			_element = $('#ajax_loader');
		}
		_element.css('display','block');
	};

	var hide = function() {
		_element.hide(function() {
			_element.css('display','none');
		});
	};

	var progress = function(p) {
		if (!_progress) {
			_progress = _element.find('.progress-bar');
		}
		_progress.css('width',Math.floor(p*100) + '%');
		_progress.text(Math.floor(p*100) + '%');
	};

	return {
		show : show,
		hide : hide,
		progress : progress
	};
})();

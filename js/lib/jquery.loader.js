(function ($) {

	var Loader = function(options) {
		this.options = options;

		this.create_loader = function() {
			var obj = {};

			obj.container = $('<div>')
				.addClass(this.options.backgroundClass)
				.css('position', 'fixed')

			obj.inner = $('<div>')
				.addClass(this.options.loaderClass);

			obj.image = $('<img>')
				.attr('src', this.options.image);

			obj.inner.append(obj.image);
			obj.container.append(obj.inner);

			obj.container.hide();

			return obj;
		}

	}

	Loader.prototype.show = function(options) {
		ths = this;

		ths.elements = [];
		ths.loaders = [];

		if(options && options.elements) {
			$.each(options.elements, function() {
				if(this.length > 1) {
					$.each(this, function() {
						ths.elements.push(this);
					});
				} else {
					ths.elements.push(this);
				}
			});
		} else {
			ths.elements.push($('body'));
		}

		$.each(ths.elements, function() {
			var $this = $(this);
			var obj = ths.create_loader();

			obj.container.css('top', $this.offset().top);
			obj.container.css('left', $this.offset().left);
			obj.container.height($this.height()+px2int($this.css('border-top-width'))+px2int($this.css('border-bottom-width')));
			obj.container.width($this.width()+px2int($this.css('border-left-width'))+px2int($this.css('border-right-width')));
			obj.container.css('padding', $this.css('padding'));

			ths.loaders.push(obj.container);
			$('body').append(obj.container);
			
			obj.container.fadeIn(200, function() {
				if(options && options.after && typeof(options.after) == 'function') {
					if(ths.loaders.length >= ths.elements.length) {
						options.after();
					}
				}
			});
		});

	}

	Loader.prototype.hide = function(options) {
		ths = this;
		
		if(ths.loaders) {
			$.each(ths.loaders, function() {

				var elem = this;
				elem.fadeOut(200, function() {
					elem.remove();
					ths.loaders.shift();
					if(options && options.after && typeof(options.after) == 'function') {
						if(ths.loaders.length < 1) {
							options.after();
						}
					}
				});

			});
		}
		//var top = Math.round(elem.offset().top+(elem.height()/2)-($('#popup_'+type).height()/2))+10;
	}

	$.extend({
		loader: function (options) {

			var defaults = {
				image: 'http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/4-0.gif',
				backgroundClass: 'loader_background',
				loaderClass: 'loader_inner'
			};

			var opts = $.extend({}, defaults, options);
			
			return new Loader(opts);
		}
	});

}(jQuery));



function px2int(string) {
	return parseInt(string.replace('px', ''));
}

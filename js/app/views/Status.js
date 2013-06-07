// Filename: FeedView.js

define([
	'backbone'
], function(Backbone) {
	var FeedView = Backbone.View.extend({
		el: $("[role=status] > p"),
		
		initialize: function() {
			this.message = "";
		},
		
		setMessage: function(msg) {
			this.message = msg;
			
			// Wait the end of the previous message
			var view = this;
			var timer = setInterval(function() {
				if(!$.localStorage("status")) {
					view.render();
					clearInterval(timer);
				}
			}, 1000);
		},
		
		render: function() {
			$.localStorage("status", true);
			
			// Change the content
			this.$el.html(this.message);
			$("[role=status]").show();
			
			// Hide the status
			setTimeout(function() {
				$("[role=status]").hide();
				$.localStorage("status", false);
			}, 3*1000);
		}
	});
	
	return FeedView;
});

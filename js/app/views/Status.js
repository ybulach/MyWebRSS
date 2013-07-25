// Filename: FeedView.js

define([
	'backbone'
], function(Backbone) {
	var FeedView = Backbone.View.extend({
		el: $("[role=status] > p"),
		message: "",
		
		setMessage: function(msg) {
			this.message = msg;
			
			// Wait the end of the previous message
			var view = this;
			var timer = setInterval(function() {
				if(!$.localStorage("status")) {
					view.render();
					clearInterval(timer);
				}
			}, 100);
		},
		
		render: function() {
			$.localStorage("status", true);
			
			// Change the content
			this.$el.html(this.message);
			$("[role=status]").show();
			
			// Hide the status, the time depends on his size
			var time = (this.message.length / 10);
			setTimeout(function() {
				$("[role=status]").hide();
				setTimeout(function() {
					$.localStorage("status", false);
				}, 500);
			}, time*1000);
		}
	});
	
	return FeedView;
});

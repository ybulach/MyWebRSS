// Filename: StatusView.js

define([
	'backbone'
], function(Backbone) {
	var StatusView = Backbone.View.extend({
		el: $("[role=status] > p"),
		message: "",
		
		setMessage: function(msg) {
			this.message = msg;
			
			// Show the message in the console
			console.log(this.message);
			
			// Wait the end of the previous message
			var view = this;
			var timer = setInterval(function() {
				if(!window.statusShown) {
					view.render();
					clearInterval(timer);
				}
			}, 100);
		},
		
		render: function() {
			window.statusShown = true;
			
			// Change the content
			this.$el.html(this.message);
			$("[role=status]").show();
			
			// Hide the status, the time depends on his size
			var time = (this.message.length / 10);
			setTimeout(function() {
				$("[role=status]").hide();
				setTimeout(function() {
					window.statusShown = false;
				}, 500);
			}, time*1000);
		}
	});
	
	return StatusView;
});

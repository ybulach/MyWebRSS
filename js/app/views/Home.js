// Filename: HomeView.js

define([
	'backbone', 'text!templates/Home.html'
], function(Backbone, HomeTemplate) {
	var HomeView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = HomeTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-menu").show();
			$("#button-refresh").show();
		},
		
		render: function(){
			$("#page-title").html("Home");
			this.$el.html(this.template);
			
			$("#button-refresh").click(function() { alert("test"); });
		}
	});
	
	return HomeView;
});

// Filename: APIView.js

define([
	'backbone', 'views/Status', 'text!templates/API.html'
], function(Backbone, StatusView, APITemplate) {
	var APIView = Backbone.View.extend({
		el: $("#page"),
		api: null,
		
		initialize: function() {
			// Show the buttons
			$("#button-back").show();
			
			// Go back to the settings
			$("#button-back").click(function() {
				window.location = "#settings";
			});
		},
		
		render: function(){
			if(!this.api)
				return;
			
			var view = this;
			
			$("#page-title").html(this.api.attributes.name);
			this.$el.html(_.template(APITemplate, {api: this.api.toJSON()}));
			
			// Login to the API
			$("#api-login").click(function(event) {
				event.preventDefault();
				
				$("#api-login").attr("disabled", "disabled");
				
				// Handle the type of authentication
				if(view.api.attributes.authentication == "persona")
					navigator.id.request();
				else
					$("#api-login").removeAttr("disabled");
			});
			
			// Logout of the API
			$("#api-logout").click(function() {
				if(!view.api.attributes.loggedIn)
					return;
				
				$("#api-logout").attr("disabled", "disabled");
				
				// Handle the type of authentication
				if(view.api.attributes.authentication == "persona")
					navigator.id.logout();
				else
					$("#api-logout").removeAttr("disabled");
			});
			
			// Delete the API
			$("#api-delete").click(function() {
				if(confirm("Are you sure you want to delete this API ?")) {
					$("#api-logout").click();
					window.apis.get(view.api).destroy();
					window.apis.save();
					$("#menu-refresh").click();
					window.location = "#settings";
				}
			});
		},
		
		loadAPI: function(id) {
			if(id >= window.apis.length)
				return $("#button-back").click();
			
			this.api = window.apis.at(id);
			this.render();
		}
	});
	
	return APIView;
});

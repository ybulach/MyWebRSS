// Filename: AddFeedView.js

define([
	'backbone', 'text!templates/AddFeed.html'
], function(Backbone, AddFeedTemplate) {
	var AddFeedView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// Redirect to login page if we are not connected
			if(!$.localStorage("token")) {
				alert("You are not connected. Redirecting to Login page.");
				window.location = "#login";
			}
			
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Add Feed");
			this.$el.html(AddFeedTemplate);
			
			$("#addfeed-submit").click(function() {
				var view = this;
				$.getJSON(window.mywebrss + "/feed/add", {token: $.localStorage("token"), feed: $("#addfeed-url").val()}, function(data) {
					// Check error
					if(!data.success) {
						// Wrong token
						if(data.error == "token") {
							$.localStorage("token", null);
							window.location = "#login";
						}
						else if(data.error == "feed")
							alert("Wrong feed URL");
						// Unknown error
						else
							alert(data.error);
						
						return;
					}
					
					// Delete datas we don't need
					delete data.success, delete data.error;
					
					// Force feeds list reload
					$("#menu-refresh").click();
					
					// Redirect to Home
					window.location = "./";
				});
			});
		}
	});
	
	return AddFeedView;
});

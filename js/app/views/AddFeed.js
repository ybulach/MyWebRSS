// Filename: AddFeedView.js

define([
	'backbone', 'views/Status', 'text!templates/AddFeed.html'
], function(Backbone, StatusView, AddFeedTemplate) {
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
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/feed/add",
					data: {token: $.localStorage("token"), feed: $("#addfeed-url").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							else if(data.error == "feed")
								status.setMessage("Wrong feed URL");
							// Unknown error
							else
								status.setMessage(data.error);
							
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Force feeds list reload
						$("#menu-refresh").click();
						
						// Redirect to Home
						window.location = "index.html";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
					}
				});
			});
		}
	});
	
	return AddFeedView;
});

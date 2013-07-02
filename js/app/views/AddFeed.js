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
			
			// Add a feed with an URL
			$("#addfeed-submit").click(function() {
				$("#addfeed-submit").attr("disabled", "disabled");
				
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
							
							$("#addfeed-submit").removeAttr("disabled");
							return;
						}
						
						// Delete datas we don't need
						delete data.success, delete data.error;
						
						// Redirect to Home
						window.location = "#feed/" + data.id;
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						
						$("#addfeed-submit").removeAttr("disabled");
					}
				});
			});
			
			// Import an OPML file
			$("#import-submit").click(function() {
				var file = document.getElementById("import-file").files[0];
				if(!file) {
					var status = new StatusView();
					status.setMessage("No file selected");
					
					return;
				}
				
				var reader = new FileReader();
				reader.readAsText(file, 'UTF-8');
				reader.onload = function(event) {
					if(!event.target.result) {
						var status = new StatusView();
						status.setMessage("The selected file is empty");
						
						return;
					}
					
					$("#import-submit").attr("disabled", "disabled");
					
					$.ajax({
						dataType: "json",
						type: "post",
						url: window.mywebrss + "/feed/import",
						data: {token: $.localStorage("token"), file: event.target.result},
						success: function(data) {
							var status = new StatusView();
							
							// Check error
							if(!data.success) {
								// Wrong token
								if(data.error == "token") {
									$.localStorage("token", null);
									window.location = "#login";
								}
								else if(data.error == "file")
									status.setMessage("The file uploaded is not an OPML file");
								// Unknown error
								else
									status.setMessage(data.error);
								
								$("#import-submit").removeAttr("disabled");
								return;
							}
							
							// Delete datas we don't need
							delete data.success, delete data.error;
							
							status.setMessage(data.percentage + "% of feeds loaded from OPML file");
							
							// Redirect to Home
							window.location = "#";
						},
						error: function() {
							var status = new StatusView();
							status.setMessage("Can't contact the server");
							
							$("#import-submit").removeAttr("disabled");
						}
					});
				};
				reader.onerror = function() {
					var status = new StatusView();
					status.setMessage("Can't read the file");
				};
			});
		}
	});
	
	return AddFeedView;
});

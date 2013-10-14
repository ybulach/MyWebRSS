// Filename: AddFeedView.js

define([
	'backbone', 'views/Status', 'text!templates/AddFeed.html'
], function(Backbone, StatusView, AddFeedTemplate) {
	var AddFeedView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			// At least one API is needed
			if(!window.apis.length) {
				(new StatusView()).setMessage("There is no API to add a feed in. Please add a new API first");
				window.location = "#settings";
			}
			
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Add Feed");
			this.$el.html(_.template(AddFeedTemplate, {apis: window.apis.toJSON()}));
			
			// Search for a feed
			$("#addfeed-search").change(function() {
				if($("#addfeed-search").val()) {
					$("#addfeed-result").html("Loading");
					
					// Search through Google Feed API
					google.feeds.findFeeds($("#addfeed-search").val(), function(result) {
						if($("#addfeed-search").val()) {
							if(!result.error) {
								var results = "";
								for (var i = 0; i < result.entries.length; i++)
									results += "<li><a href='" + result.entries[i].url + "'><dl><dt>" + result.entries[i].title + "</dt><dd>" + result.entries[i].url + "</dd></dl></a></li>";
								$("#addfeed-result").html(results);
								
								$("#addfeed-result li a").click(function (event) {
									event.preventDefault();
									
									// Clear the results
									$("#addfeed-result").html("");
									$("#addfeed-url").val(this);
									//$("#addfeed-submit").click();
								});
							} else {
								$("#addfeed-result").html("An error occured. Try again later.");
							}
						}
					});
				}
				else
					$("#addfeed-result").html("");
			});
			
			$("#addfeed-clear").click(function(event) {
				event.preventDefault();
				
				// Clear the results
				$("#addfeed-search").val("");
				$("#addfeed-search").change();
			});
			
			$("#addfeed-submit-search").click(function(event) {
				event.preventDefault();
				$("#addfeed-submit-search").focus();
				
				// Force a new search
				$("#addfeed-search").change();
			});
			
			// Add a feed with an URL
			$("#addfeed-submit").click(function(event) {
				event.preventDefault();
				
				var api = parseInt($("#addfeed-api").val());
				if(api < window.apis.length) {
					$("#addfeed-submit").attr("disabled", "disabled");
					
					window.apis.at(api).feed_add($("#addfeed-url").val(), function(success, id) {
						$("#addfeed-submit").removeAttr("disabled");
						
						if(success)
							window.location = "#feed/" + api + "/" + id;
					});
				}
			});
			
			// Import an OPML file
			/*$("#import-submit").click(function() {
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
			});*/
		}
	});
	
	return AddFeedView;
});

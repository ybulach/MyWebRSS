// Filename: MenuView.js

define([
	'backbone', 'views/Status', 'models/Feed', 'collections/Feeds', 'text!templates/Menu.html'
], function(Backbone, StatusView, FeedModel, FeedsCollection, MenuTemplate) {
	// Handle the menu animation
	function flush_menu() {
		if ($("[role=region]").attr("data-state") == "drawer" ) {
			$("[role=region]").attr("data-state", "none");
		} else {
			$("[role=region]").attr("data-state", "drawer");
		}
	}
	
	var MenuView = Backbone.View.extend({
		el: $("#menu-feeds"),
		
		initialize: function() {
			if($.localStorage("token")) {
				this.template = MenuTemplate;
				
				// Show or hide the menu
				$("#button-menu").click(function() {
					flush_menu();
				});
				
				$("[role='main']").click(function(event) {
					if($("[role=region]").attr("data-state") == "drawer") {
						event.preventDefault();
						$("[role=region]").attr("data-state", "none");
					}
				});
				
				// Refresh the list of feeds
				var view = this;
				$("#menu-refresh").click(function() {
					view.refresh_feeds();
				});
				
				// Get the content of the menu (list of the feeds) and display it
				this.refresh_feeds();
			}
			else
				$("nav").html("");
		},
		
		render: function() {
			var content = "<li>Loading</li>";
			
			// Display the feeds list
			if(this.collection)
				content = _.template(this.template, {feeds: this.collection.toJSON()});
			this.$el.html(content);
			
			$("#menu-refresh").attr("data-state", "none");
			$("#menu-refresh").removeAttr("disabled", "");
			
			// Display the total of unread articles
			if(this.unread_total > 0) {
				$("a[href='#'] > .indicator").html(this.unread_total);
				$("a[href='#'] > .indicator").show();
			}
			
			// Hide the menu
			$("nav > div.inner > ul > li > a").click(function() {
				$("[role=region]").attr("data-state", "none");
			});
			
			$("nav > header > menu > a").click(function() {
				$("[role=region]").attr("data-state", "none");
			});
		},
		
		setCollection: function(feeds) {
			if(typeof(feeds) != "object")
				return;
			
			delete this.collection;
			this.collection = feeds;
			this.render();
		},
		
		refresh_feeds: function() {
			if(!$.localStorage("token"))
				return;
			
			$("a[href='#'] > .indicator").html("0");
			$("#menu-refresh").attr("data-state", "refreshing");
			$("#menu-refresh").attr("disabled", "disabled");
			
			// Get the list of feeds
			var view = this;
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/list",
				data: {token: $.localStorage("token")},
				success: function(data) {
					// Check error
					if(!data.success) {
						var status = new StatusView();
						
						// Wrong token
						if(data.error == "token") {
							$.localStorage("token", null);
							window.location = "#login";
						}
						// Unknown error
						else
							status.setMessage(data.error);
						
						return;
					}
					
					// Delete datas we don't need
					delete data.success, delete data.error;
					
					// Create a new FeedsCollection
					var collection = new FeedsCollection();
					
					view.unread_total = 0;
					$(data.result).each(function(id, feed) {
						view.unread_total += parseInt(feed.unread);
						collection.add(new FeedModel(feed));
					});
					
					view.setCollection(collection);
				},
				error: function() {
					var status = new StatusView();
					status.setMessage("Can't contact the server");
					view.render();
				}
			});
		}
	});
	
	return MenuView;
});

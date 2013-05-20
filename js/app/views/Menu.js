// Filename: MenuView.js

define([
	'backbone', 'models/Feed', 'collections/Feeds', 'text!templates/Menu.html'
], function(Backbone, FeedModel, FeedsCollection, MenuTemplate) {
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
		},
		
		render: function() {
			var content = "<li>Loading</li>";
			
			// Display the feeds list
			if(this.collection)
				content = _.template(this.template, {feeds: this.collection.toJSON()});
			this.$el.html(content);
			
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
			
			// Get the list of feeds
			var view = this;
			$.getJSON(window.mywebrss + "/feed/list", {token: $.localStorage("token")}, function(data) {
				// Check error
				if(!data.success) {
					// Wrong token
					if(data.error == "token") {
						$.localStorage("token", null);
						window.location = "#login";
					}
					// Unknown error
					else
						alert(data.error);
					
					return;
				}
				
				// Delete datas we don't need
				delete data.success, delete data.error;
				
				// Create a new FeedsCollection
				var collection = new FeedsCollection();
				
				$(data.result).each(function(id, feed) {
					collection.add(new FeedModel(feed));
				});
				
				view.setCollection(collection);
			});
		}
	});
	
	return MenuView;
});

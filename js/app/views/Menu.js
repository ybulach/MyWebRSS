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
		collection: new FeedsCollection(),
		
		initialize: function() {
			this.template = MenuTemplate;
			
			// Show the button
			$("#menu-refresh").show();
			
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
			
			if($.localStorage("email"))
				$("nav > header > h1").html($.localStorage("email"));
			
			this.refresh_feeds();
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
			if(this.collection.unread_total > 0) {
				$("a[href='#'] > .indicator").html(this.collection.unread_total);
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
		
		refresh_feeds: function() {
			if(!$.localStorage("token"))
				return;
			
			$("a[href='#'] > .indicator").html("0");
			$("#menu-refresh").attr("data-state", "refreshing");
			$("#menu-refresh").attr("disabled", "disabled");
			
			var view = this;
			this.collection.refresh(function(result) {
				if(!result.success) {
					var status = new StatusView();
					
					// Wrong token
					if(result.error == "token") {
						$.localStorage("token", null);
						window.location = "#login";
					}
					// Server error
					else if(result.error == "server")
						status.setMessage("Can't contact the server. Try again later");
					// Unknown error
					else
						status.setMessage(result.error);
				}
				
				view.render();
			});
		}
	});
	
	return MenuView;
});

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
			this.template = MenuTemplate;
			this.lastrefresh = 0;
			
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
				var refresh = parseInt(new Date().getTime() / 1000);
				
				// Only allow one refresh per second
				if(refresh > view.lastrefresh) {
					$("a[href='#'] > .indicator").html("0");
					$("#menu-refresh").attr("data-state", "refreshing");
					$("#menu-refresh").attr("disabled", "disabled");
					
					// Refresh the current page
					$("#button-refresh").click();
					
					view.refresh();
				}
			});
			
			$("#menu-refresh").click();
			this.autorefresh();
		},
		
		render: function(content, unread_total) {
			$("#menu-refresh").attr("data-state", "none");
			$("#menu-refresh").removeAttr("disabled", "");
			
			this.$el.html(content);
			
			// Display the total of unread articles
			if(unread_total && (unread_total > 0)) {
				$("a[href='#'] > .indicator").html(unread_total);
				$("a[href='#'] > .indicator").show();
				document.title = "(" + unread_total + ") MyWebRSS";
			}
			else
				document.title = "MyWebRSS";
			
			// Hide the menu
			$("nav > div.inner ul > li > a").click(function() {
				$("[role=region]").attr("data-state", "none");
			});
			
			$("nav > header > menu > a").click(function() {
				$("[role=region]").attr("data-state", "none");
			});
		},
		
		autorefresh: function() {
			if($.localStorage("autorefresh")) {
				var view = this;
				var refresh = setTimeout(function() {
					$("#menu-refresh").click();
					view.autorefresh();
				}, window.refresh_interval*1000);
				
				window.autorefresh_cnt = refresh;
			}
		},
		
		// Refresh each API
		refresh: function(api_id, content, unread_total) {
			this.lastrefresh = parseInt(new Date().getTime() / 1000);
			
			if(!api_id)
				var api_id = 0;
			
			if(!content)
				var content = "";
			
			if(!unread_total)
				var unread_total = 0;
			
			// No API added
			if(!window.apis.length)
				return this.render(_.template(this.template, {}), 0);
			
			// Render
			if(!window.apis.length || (api_id >= window.apis.length))
				return this.render(content, unread_total);
			
			// Get the list of feeds
			var view = this;
			var api = window.apis.at(api_id);
			api.feed_list(function(success, feeds) {
				content += _.template(view.template, {success: success, api: api.toJSON(), api_id: api_id, feeds: feeds.toJSON()});
				unread_total += feeds.unread_total;
				
				// Refresh the next feed
				view.refresh(++api_id, content, unread_total);
			});
		}
	});
	
	return MenuView;
});

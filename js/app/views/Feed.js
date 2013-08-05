// Filename: FeedView.js

define([
	'backbone', 'views/Status', 'text!templates/Feed.html', 'collections/Articles', 'views/Article'
], function(Backbone, StatusView, FeedTemplate, ArticlesCollection, ArticleView) {
	var FeedView = Backbone.View.extend({
		el: $("#page"),
		collection: new ArticlesCollection(),
		
		initialize: function() {
			this.template = FeedTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-menu").show();
			$("#button-refresh").show();
			$("#button-mark").show();
			
			// Refresh the list of articles
			var view = this;
			$("#button-refresh").click(function() {
				view.collection.page = 0;
				view.refresh_articles();
			});
			
			$("#button-more").click(function() {
				view.collection.page++;
				$("#button-more").attr("disabled", "disabled");
				view.refresh_articles();
				$("#button-more").removeAttr("disabled");
			});
			
			// Mark as read
			$("#button-mark").click(function() {
				$("#page-title").html("Loading");
				$("#button-mark").hide();
				
				// Get the articles of the current feed
				view.collection.each(function(article, i) {
					article.unread(function(result) {
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
							else if(result.error != "status")
								status.setMessage(result.error);
						}
						
						// For the last article, we refresh if we changed articles
						if(i == view.collection.length-1)
							view.refresh_articles();
					});
				});
			});
			
			// Delete the feed
			$("#button-delete").click(function() {
				if(confirm("Are you sure you want to delete this feed ?")) {
					$("#page-title").html("Deleting");
					$("#button-delete").hide();
					
					view.collection.delete(function(result) {
						if(!result.success) {
							var status = new StatusView();
							
							// Wrong token
							if(result.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							// Wrong feed
							else if(result.error == "feed")
								window.location = "index.html";
							// Server error
							else if(result.error == "server")
								status.setMessage("Can't contact the server. Try again later");
							// Unknown error
							else
								status.setMessage(result.error);
							
							view.render();
						}
						// Go to home
						else
							window.location = "index.html";
					});
				}
			});
		},
		
		autorefresh: function() {
			if((this.collection.feed || (this.collection.feed === 0)) && $.localStorage("autorefresh")) {
				var view = this;
				var refresh = setTimeout(function() {
					view.collection.page = 0;
					view.refresh_articles();
					view.autorefresh();
				}, window.refresh_interval*1000);
				
				$.localStorage("autorefresh_cnt", refresh);
			}
		},
		
		render: function() {
			// Change the content
			if(this.collection.feed_name)
				$("#page-title").html(this.collection.feed_name);
			else if(this.collection.feed === 0)
				$("#page-title").html($("#home").html());
			else
				$("#page-title").html("Loading");
			
			// Show the buttons
			$("#button-refresh").attr("data-state", "none");
			$("#button-refresh").removeAttr("disabled", "");
			$("#button-mark").show();
			
			// Show the More button if we have loaded new articles
			if(this.collection.length && $.localStorage("articles_per_page") && (this.collection.length % $.localStorage("articles_per_page")) == 0)
				$("#button-more").show();
			else
				$("#button-more").hide();
			
			// Show the content
			var content = "<ul class='list'><li><dl><dt>Loading</dt></dl></li></ul>";
			if(this.collection)
				content = _.template(this.template, {articles: this.collection.toJSON()});
			
			if(this.collection && !this.collection.length) {
				if(this.collection.feed === 0)
					content = "<ul class='list'><li><dl><dt>No unread articles</dt></dl></li></ul>";
				else
					content = "<ul class='list'><li><dl><dt>No article in this feed</dt></dl></li></ul>";
			}
			
			this.$el.html(content);
			
			// Save feed infos for later
			var view = this;
			$("#page a").click(function(event) {
				// Auto-refresh
				if($.localStorage("autorefresh_cnt"))
					clearTimeout($.localStorage("autorefresh_cnt")), $.localStorage("autorefresh_cnt", 0);
			});
		},
		
		loadFeed: function(id) {
			if(id)
				$("#button-delete").show();
			
			this.collection.feed = id;
			this.collection.page = 0;
			
			// Only refresh if we are on an other feed (the back button on an article hasn't been clicked)
			if($.localStorage("feed") != id)
				this.refresh_articles();
			else {
				this.collection.reset($.localStorage("collection"));
				this.render();
			}
			
			// Save datas
			$.localStorage("feed", this.collection.feed);
			
			// Auto-refresh
			if(!$.localStorage("autorefresh_cnt"))
				this.autorefresh();
		},
		
		refresh_articles: function() {
			$("#page-title").html("Loading");
			$("#button-refresh").attr("data-state", "refreshing");
			$("#button-refresh").attr("disabled", "disabled");
			$("#button-more").hide();
			
			// Indicate the loading state if we want the first page
			if(this.collection.page === 0)
				this.$el.html("<ul class='list'><li><dl><dt>Loading</dt></dl></li></ul>");
			
			var view = this;
			this.collection.refresh(function(result) {
				if(!result.success) {
					var status = new StatusView();
					
					// Wrong token
					if(result.error == "token") {
						$.localStorage("token", null);
						window.location = "#login";
					}
					// Wrong feed
					else if(result.error == "feed")
						window.location = "index.html";
					// Server error
					else if(result.error == "server")
						status.setMessage("Can't contact the server. Try again later");
					// Unknown error
					else
						status.setMessage(result.error);
				}
				
				// Save datas
				$.localStorage("collection", view.collection);
				
				view.render();
			});
			
			// Refresh menu
			$("#menu-refresh").click();
		}
	});
	
	return FeedView;
});

// Filename: FeedView.js

define([
	'backbone', 'views/Status', 'text!templates/Feed.html', 'collections/Articles', 'views/Article'
], function(Backbone, StatusView, FeedTemplate, ArticlesCollection, ArticleView) {
	var FeedView = Backbone.View.extend({
		el: $("#page"),
		page: 0,
		api: null,
		feed: null,
		
		initialize: function() {
			this.template = FeedTemplate;
			
			// Show the buttons
			$("#button-menu").show();
			$("#button-refresh").show();
			$("#button-mark").show();
			$("#button-more").show();
			
			// Refresh the list of articles
			var view = this;
			$("#button-refresh").click(function() {
				$("#page-title").html("Loading");
				$("#button-refresh").attr("data-state", "refreshing");
				$("#button-refresh").attr("disabled", "disabled");
				
				view.page = 0;
				view.refresh_articles();
				
				// Refresh menu
				$("#menu-refresh").click();
			});
			
			$("#button-more").click(function() {
				view.page++;
				$("#button-more").attr("disabled", "disabled");
				view.refresh_articles();
			});
			
			// Mark as read
			$("#button-mark").click(function() {
				// Get the articles of the current feed
				window.articles.each(function(article) {
					if(article.attributes.status == "new") {
						$("#page-title").html("Loading");
						$("#button-mark").hide();
						
						window.apis.at(article.attributes.api).article_unread(article.id, function(success) {
							if(success) {
								window.articles.get(article.id).attributes.status = "";
								view.render();
							}
						});
					}
				});
			});
			
			// Delete the feed
			$("#button-delete").click(function() {
				if(view.api) {
					if(confirm("Are you sure you want to delete this feed ?")) {
						$("#page-title").html("Deleting");
						$("#button-delete").hide();
						
						if(view.api >= window.apis.length)
							return;
						
						window.apis.at(view.api).feed_delete(view.feed, function(success) {
							if(success)
								window.location = "#";
							else
								view.render();
						});
					}
				}
			});
		},
		
		render: function() {
			// Change the content
			if(this.feed === 0)
				$("#page-title").html($("#home").html());
			else if($.localStorage("feed_name"))
				$("#page-title").html($.localStorage("feed_name"));
			else
				$("#page-title").html("");
			
			// Show the buttons
			$("#button-refresh").attr("data-state", "none");
			$("#button-refresh").removeAttr("disabled", "");
			$("#button-mark").show();

			// Show the content
			var content = _.template(this.template, {feed: this.feed, articles: window.articles.toJSON()});
			
			if(window.apis.length === 0)
				content = "<ul class='list'><li data-state='new'><a href='#settings'><dl><dt>No API added yet.</dt><dd>Go to Settings to add one !</dd></dl></a></li></ul>";
			else if(window.articles && !window.articles.length) {
				if(this.feed === 0)
					content = "<ul class='list'><li><dl><dt>No unread articles</dt></dl></li></ul>";
				else
					content = "<ul class='list'><li><dl><dt>No article in this feed</dt></dl></li></ul>";
			}
			
			this.$el.html(content);
		},
		
		loadFeed: function(api, id) {
			if(id)
				$("#button-delete").show();
			
			this.api = api;
			this.feed = id;
			this.page = 0;
			
			// Only refresh if we are on an other feed (the back button on an article hasn't been clicked)
			if($.localStorage("feed") != id)
				this.refresh_articles();
			
			// Save datas
			$.localStorage("feed", this.feed);
		},
		
		refresh_articles: function() {
			// Indicate the loading state if we want the first page
			if(this.page === 0)
				this.$el.html("<ul class='list'><li><dl><dt>Loading</dt></dl></li></ul>");
			
			var view = this;
			
			// Refresh one feed
			if(this.api) {
				if(this.api >= window.apis.length) {
					window.location = "#";
					return;
				}
				
				window.apis.at(this.api).article_list(this.feed, this.page, function(success, articles, feed_name) {
					if(success) {
						if(view.page === 0) {
							$.localStorage("feed_name", feed_name);
							window.articles.reset(articles.toJSON());
						}
						else
							window.articles.add(articles.toJSON());
						
						// Show the More button if we have loaded new articles
						if(articles.length && window.articles_per_page && (articles.length % window.articles_per_page) == 0) {
							$("#button-more").show();
							$("#button-more").removeAttr("disabled");
						}
						else
							$("#button-more").hide();
					}
					else if(!window.apis.at(view.api).attributes.loggedIn)
						window.location = "#";
					
					window.articles.save();
					view.render();
				});
			}
			// Refresh all the feeds
			else if(this.feed === 0) {
				$.localStorage("feed_name", $("#home").html());
				this.refresh_all();
			}
			else {
				window.location = "#";
				return;
			}
		},
		
		refresh_all: function(api_id) {
			if(!api_id) {
				var api_id = 0;
				
				if(this.page === 0)
					window.articles.reset();
			}
			
			// Render
			if(api_id >= window.apis.length) {
				window.articles.save();
				this.render();
				return;
			}
			
			// Get the list of feeds
			var view = this;
			
			if(!window.apis.at(api_id).attributes.loggedIn) {
				// Refresh the next feed
				view.refresh_all(++api_id);
			}
			else {
				window.apis.at(api_id).article_list(this.feed, this.page, function(success, articles, feed_name) {
					if(success) {
						window.articles.add(articles.toJSON());
						
						// Show the More button if we have loaded new articles
						if(articles.length && window.articles_per_page && (articles.length % window.articles_per_page) == 0) {
							$("#button-more").show();
							$("#button-more").removeAttr("disabled");
						}
						else
							$("#button-more").hide();
					}
					
					// Refresh the next feed
					view.refresh_all(++api_id);
				});
			}
		}
	});
	
	return FeedView;
});

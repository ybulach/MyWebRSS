// Filename: FeedView.js

define([
	'backbone', 'views/Status', 'text!templates/Feed.html', 'collections/Articles', 'models/Article', 'views/Article'
], function(Backbone, StatusView, FeedTemplate, ArticlesCollection, ArticleModel, ArticleView) {
	var FeedView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = FeedTemplate;
			this.page = 0;
			this.collection = new ArticlesCollection();
			
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
				view.page = 0;
				view.refresh_articles();
			});
			
			$("#button-more").click(function() {
				view.page++;
				$("#button-more").attr("disabled", "disabled");
				view.refresh_articles();
				$("#button-more").removeAttr("disabled");
			});
			
			// Mark as read
			$("#button-mark").click(function() {
				$("#page-title").html("Loading");
				$("#button-mark").hide();
				
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/feed/unread",
					data: {token: $.localStorage("token"), feed: view.feed},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							// Wrong feed
							else if(data.error == "feed")
								window.location = "index.html";
							// Unknown error
							else
								status.setMessage(data.error);
							
							return;
						}
						
						// Refresh
						view.page = 0;
						view.refresh_articles();
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						view.render();
					}
				});
			});
			
			// Delete the feed
			$("#button-delete").click(function() {
				if(confirm("Are you sure you want to delete this feed ?")) {
					$("#page-title").html("Deleting");
					$("#button-delete").hide();
					
					$.ajax({
						dataType: "json",
						url: window.mywebrss + "/feed/delete",
						data: {token: $.localStorage("token"), feed: view.feed},
						success: function(data) {
							// Check error
							if(!data.success) {
								var status = new StatusView();
								
								// Wrong token
								if(data.error == "token") {
									$.localStorage("token", null);
									window.location = "#login";
								}
								// Wrong feed
								else if(data.error == "feed")
									window.location = "index.html";
								// Unknown error
								else
									status.setMessage(data.error);
								
								return;
							}
							
							// Go to home
							window.location = "index.html";
						},
						error: function() {
							var status = new StatusView();
							status.setMessage("Can't contact the server");
							view.render();
						}
					});
				}
			});
		},
		
		setCollection: function(articles) {
			if(typeof(articles) != "object")
				return;
			
			if(this.collection && (this.page > 0))
				this.collection.add(articles.toJSON());
			else
				this.collection = articles;
			
			this.render();
			
			// Auto-refresh
			if(!$.localStorage("autorefresh_cnt"))
				this.autorefresh();
		},
		
		autorefresh: function() {
			if((this.feed || (this.feed === 0)) && $.localStorage("autorefresh")) {
				var view = this;
				var refresh = setTimeout(function() {
					view.page = 0;
					view.refresh_articles();
					view.autorefresh();
				}, window.refresh_interval*1000);
				
				$.localStorage("autorefresh_cnt", refresh);
			}
		},
		
		render: function() {
			// Change the content
			if(this.feed_name)
				$("#page-title").html(this.feed_name);
			else if(this.feed === 0)
				$("#page-title").html($("#home").html());
			else
				$("#page-title").html("Loading");
			
			// Show the buttons
			$("#button-refresh").show();
			$("#button-mark").show();
			
			// Show the content
			var content = "<ul class='list'><li><dl><dt>Loading</dt></dl></li></ul>";
			if(this.collection)
				content = _.template(this.template, {articles: this.collection.toJSON()});
			
			if(this.collection && !this.collection.length) {
				if(this.feed === 0)
					content = "<ul class='list'><li><dl><dt>No unread articles</dt></dl></li></ul>";
				else
					content = "<ul class='list'><li><dl><dt>No article in this feed</dt></dl></li></ul>";
			}
			
			this.$el.html(content);
			
			// Save feed infos for later
			var view = this;
			$("#page a").click(function(event) {
				// Save datas
				$.localStorage("feed", view.feed);
				$.localStorage("collection", view.collection);
				
				// Auto-refresh
				if($.localStorage("autorefresh_cnt"))
					clearTimeout($.localStorage("autorefresh_cnt")), $.localStorage("autorefresh_cnt", 0);
			});
		},
		
		loadFeed: function(id) {
			this.feed = id;
			if(id)
				$("#button-delete").show();
			this.page = 0;
			this.refresh_articles();
		},
		
		refresh_articles: function() {
			if(!$.localStorage("token"))
				return;
			
			$("#page-title").html("Loading");
			this.$el.html("<ul class='list'><li><dl><dt>Loading</dt></dl></li></ul>");
			$("#button-refresh").hide();
			
			// Get the list of articles
			var view = this;
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/show",
				data: {token: $.localStorage("token"), feed: view.feed, articles_count: $.localStorage("articles_per_page"), page: view.page},
				success: function(data) {
					// Check error
					if(!data.success) {
						var status = new StatusView();
						
						// Wrong token
						if(data.error == "token") {
							$.localStorage("token", null);
							window.location = "#login";
						}
						// Wrong feed
						else if(data.error == "feed")
							window.location = "index.html";
						// Unknown error
						else
							status.setMessage(data.error);
						
						return;
					}
					
					// Delete datas we don't need
					delete data.success, delete data.error;
					
					// Get the feed name if given
					if(data.feed)
						view.feed_name = data.feed;
					
					// Create a new ArticlesCollection
					var collection = new ArticlesCollection();
					$(data.result).each(function(id, article) {
						collection.add(new ArticleModel(article));
					});
					
					view.setCollection(collection);
					
					// Show the More button if we have loaded new articles
					if(data.result.length == $.localStorage("articles_per_page"))
						$("#button-more").show();
					else
						$("#button-more").hide();
				},
				error: function() {
					var status = new StatusView();
					status.setMessage("Can't contact the server");
					view.render();
				}
			});
			
			// Refresh menu
			$("#menu-refresh").click();
		}
	});
	
	return FeedView;
});

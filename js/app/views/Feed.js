// Filename: FeedView.js

define([
	'backbone', 'text!templates/Feed.html', 'collections/Articles', 'models/Article', 'views/Article'
], function(Backbone, FeedTemplate, ArticlesCollection, ArticleModel, ArticleView) {
	var FeedView = Backbone.View.extend({
		el: $("#page"),
		
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
				view.refresh_articles();
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
								alert(data.error);
							
							return;
						}
						
						// Refresh
						view.refresh_articles();
					},
					error: function() {
						alert("Can't contact the server");
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
									alert(data.error);
								
								return;
							}
							
							// Go to home
							window.location = "index.html";
						},
						error: function() {
							alert("Can't contact the server");
							view.render();
						}
					});
				}
			});
		},
		
		setCollection: function(articles) {
			if(typeof(articles) != "object")
				return;
			
			articles.each(function(article) {
				if(article.attributes.feed)
					article.attributes.feed = $("a[href='#feed/" + article.attributes.feed + "']").html();
			});
			
			delete this.collection;
			this.collection = articles;
			this.render();
			
			// Auto-refresh
			if(!$.localStorage("autorefresh_cnt") && (this.feed || (this.feed === 0)))
				this.autorefresh();
		},
		
		autorefresh: function() {
			if((this.feed || (this.feed === 0)) && $.localStorage("autorefresh")) {
				var view = this;
				var refresh = setTimeout(function() {
					view.refresh_articles();
					view.autorefresh();
				}, window.refresh_interval*1000);
				
				$.localStorage("autorefresh_cnt", refresh);
			}
		},
		
		render: function() {
			// Change the content
			if(this.feed)
				$("#page-title").html($("a[href='#feed/" + this.feed + "']").html());
			else if(this.feed === 0)
				$("#page-title").html($("a[href='#']").html());
			
			if(!$("#page-title").html())
				$("#page-title").html("Loading");
			
			$("#button-refresh").show();
			$("#button-mark").show();
			
			var content = "<ul><li><dl><dt>Loading</dt></dl></li></ul>";
			if(this.collection)
				content = _.template(this.template, {articles: this.collection.toJSON()});
			
			if(this.collection && !this.collection.length) {
				if(this.feed === 0)
					content = "<ul><li><dl><dt>No unread articles</dt></dl></li></ul>";
				else
					content = "<ul><li><dl><dt>No article in this feed</dt></dl></li></ul>";
			}
			
			this.$el.html(content);
			
			// Save feed infos for later
			var view = this;
			$("#page a").click(function(event) {
				//event.preventDefault();
				
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
			this.refresh_articles();
		},
		
		refresh_articles: function() {
			if(!$.localStorage("token"))
				return;
			
			$("#page-title").html("Loading");
			$("#button-refresh").hide();
			
			// Get the list of articles
			var view = this;
			$.ajax({
				dataType: "json",
				url: window.mywebrss + "/feed/show",
				data: {token: $.localStorage("token"), feed: view.feed},
				success: function(data) {
					// Check error
					if(!data.success) {
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
							alert(data.error);
						
						return;
					}
					
					// Delete datas we don't need
					delete data.success, delete data.error;
					
					// Create a new ArticlesCollection
					var collection = new ArticlesCollection();
					$(data.result).each(function(id, article) {
						collection.add(new ArticleModel(article));
					});
					
					view.setCollection(collection);
				},
				error: function() {
					alert("Can't contact the server");
					view.render();
				}
			});
		}
	});
	
	return FeedView;
});

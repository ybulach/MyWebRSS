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
			
			// Refresh the list of articles
			var view = this;
			$("#button-refresh").click(function() {
				view.refresh_articles();
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
			
			var view = this;
			$("#page a").click(function(event) {
				//event.preventDefault();
				
				// Save datas
				$.localStorage("feed", view.feed);
				$.localStorage("collection", view.collection);
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
			$.getJSON(window.mywebrss + "/feed/show", {token: $.localStorage("token"), feed: view.feed}, function(data) {
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
				
				// Create a new ArticlesCollection
				var collection = new ArticlesCollection();
				$(data.result).each(function(id, article) {
					collection.add(new ArticleModel(article));
				});
				
				view.setCollection(collection);
			});
		}
	});
	
	return FeedView;
});

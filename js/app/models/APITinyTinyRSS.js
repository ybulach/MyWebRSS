// Filename: APITinyTinyRSS.js

define([
	'models/API', 'collections/Feeds', 'models/Feed', 'collections/Articles', 'models/Article'
], function(APIModel, FeedsCollection, FeedModel, ArticlesCollection, ArticleModel) {
	var APITinyTinyRSSModel = APIModel.extend({
		defaults: {
			name: "Tiny Tiny RSS API",
			short_name: "tt-rss",
			url: "https://mydomain.com/tt-rss",
			loggedIn: "",
			authentication: "credentials",
			
			// Session ID
			token: null
		},
		
		initialize: function() {
			var api = this;
			
			if(this.attributes.loggedIn == "")
				this.attributes.loggedIn = null;
		},
		
		// Handle Tiny Tiny RSS errors
		handle_error: function(error) {
			if(error === "LOGIN_ERROR")
				return "credentials";
			else
				return error;
		},
		
		// Refresh the list of articles
		// Return: callback(bool, ArticlesCollection, string)
		article_list: function(feed, page, callback) {
			var articles = new ArticlesCollection();
			var api = this;
			
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, articles, "");
				return;
			}

			// Home page
			if(feed == 0) {
				view_mode = "unread";
				feed_id = -4;
			}
			else {
				view_mode = "all_articles";
				feed_id = feed;
			}
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/api/",
				data: JSON.stringify({sid: api.attributes.token, op: "getHeadlines", feed_id: feed_id, view_mode: view_mode, show_content: true, include_attachments: true, limit: window.articles_per_page, skip: page*window.articles_per_page}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false, articles, "");
						return;
					}

					feed_title = "";

					// Create a new ArticlesCollection
					$(data.content).each(function(id, article) {
						// Status
						var status = "";
						if(article.unread)
							status = "new";
						
						// Enclosure / image
						var image = "http://";
						if(article.attachments && (article.attachments.length > 0) && article.attachments[0].content_type.match("^image"))
							image = article.attachments[0].content_url;

						// Feed title
						if((feed_title == "") && (feed != 0))
							feed_title = article.feed_title;

						// Create the ArticleModel
						articles.add(new ArticleModel({
							id: article.id,
							feed: article.feed_title,
							api: api.get_id(),
							title: article.title,
							description: article.content,
							url: article.link,
							date: article.updated,
							image: image,
							status: status
						}));
					});
					
					callback(true, articles, feed_title);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, feeds);
				}
			});
		},
		
		// Mark the article as read
		// Return: callback(bool)
		article_unread: function(article, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}
			
			var api = this;
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/api/",
				data: JSON.stringify({sid: api.attributes.token, op: "updateArticle", article_ids: article, mode: 0, field: 2}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false);
						return;
					}
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		feed_add: function(url, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, -10);
				return;
			}

			var api = this;

			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/api/",
				data: JSON.stringify({sid: api.attributes.token, op: "subscribeToFeed", feed_url: url}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false, -10);
						return;
					}
					else if(data.content.status.code > 1) {
						api.throw_error(data.content.status.message ? data.content.status.message : "Unknown error: " + data.content.status.code);
						callback(false, -10);
						return;
					}
					
					callback(true, 0);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, -10);
				}
			});
		},
		
		// Delete the feed
		// Return: callback(bool)
		feed_delete: function(feed, callback) {
			if(feed < 1) {
				this.throw_error("This feed can't be deleted");
				callback(false);
				return;
			}

			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}

			var api = this;

			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/api/",
				data: JSON.stringify({sid: api.attributes.token, op: "unsubscribeFeed", feed_id: feed}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false);
						return;
					}
					
					callback(true);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false);
				}
			});
		},
		
		// Get the list of feeds
		// Return: callback(bool, FeedsCollection)
		feed_list: function(callback) {
			var feeds = new FeedsCollection();
			var api = this;
			
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, feeds);
				return;
			}
			
			$.ajax({
				type: "POST",
				dataType: "json",
				url: this.attributes.url + "/api/",
				data: JSON.stringify({sid: api.attributes.token, op: "getFeeds", cat_id: -4}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false, feeds);
						return;
					}

					// Create a new FeedsCollection
					$(data.content).each(function(id, feed) {
						if(feed.id > 0) {
							feeds.unread_total += parseInt(feed.unread);
							feeds.add(new FeedModel({
								id: feed.id,
								title: feed.title,
								unread: feed.unread
							}));
						}
					});
					
					callback(true, feeds);
				},
				error: function(error) {
					api.throw_error(api.handle_error(error));
					callback(false, feeds);
				}
			});
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(username, password, callback) {
			var api = this;
			
			// Check login
			$.ajax({
				type: "POST",
				dataType: "json",
				url: api.attributes.url + "/api/",
				data: JSON.stringify({op: "login", user: username, password: password}),
				success: function(data) {
					// Check error
					if(data.status !== 0) {
						api.throw_error(api.handle_error(data.content.error));
						callback(false);
						return;
					}
					
					// Add the login and the token
					api.attributes.loggedIn = username;
					api.attributes.token = data.content.session_id;
					api.save();
					
					callback(true);
				},
				error: function() {
					api.throw_error(api.handle_error("server"));
					callback(false);
				}
			});
		},
		
		// Logout of the API
		// Return: callback(bool)
		logout: function(callback) {
			this.attributes.loggedIn = null;
			this.attributes.token = null;
			this.save();
			
			callback(true);
		}
	});
	
	return APITinyTinyRSSModel;
});

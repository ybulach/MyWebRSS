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

			// TODO
			callback(false, articles);
		},
		
		// Mark the article as read
		// Return: callback(bool)
		// TODO
		article_unread: function(article, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}
			
			// TODO
			callback(false);
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		// TODO
		feed_add: function(url, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}

			// TODO
			callback(false, 0);
		},
		
		// Delete the feed
		// Return: callback(bool)
		// TODO
		feed_delete: function(feed, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false);
				return;
			}
			
			// TODO
			callback(false);
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

					console.log(data);
					// Create a new FeedsCollection
					$(data.content).each(function(id, feed) {
						feeds.unread_total += parseInt(feed.unread);
						feeds.add(new FeedModel({
							id: feed.id,
							title: feed.title,
							unread: feed.unread
						}));
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

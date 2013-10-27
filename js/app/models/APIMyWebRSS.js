// Filename: APIMyWebRSSModel.js

define([
	'models/API', 'collections/Feeds', 'models/Feed', 'collections/Articles', 'models/Article'
], function(APIModel, FeedsCollection, FeedModel, ArticlesCollection, ArticleModel) {
	var APIMyWebRSSModel = APIModel.extend({
		defaults: {
			name: "MyWebRSS API",
			short_name: "mywebrss",
			url: "https://api.mywebrss.net",
			loggedIn: "",
			authentication: "persona",
			
			// Persona API stuff
			token: null
		},
		
		initialize: function() {
			var api = this;
			
			if(this.attributes.loggedIn == "")
				this.attributes.loggedIn = null;
			
			// Persona account stuff
			navigator.id.watch({
				loggedInUser: this.attributes.loggedIn,
				onlogin: function(assertion) {
					api.login(assertion, function(success) {
						$("#api-login").removeAttr("disabled");
						
						if(success) {
							$("#menu-refresh").click();
							window.location = "#";
						}
						else
							navigator.id.logout();
					});
				},
				onlogout: function() {
					api.logout(function(success) {
						$("#api-logout").removeAttr("disabled");
						
						if(success) {
							$("#menu-refresh").click();
							window.location = "#";
						}
					});
				}
			});
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
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/feed/show",
				data: {token: this.attributes.token, feed: feed, articles_count: window.articles_per_page, page: page},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false, articles, "");
						return;
					}
					
					// Create a new ArticlesCollection
					$(data.result).each(function(id, article) {
						article.api = api.get_id();
						articles.add(new ArticleModel(article));
					});
					
					callback(true, articles, data.feed);
				},
				error: function() {
					api.throw_error("server");
					callback(false, articles, "");
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
				dataType: "json",
				url: this.attributes.url + "/article/unread",
				data: {token: this.attributes.token, article: article},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
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
				callback(false, 0);
				return;
			}
			
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/feed/add",
				data: {token: this.attributes.token, feed: url},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false, 0);
						return;
					}
					
					callback(true, data.id);
				},
				error: function() {
					api.throw_error("server");
					callback(false, 0);
				}
			});
		},
		
		// Delete the feed
		// Return: callback(bool)
		feed_delete: function(feed, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, 0);
				return;
			}
			
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/feed/delete",
				data: {token: this.attributes.token, feed: feed},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
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
				dataType: "json",
				url: this.attributes.url + "/feed/list",
				data: {token: this.attributes.token},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false, feeds);
						return;
					}
					
					// Create a new FeedsCollection
					$(data.result).each(function(id, feed) {
						feeds.unread_total += parseInt(feed.unread);
						feeds.add(new FeedModel(feed));
					});
					
					callback(true, feeds);
				},
				error: function() {
					api.throw_error("server");
					callback(false, feeds);
				}
			});
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(assertion, callback) {
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: api.attributes.url + "/user/login",
				data: {assertion: assertion},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false);
						return;
					}
					
					// Add the email and the token
					api.attributes.loggedIn = data.email;
					api.attributes.token = data.token;
					api.save();
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		},
		
		// Logout of the API
		// Return: callback(bool)
		logout: function(callback) {
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: api.attributes.url + "/user/logout",
				data: {token: api.attributes.token},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false);
						return;
					}
					
					// Delete the email and the token
					api.attributes.loggedIn = null;
					api.attributes.token = null;
					api.save();
					
					callback(true);
				},
				error: function() {
					api.throw_error("server");
					callback(false);
				}
			});
		}
	});
	
	return APIMyWebRSSModel;
});

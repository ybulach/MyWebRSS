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
			
			// Persona account stuff
			navigator.id.watch({
				loggedInUser: this.attributes.loggedIn,
				onlogin: function(assertion) {
					$.ajax({
						dataType: "json",
						url: api.attributes.url + "/user/login",
						data: {assertion: assertion},
						success: function(data) {
							if($("#api-login"))
								$("#api-login").removeAttr("disabled");
							
							// Check error
							if(!data.success) {
								api.throw_error(data.error);
								return;
							}
							
							// Add the email and the token, and redirect to Home
							api.attributes.loggedIn = data.email;
							api.attributes.token = data.token;
							window.apis.save();
							
							$("#menu-refresh").click();
							window.location = "#";
						},
						error: function() {
							api.throw_error("server");
							navigator.id.logout();
							
							if($("#api-login"))
								$("#api-login").removeAttr("disabled");
						}
					});
				},
				onlogout: function() {
					$.ajax({
						dataType: "json",
						url: api.attributes.url + "/user/logout",
						data: {token: api.attributes.token},
						success: function(data) {
							if($("#api-logout"))
								$("#api-logout").removeAttr("disabled");
							
							// Check error
							if(!data.success) {
								// Unknown error only
								if(data.error != "token") {
									api.throw_error(data.error);
									return;
								}
							}
							
							// Delete the mail and the token, and redirect to Home
							api.attributes.loggedIn = null;
							api.attributes.token = null;
							
							$("#menu-refresh").click();
							window.location = "#";
						},
						error: function() {
							api.throw_error("server");
							
							if($("#api-logout"))
								$("#api-logout").removeAttr("disabled");
						}
					});
				}
			});
		},
		
		// Refresh the list of articles
		// Return: callback(bool, ArticlesCollection, string)
		article_list: function(feed, page, callback) {
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, null, "");
				return;
			}
			
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/feed/show",
				data: {token: this.attributes.token, feed: feed, articles_count: window.articles_per_page, page: page},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false, null, "");
						return;
					}
					
					// Create a new ArticlesCollection
					var articles = new ArticlesCollection();
					
					$(data.result).each(function(id, article) {
						article.api = api.get_id();
						articles.add(new ArticleModel(article));
					});
					
					callback(true, articles, data.feed);
				},
				error: function() {
					api.throw_error("server");
					callback(false, null, "");
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
			if(!this.attributes.loggedIn) {
				this.throw_error("loggedIn");
				callback(false, null);
				return;
			}
			
			var feeds = new FeedsCollection();
			var api = this;
			
			$.ajax({
				dataType: "json",
				url: this.attributes.url + "/feed/list",
				data: {token: this.attributes.token},
				success: function(data) {
					// Check error
					if(!data.success) {
						api.throw_error(data.error);
						callback(false, null);
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
					callback(false, null);
				}
			});
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(assertion, callback) {
			callback(false);
		},
		
		// Logout of the API
		// Return: callback(bool)
		logout: function(callback) {
			callback(false);
		}
	});
	
	return APIMyWebRSSModel;
});

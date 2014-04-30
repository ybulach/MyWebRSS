// Filename: APIOwnCloud.js

define([
	'models/API', 'collections/Feeds', 'models/Feed', 'collections/Articles', 'models/Article'
], function(APIModel, FeedsCollection, FeedModel, ArticlesCollection, ArticleModel) {
	var APIOwnCloudModel = APIModel.extend({
		defaults: {
			name: "OwnCloud News API",
			short_name: "owncloud",
			url: "https://myowncloud.com",
			loggedIn: "",
			authentication: "credentials",
			
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
			callback(false, new ArticlesCollection(), "");
		},
		
		// Mark the article as read
		// Return: callback(bool)
		article_unread: function(article, callback) {
			callback(false);
		},
		
		// Add a new feed
		// Return: callback(bool, int)
		feed_add: function(url, callback) {
			callback(false, 0);
		},
		
		// Delete the feed
		// Return: callback(bool)
		feed_delete: function(feed, callback) {
			callback(false);
		},
		
		// Get the list of feeds
		// Return: callback(bool, FeedsCollection)
		feed_list: function(callback) {
			callback(false, new FeedsCollection());
		},
		
		// Login to the API
		// Return: callback(bool)
		login: function(username, password, callback) {
			callback(false);
		},
		
		// Logout of the API
		// Return: callback(bool)
		logout: function(callback) {
			callback(false);
		}
	});
	
	return APIOwnCloudModel;
});

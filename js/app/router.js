// Filename: router.js
// The Backbone Router

define([
	'backbone',
	'views/Settings', 'views/API', 'views/AddFeed', 'views/Feed', 'views/Article', 'views/Menu', 'views/About'
], function(Backbone, SettingsView, APIView, AddFeedView, FeedView, ArticleView, MenuView, AboutView) {
	var Router = Backbone.Router.extend({
		menuView: null,
		mainView: null,
		sideView: null,

		initialize: function() {
			// The menu is static (in all views)
			this.menuView = new MenuView();

			Backbone.history.start();
		},

		routes: {
			// Define some URL routes
			'about': 'showAbout',
			'settings': 'showSettings',
			'api/:api': 'showAPI',
			'addfeed': 'showAddFeed',
			'feed/:api/:article': 'showFeed',
			'feed/:api/:feed/:article': 'showArticle',
			'': 'showHome',
			
			// Default page
			'*path': 'defaultPage'
		},
		
		defaultPage: function() {
			window.location = "#";
		},
		
		showAbout: function() {
			this.cleanViews();
			this.mainView = new AboutView();
			this.render();
		},
		
		showSettings: function() {
			this.cleanViews();
			this.mainView = new SettingsView();
			this.render();
		},
		
		showAPI: function(api) {
			this.cleanViews();
			if(!this.mainView)
				this.mainView = new SettingsView();
			this.sideView = new APIView();
			this.sideView.loadAPI(api);
			this.render();
		},
		
		showAddFeed: function() {
			this.cleanViews();
			this.mainView = new AddFeedView();
			this.render();
		},
		
		showFeed: function(api, feed) {
			this.cleanViews();
			this.mainView = new FeedView();
			this.mainView.loadFeed(api, feed);
			this.render();
		},
		
		showArticle: function(api, feed, article) {
			this.cleanViews();
			if(!this.mainView) {
				this.mainView = new FeedView();
				this.mainView.loadFeed(api, feed);
			}
			this.sideView = new ArticleView();
			this.sideView.loadArticle(api, feed, article);
			this.render();
		},
		
		showHome: function() {
			this.cleanViews();
			this.mainView = new FeedView();
			this.mainView.loadFeed(null, 0);
			this.render();
		},

		// Clean the views
		cleanViews: function() {
			// Hide buttons and delete all events
			$("[role=region] button").hide();
			$("[role=region] button:not(#button-menu)").unbind('click');

			if(this.mainView)
				delete this.mainView;
			if(this.sideView)
				delete this.sideView;
		},

		// Show the result
		render: function() {
			if(!this.mainView)
				return;

			// Main view only
			if(!this.sideView)
				$("[role=region]").attr("data-state", "none");
			// Splitted view
			else {
				this.sideView.render();
				$("[role=region]").attr("data-state", "sidepage");
			}

			this.mainView.render();
		}
	});
	
	return Router;
});

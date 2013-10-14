// Filename: router.js
// The Backbone Router

define([
	'backbone',
	'views/Settings', 'views/API', 'views/AddFeed', 'views/Feed', 'views/Article', 'views/Menu', 'views/About'
], function(Backbone, SettingsView, APIView, AddFeedView, FeedView, ArticleView, MenuView, AboutView) {
	// Create a new view
	function createView(View) {
		// Hide buttons and delete all events
		$("[role=region] button").hide();
		$("[role=region] button:not(#button-menu)").unbind('click');
		
		$("#page-title").html("Loading");
		$("#page").empty();
		$("#page").html("<h1>Loading</h1>");
		
		if(window.autorefresh_cnt)
			clearTimeout(window.autorefresh_cnt), window.autorefresh_cnt = 0;
		
		var view = new View();
		view.render();
		return view;
	}
	
	var AppRouter = Backbone.Router.extend({
		routes: {
			// Define some URL routes
			'about': 'showAbout',
			'settings': 'showSettings',
			'api/:id': 'showAPI',
			'addfeed': 'showAddFeed',
			'feed/:api/:id': 'showFeed',
			'article/:api/:id': 'showArticle',
			'': 'showHome',
			
			// Default page
			'*path': 'defaultPage'
		},
		
		defaultPage: function() {
			window.location = "#";
		},
		
		showAbout: function() {
			createView(AboutView);
		},
		
		showSettings: function() {
			createView(SettingsView);
		},
		
		showAPI: function(id) {
			var view = createView(APIView);
			view.loadAPI(id);
		},
		
		showAddFeed: function() {
			createView(AddFeedView);
		},
		
		showFeed: function(api, id) {
			var view = createView(FeedView);
			view.loadFeed(api, id);
		},
		
		showArticle: function(api, id) {
			var view = createView(ArticleView);
			view.loadArticle(api, id);
		},
		
		showHome: function() {
			var view = createView(FeedView);
			view.loadFeed(null, 0);
		}
	});
	
	var initialize = function() {
		// Create the Router
		var app_router = new AppRouter();
		
		// The menu is static (in all views)
		new MenuView();
		
		Backbone.history.start();
		
		return app_router;
	};
	
	return {
		initialize: initialize
	};
});

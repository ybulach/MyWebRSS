// Filename: APIsCollection.js

define([
	'backbone', 'localStorage',
	'models/API', 'models/APIMyWebRSS', 'models/APIOwnCloud', 'models/APISelfoss', 'models/APITinyTinyRSS'
], function(Backbone, localStorage, APIModel, APIMyWebRSSModel, APIOwnCloudModel, APISelfossModel, APITinyTinyRSSModel) {
	var APIsCollection = Backbone.Collection.extend({
		localStorage: new Backbone.LocalStorage("APIs"),
		
		// Reload the good API models
		model: function(attrs, options) {
			if(attrs.short_name == "mywebrss")
				return new APIMyWebRSSModel(attrs, options);
			else if(attrs.short_name == "owncloud")
				return new APIOwnCloudModel(attrs, options);
			else if(attrs.short_name == "selfoss")
				return new APISelfossModel(attrs, options);
			else if(attrs.short_name == "tt-rss")
				return new APITinyTinyRSSModel(attrs, options);
			else
				return new APIModel(attrs, options);
		},
		
		// Save all the API models
		save: function() {
			this.each(function (api) {
				api.save();
			});
			return this;
		}
	});
	
	return APIsCollection;
});

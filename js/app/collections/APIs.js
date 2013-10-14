// Filename: APIsCollection.js

define([
	'backbone', 'localStorage',
	'models/API', 'models/APIMyWebRSS'
], function(Backbone, localStorage, APIModel, APIMyWebRSSModel) {
	var APIsCollection = Backbone.Collection.extend({
		localStorage: new Backbone.LocalStorage("APIs"),
		
		// Reload the good API models
		model: function(attrs, options) {
			if(attrs.short_name == "mywebrss")
				return new APIMyWebRSSModel(attrs, options);
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

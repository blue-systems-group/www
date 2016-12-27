var _ = require('underscore');

var defaults = {
	'limit': 10
}

exports = module.exports = function(config) {
	config = _.extend(_.clone(defaults), (config || {}));
	return function(files, metalsmith, done) {
		var visiblePosts = metalsmith.metadata().visible_posts;
		if (visiblePosts.length <= config.limit) {
			return done();
		}
		var postsIndex = _.findKey(files, function (file) { return file.posts_index });
		var indices = [ postsIndex ];

		for (var i = config.limit; i < visiblePosts.length; i += config.limit) { }

		return done();
	}
};

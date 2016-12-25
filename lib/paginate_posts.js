var _ = require('underscore');

exports = module.exports = function(config) {
	return function(files, metalsmith, done) {
		var postsIndex = _.findKey(files, function (file) { return file.posts_index });
		console.log(postsIndex);
		done();
	}
};

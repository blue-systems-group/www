var async = require('async'),
		assert = require('assert'),
    cheerio = require('cheerio'),
    common = require('./common.js');

function doSections(file) {
  var $ = cheerio.load(file.contents);
	var allIDs = {};
	$('*').each(function (i, elem) {
		var id = $(elem).attr('id');
		if (!id) {
			return;
		}
		assert(!(id in allIDs));
		allIDs[id] = true;
		if (id.startsWith("_")) {
			id = id.slice(1);
		}
		$(elem).before('<a class="anchor" id="' + id + '"></a>');
		$(elem).removeAttr('id');
	});
  file.contents = new Buffer($.html());
	return;
};

exports = module.exports = function(config) {
  return function(files, metalsmith, done) {
    async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
      doSections(file);
      finished();
    }, function () {
      done();
    });
  }
};
exports.doSections = doSections

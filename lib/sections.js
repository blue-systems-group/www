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
		if (id.startsWith("_")) {
			id = id.slice(1);
		}
		if (id in allIDs) {
			return;
		}
		allIDs[id] = true;
		if ($(elem).hasClass('anchor')) {
			return;
		}
		$(elem).before('<a class="anchor" id="' + id + '"></a>');
		$(elem).removeAttr('id');
		var tagName = $(elem).get(0).tagName;
		if ((file.innerLinks) && (file.innerLinks.length > 0) && (file.innerLinks.indexOf(tagName) !== -1)) {
			var replacement = "<" + tagName + ">" +
						"<a href=\"#" + id + "\">" + $(elem).html() +
            "</a>" + "</" + tagName + ">";
      $(elem).replaceWith(replacement);
    }
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

// vim: ts=2:sw=2:et

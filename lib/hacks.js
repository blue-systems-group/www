var async = require('async'),
		_ = require('underscore'),
		cheerio = require('cheerio'),
		common = require('./common.js');

function doHacks(file) {
	var $ = cheerio.load(file.contents);
	$("iframe[src^='http']").each(function (i, elem) {
		$(elem).attr('src', $(elem).attr('src').replace('http:', ''));
		$(elem).attr('src', $(elem).attr('src').replace('https:', ''));
	});
	$(".embed-responsive").each(function() {
		$(this).addClass('hidden-print');
	});
	$("meta[property='og:title']").attr("content", $('title').text());
	if (file.full_url) {
		$("meta[property='og:url']").attr("content", file.full_url);
	} else {
		$("meta[property='og:url']").attr("content",
			"https://www.bluegroup.systems/" + file.path + "/");
	}
	file.contents = new Buffer($.html());
};

exports = module.exports = function(config) {
	return function(files, metalsmith, done) {
		async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
			doHacks(file);
			finished();
		}, function () {
			var metadata = metalsmith.metadata();
			metadata.sitemap = _.map(common.htmlfiles(files), function (file, filename) {
				return {
					filename: filename,
					priority: file.priority || 0.4,
					updated: file.updated,
					changefreq: file.changefreq
				}
			});
			metadata.sitemap = _.sortBy(metadata.sitemap, function (file) {
				return file.priority || 0;
			}).reverse();
			done();
		});
	}
};
module.exports.doHacks = doHacks

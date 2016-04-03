var async = require('async'),
    cheerio = require('cheerio'),
    common = require('./common.js');

var doFixSnippets = function(file, contents) {
  var $ = cheerio.load(contents);
  $("a.thispath").attr('href', "/" + file.path);
  return $.html();
};

module.exports = function(config) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
      if (file.snippet) {
        file.snippet = new Buffer(doFixSnippets(file, file.snippet));
      }
      finished();
    }, function () {
      done();
    });
  }
};


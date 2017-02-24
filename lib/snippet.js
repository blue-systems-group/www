var _ = require('underscore'),
    async = require('async'),
    cheerio = require('cheerio'),
    common = require('./common.js');

module.exports = function(config) {
  return function(files, metalsmith, done) {
    async.forEachOf(common.htmlfiles(files), function(file, filename, finished) {
      var $ = cheerio.load(file.contents);
      var new_readmore;

      var readmore = $('.readmore');
      if (readmore.length > 0) {
        readmore = readmore.first();
        readmore_content = readmore.text();
        var new_classes;
        if (readmore.hasClass('remove')) {
          new_classes = "new_readmore remove";
        } else {
          new_classes = "new_readmore";
        }
        new_readmore = readmore.after('<a class="' + new_classes + ' thispath" href="">' + readmore_content + '</a>');
        $(readmore).remove();
      }

      var snippet = $('.snippet');
      var paragraphs = $("p");
      var new_snippet;
      var new_excerpt;
      if (snippet.length > 0) {
        new_snippet = snippet.first();
        var tmp_excerpt = cheerio.load(new_snippet.html());
        tmp_excerpt('span').remove();
        tmp_excerpt('.new_readmore.remove').remove();
        var new_excerpt = cheerio.load("");
        tmp_excerpt('p').each(function (i, elem) {
          new_excerpt.root().append(tmp_excerpt(elem));
        });
        new_excerpt = new_excerpt.html().replace(" ,", ",").replace(" .", ".");
      } else if (paragraphs.length > 0) {
        new_excerpt = new_snippet = paragraphs.first();
        file.snippet_classes = new_excerpt.parent('div').attr('class');
      }

      if (new_snippet) {
        file.snippet = new_snippet.html();
        file.excerpt = new_excerpt;
        file.has_more = (paragraphs.length > 1);
      }
      if (new_readmore) {
        file.has_more = false;
        $('.new_readmore.remove').remove();
        var readmore = $('.new_readmore');
        if (readmore.length > 0) {
          readmore = readmore.first();
          readmore_content = readmore.text();
          new_readmore = readmore.after(readmore_content);
          $(readmore).remove();
        }
        file.contents = new Buffer($.html());
      }
      finished();
    }, function () {
      done();
    });
  }
};


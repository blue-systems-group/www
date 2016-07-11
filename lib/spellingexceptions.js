var _ = require('underscore'),
    async = require('async');

module.exports = function (config) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    var phrases = [];
    async.series([
        function (callback) {
          async.map(metadata.people, function (person, finished) {
            phrases.push(person.name);
            if (person.institution) {
              phrases.push(person.institution);
            }
            finished();
          },
          function () {
            callback();
          });
        },
        function (callback) {
          async.map(metadata.projects, function (project, finished) {
            phrases.push(project.title);
            phrases.push(project.name);
            finished();
          },
          function () {
            callback();
          });
        },
        function (callback) {
          async.map(metadata.papers, function (paper, finished) {
            phrases.push(paper.name);
            finished();
          },
          function () {
            callback();
          });
        },
        function (callback) {
          async.map(metadata.conferences, function (conference, finished) {
						if (conference.name) {
							phrases.push(conference.name);
						}
						if (conference.edition) {
							phrases.push(conference.edition);
						}
            _.each(conference, function (year) {
              if (year.shortname) {
                phrases.push(year.shortname);
                var array = year.shortname.split("'");
                if (array[1]) {
                  phrases.push(array[0]);
                }
                var array = year.shortname.split("-");
                if (array[1]) {
                  phrases.push(array[0]);
                }
              }
            });
            finished();
          },
          function () {
            callback();
          });
        }
    ],
    function (err) {
      metadata['spelling_exceptions'] = phrases;
      done();
    });
  }
}

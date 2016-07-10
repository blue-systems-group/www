var path = require('path'),
		async = require('async'),
		cheerio = require('cheerio'),
		common = require('./common.js');

function formatMoney(n) {
	var c = 0, d = ".", t = ",", s = n < 0 ? "-" : "";
	var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
	var j = (j = i.length) > 3 ? j % 3 : 0;
	return "$" + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

module.exports = function(config) {
	function move_file(old_file, new_file, files) {
		files[new_file] = files[old_file];
		delete(files[old_file]);
	}
	return function(files, metalsmith, done) {

		var metadata = metalsmith.metadata();
		metadata['build_date'] = metadata['date'];

		async.series([
				function (callback) {
					async.each(metadata.courses, function(course, finished) {
						course.common = metadata.courses_common[course.common];
						course.year = common.format_date(course.started, "YYYY");
						course.name = course.common.title + ' (' + course.semester + ' ' + course.year + ')';
								course.description = course.snippet.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								finished();
								},
								function () {
									callback();
								});
						},
						function (callback) {
							async.each(metadata.posts, function(post, finished) {
								var $ = cheerio.load(post.contents);
								if (!post.title) {
									post.title = $("h2").first().text();
								}
								post.description = post.snippet.toString()
									.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								finished();
							},
							function () {
								callback();
							});
						},
						function (callback) {
							var post_slugs = {};

							async.forEachOf(files, function (file, filename, finished) {
								if ('person' in file) {
									file.email = filename.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
									file.username = /([a-zA-Z0-9._-]+)@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi.exec(filename)[1];
									if (!file.slug) {
										file.slug = file.username;
									}
								} else if ('project' in file) {
									file.slug = filename.match(/\/(\S+)\/summary.html/)[1];
								} else if ('paper' in file) {
									file.slug = filename.match(/\/([\w-]+)\/summary.html/)[1];
									file.year = filename.match(/^papers\/(\d+)\//)[1];
								} else if ('proposal' in file) {
									file.slug = filename.match(/\/([\w-]+)\/summary.html/)[1];
									file.year = common.format_date(file.started, "YYYY");
								} else if ('course' in file) {
									file.slug = file.common.slug + '_' + file.semester + '_' + file.year;
								} else if ('post' in file) {
									function slugify(text) {
										return text.toString().toLowerCase()
											.replace(/\s+/g, '-')
											.replace(/[^\w\-]+/g, '')
											.replace(/\-\-+/g, '-')
											.replace(/^-+/, '')
											.replace(/-+$/, '');
									}
									post_slug = common.format_date(file.created, 'YYYY-MM-DD', false) + "-" + slugify(file.title.slice(0, 32));
									if (post_slugs[post_slug] !== undefined) {
										return done(new Error("duplicate post slug"));
									}
									if (file.working) {
										console.log("Working post: " + post_slug);
									}
									post_slugs[post_slug] = true;
									file.slug = post_slug
										file.people = [filename.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]];
								}
								finished();
							}, function () {
								callback();
							});
						},
						function (callback) {
							async.each(metadata.people, function(person, finished) {
								person.person = true;
								if (person.link) {
									if ((person.link + '/photo.jpg').slice(1) in files) {
										person.photo = person.link + '/photo.jpg';
									}
									if (!person.CV) {
										old_file = (person.link + '/CV.pdf').slice(1);
										if (old_file in files) {
											new_file = (person.link + '/' + person.name.replace(/\s+/g, '') + '-CV.pdf').slice(1);
											move_file(old_file, new_file, files);
											person.CV = "/" + new_file;
										}
									}
									person.finished = person.photo && person.snippet.length;
								}
								if (person.finished && !person.alumni) {
									person.group = true;
								} else if (person.finished && person.alumni) {
									if (!person.short_alumni) {
										person.long_alumni = true;
									} else {
										person.short_alumni = true;
									}
								} else if (person.old_group) {
									person.short_alumni = true;
								} else {
									person.collaborator = true;
								}
								if (person.snippet) {
									person.description = person.snippet.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								}
								finished();
							}, function () {
								callback();
							});
						},
						function (callback) {
							async.each(metadata.projects, function(project, finished) {
								if (project.ended) {
									project.active = false;
								} else {
									project.active = true;
								}
								if (!project.title) {
									project.title = project.name;
								} else if (!project.name) {
									project.name = project.title;
								}
								project.description = project.snippet.toString()
									.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								finished();
							}, function () {
								callback();
							});
						},
						function (callback) {
							async.each(metadata.papers, function(paper, finished) {
								if (!paper.thesis) {
									paper.conference = metadata.conferences[paper.published][paper.year];
									paper.conference.year = paper.year;
									paper.published = metadata.conferences[paper.published];
									paper.date = paper.conference.date;
									paper.toappear = (paper.date > Date.now());
								}

								old_file = undefined;
								if ((paper.link + '/paper.pdf').slice(1) in files) {
									old_file = (paper.link + '/paper.pdf').slice(1);
								} else if ((paper.link + '/poster.pdf').slice(1) in files) {
									old_file = (paper.link + '/poster.pdf').slice(1);
								} else if ((paper.link + '/thesis.pdf').slice(1) in files) {
									old_file = (paper.link + '/thesis.pdf').slice(1);
								}
								if (old_file) {
									new_file = (paper.link + '/' + paper.slug + '.pdf').slice(1);
									move_file(old_file, new_file, files);
									paper.PDF = "/" + new_file;
								}
								old_file = undefined;
								if ((paper.link + '/slides.pdf').slice(1) in files) {
									old_file = (paper.link + '/slides.pdf').slice(1);
								}
								if (old_file) {
									new_file = (paper.link + '/' + paper.slug + '-Slides.pdf').slice(1);
									move_file(old_file, new_file, files);
									paper.slides = "/" + new_file;
								}
								paper.conference_metadata = !(paper.poster || paper.thesis);
								paper.description = paper.snippet.toString()
									.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								finished();
							}, function () {
								callback();
							});
						},
						function (callback) {

							async.each(metadata.proposals, function(proposal, finished) {
								proposal.source = metadata.sources[proposal.source];
								proposal.program = proposal.source.programs[proposal.program];
								proposal.pretty_amount = formatMoney(proposal.amount);
								proposal.year = proposal.started.getFullYear();

								old_file = undefined;
								if ((proposal.link + '/external.pdf').slice(1) in files) {
									old_file = (proposal.link + '/external.pdf').slice(1);
								}
								if (old_file) {
									new_file = (proposal.link + '/' + proposal.slug + '.pdf').slice(1);
									move_file(old_file, new_file, files);
									proposal.PDF = "/" + new_file;
								}
								if (proposal.ends < Date.now()) {
									proposal.active = false;
								} else {
									proposal.active = true;
								}
								proposal.inactive = !(proposal.active);
								if ('proposals/logos/' + proposal.source.shortname + '.jpg' in files) {
									proposal.logo = '/proposals/logos/' + proposal.source.shortname + '.jpg';
								}
								proposal.description = proposal.snippet.toString()
									.replace(/<(?:.|\n)*?>/gm, '').replace(/\s+/gm, ' ');
								finished();
							}, function () {
								callback();
							});
						},
						function (callback) {
							async.each(metadata.courses, function(course, finished) {
								var $ = cheerio.load(course.contents);
								course.has_evaluations = $().is('#evaluations');
								course.has_summary = $().is('#summary');
								old_file = undefined;
								if ((course.link + '/syllabus.pdf').slice(1) in files) {
									old_file = (course.link + '/syllabus.pdf').slice(1);
								}
								if (old_file) {
									new_file = (course.link + '/' + course.slug + '-Syllabus.pdf').slice(1);
									move_file(old_file, new_file, files);
									course.syllabus = "/" + new_file;
								}
								old_file = false
								if ((course.link + '/evaluations.pdf').slice(1) in files) {
									old_file = (course.link + '/evaluations.pdf').slice(1);
								}
								if (old_file) {
									new_file = (course.link + '/' + course.slug + '-Evaluations.pdf').slice(1);
									move_file(old_file, new_file, files);
									course.evaluations = "/" + new_file;
								}
								finished();
							}, function() {
								callback();
							});
						}
		],
		function (err) {
			done(err);
		});
	}
};

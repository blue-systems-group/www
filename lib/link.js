var _ = require('underscore'),
    async = require('async'),
		path = require('path'),
    sort = require('./sort.js');

var linkPeople = function(people, metadata) {
  return _.compact(_.map(people, function(person) {
    if (person.search('@') == -1) {
      var person = person + '@buffalo.edu';
    }
    person_bio = _.find(metadata.people, function(p) {
      return p.email === person;
    });
    if (person_bio === undefined) {
      console.log('Missing bio for ' + person);
    }
    return person_bio;
  }));
};
      
var linkPapers = function(papers, metadata) {
  return _.compact(_.map(papers, function(paper) {
    paper_summary = _.find(metadata.papers, function(p) {
      return p.slug === paper;
    });
    if (paper_summary === undefined) {
      console.log('Missing summary for ' + paper);
    }
    return paper_summary;
  }));
};

var linkProjects = function(projects, metadata) {
  return _.compact(_.map(projects, function (project) {
    project_summary = _.find(metadata.projects, function(p) {
      return p.slug === project;
    });
    if (project_summary === undefined) {
      console.log('Missing summary for ' + project);
    }
    return project_summary;
  }));
};

var linkProposals = function(proposals, metadata) {
  return _.compact(_.map(proposals, function (proposal) {
    proposal_summary = _.find(metadata.proposals, function(p) {
      return p.slug === proposal;
    });
    if (proposal_summary === undefined) {
      console.log('Missing summary for ' + proposal);
    }
    return proposal_summary;
  }));
};

var linkCourses = function(courses, metadata) {
  return _.compact(_.map(courses, function (course) {
    course_summary = _.find(metadata.courses, function(p) {
      return p.slug === course;
    });
    if (course_summary === undefined) {
      console.log('Missing summary for ' + course);
    }
    return course_summary;
  }));
};

var paginate = function (iterable) {
  prev = undefined;
  _.each(iterable, function (elem) {
    elem.previous_item = prev;
    if (prev) {
      prev.next_item = elem;
    }
    prev = elem;
  });
}

module.exports = function(config) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    
    metadata.people.group = _.filter(metadata.people, function (person) { return person.group });
    metadata.people.long_alumni = _.filter(metadata.people, function (person) { return person.long_alumni });
    var short_alumni = _.filter(metadata.people, function (person) { return person.short_alumni });
    var collaborators = _.filter(metadata.people, function (person) { return person.collaborator });
    
    metadata.people.short_alumni = {}
    metadata.people.short_alumni.first = short_alumni.slice(0,Math.ceil(short_alumni.length / 2));
    metadata.people.short_alumni.second = short_alumni.slice(Math.ceil(short_alumni.length / 2));
    
    metadata.people.collaborators = {}
    metadata.people.collaborators.first = collaborators.slice(0,Math.ceil(collaborators.length / 2));
    metadata.people.collaborators.second = collaborators.slice(Math.ceil(collaborators.length / 2));

    metadata.projects.active = _.filter(metadata.projects, function(project) {
      return project.active;
    }).sort(function(p1, p2) {
      if (p1.started != p2.started) {
        return p1.started > p2.started ? -1 : p1.started < p2.started ? 1 : 0;
      } else {
        return p1.name.toLowerCase() > p2.name.toLowerCase() ? 1 : -1;
      }
    });
    metadata.projects.inactive = _.filter(metadata.projects, function(project) {
      return !project.active;
    }).sort(function(p1, p2) {
      if (p1.ended != p2.ended) {
        return p1.ended > p2.ended ? -1 : p1.ended < p2.ended ? 1 : 0;
      } else {
        return p1.name.toLowerCase() > p2.name.toLowerCase() ? 1 : -1;
      }
    });
    paginate(metadata.projects.active.concat(metadata.projects.inactive));
    
    async.series([
        function (callback) {
          async.each(metadata.projects, function(project, finished) {
            project.people = linkPeople(project.people, metadata);
            project.leads = linkPeople(project.leads, metadata);
						project.list_people = (project.people.length + project.leads.length) > 0;
						project.multiple_people = (project.people.length + project.leads.length) > 1;
            project.papers = linkPapers(project.papers, metadata);
            project.funding = linkProposals(project.funding, metadata);
						project.courses = linkCourses(project.courses, metadata);
            finished();
          },
          function () {
            callback();
          });
        },
        function (callback) {
          async.each(metadata.papers, function(paper, finished) {
            paper.people = linkPeople(paper.people, metadata);
            if (paper.presenters) {
              paper.presenters = _.sortBy(linkPeople(paper.presenters, metadata), function (p) {
                return p.name.toLowerCase();
              });
            }
            paper.projects = linkProjects(paper.projects, metadata);
            paper.funding = linkProposals(paper.funding, metadata);
            finished();
          },
          function () {
            paginate(metadata.papers);
            callback();
          });
        },
        function (callback) {
          async.each(metadata.proposals, function(proposal, finished) {
            proposal.faculty = linkPeople(proposal.faculty, metadata);
            proposal.students = linkPeople(proposal.students, metadata);
            projects = linkProjects(proposal.projects, metadata);
            proposal.projects = {}
            proposal.projects.active = _.filter(projects, function (project) {
              return project.active;
            });
            proposal.projects.inactive = _.filter(projects, function (project) {
              return !project.active;
            });
            proposal.papers = _.uniq(linkPapers(proposal.papers, metadata)).sort(sort.sort_papers);
            proposal.list_papers = proposal.papers.length > 0;
            proposal.projects.list = projects.length > 0;
						proposal.has_links = (proposal.abstract || proposal.PDF);
            finished();
          },
          function () {
            paginate(metadata.proposals);
            callback();
          });
        },
        function (callback) {
          async.each(metadata.courses, function(course, finished) {
            course.instructors = _.sortBy(linkPeople(course.instructors, metadata), function (p) {
              return p.name.toLowerCase();
            });
            course.staff = _.sortBy(linkPeople(course.staff, metadata), function (p) {
              return p.name.toLowerCase();
            });
            if (course.volunteers) {
              course.volunteers = _.sortBy(linkPeople(course.volunteers, metadata), function (p) {
                return p.name.toLowerCase();
              });
            }
            if (course.UTAs) {
              course.UTAs = _.sortBy(linkPeople(course.UTAs, metadata), function (p) {
                return p.name.toLowerCase();
              });
            }
						course.has_links = (course.website || course.syllabus || course.videos || course.evaluations);
            finished();
          },
          function () {
            paginate(metadata.courses);
            callback();
          });
        },
        function (callback) {
          async.each(metadata.people.group, function(person, finished) {
            if (!person.nopapers) {
              person.papers = _.filter(metadata.papers, function(paper) {
                return _.contains(paper.people, person);
              });
              person.list_papers = person.papers.length > 0;
            }
            if (!person.noprojects) {
              person.projects = {};
              person.projects.leads = _.filter(metadata.projects.active, function(project) {
                return _.contains(project.leads, person);
              });
              person.projects.active = _.filter(metadata.projects.active, function(project) {
                return _.contains(project.people, person);
              })
              person.projects.inactive = _.filter(metadata.projects.inactive, function(project) {
                return _.contains(project.people, person);
              })
              person.projects.list = (person.projects.leads.length + 
                                      person.projects.active.length +
                                      person.projects.inactive.length) > 0;
            }
            if (!person.nocourses) {
              person.courses = _.filter(metadata.courses, function (course) {
                return _.contains(course.instructors, person) || 
                _.contains(course.staff, person) ||
                _.contains(course.volunteers, person) || 
								_.contains(course.UTAs, person);
              });
              person.list_courses = person.courses.length > 0;
            }
            finished();
          },
          function () {
            paginate(metadata.people.group.concat(metadata.people.long_alumni));
            callback();
          });
        },
        function (callback) {
          async.each(metadata.posts, function (post, finished) {
            post.people = linkPeople(post.people, metadata);
						if (post.url_base) {
							post.full_url = path.join(post.url_base, post.path);
						} else {
							post.full_url = "https://www.bluegroup.systems/" + post.path;
						}
						console.log(post.full_url);
            finished();
          },
          function () {
            paginate(metadata.visible_posts);
            callback();
          });
        }
    ],
    function (err) {
      done(err);
    });
  }
};

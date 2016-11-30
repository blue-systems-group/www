var _ = require('underscore'),
    common = require('./common.js');

function sort_proposals(o1, o2) {
  o1_date = o1.started.getTime();
  o2_date = o2.started.getTime();
  if (o1_date != o2_date) {
    return o1_date > o2_date ? -1 : o1_date < o2_date ? 1 : 0;
  } else {
    return o1.amount > o2.amount ? -1 : o1.amount < o2.amount ? 1 : 0;
  }
};

function sort_papers(o1, o2) {
  o1_date = o1.date.getTime();
  o2_date = o2.date.getTime();
  if (o1_date != o2_date) {
    return o1_date > o2_date ? -1 : o1_date < o2_date ? 1 : 0;
  } else if (o1.poster != o2.poster) {
    return o1.poster ? 1 : o2.poster ? -1 : 0;
  } else {
    return o1.name.toLowerCase() > o2.name.toLowerCase() ? 1 : 
           o1.name.toLowerCase() < o2.name.toLowerCase() ? -1 : 0;
  }
};


function sort(config) {
  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();

    metadata.people = _.sortBy(metadata.people, function (o) {
      return o.name.toLowerCase();
    });
    
    metadata.papers = metadata.papers.sort(sort_papers);

    metadata.projects = metadata.projects.sort(function(p1, p2) {
			return p1.started > p2.started ? -1 :
				p1.started < p2.started ? 1 :
				p1.name.toLowerCase() > p2.name.toLowerCase();
    });

    metadata.proposals = metadata.proposals.sort(sort_proposals);
    metadata.courses = metadata.courses.sort(function (c1, c2) {
			return c1.started > c2.started ? -1 :
				c1.started < c2.started ? 1 :
				c1.enrollment < c2.enrollment;
    });
    
    metadata.visible_posts = _.filter(metadata.posts, function (p) {
      return !(p.working);
    });
    metadata.visible_posts = metadata.visible_posts.sort(function (c1, c2) {
      return c1.created > c2.created ? -1 : c1.created < c2.created ? 1 : 0;
    });
    
    done();
  }
};

exports = module.exports = sort;
exports.sort_papers = sort_papers;

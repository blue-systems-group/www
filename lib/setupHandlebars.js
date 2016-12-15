var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    handlebars = require('handlebars'),
    common = require('./common.js');

module.exports = function (template_dir) {
  handlebars.registerPartial('header',
      fs.readFileSync(path.join(template_dir, '/partials/header.hbt')).toString());
  handlebars.registerPartial('posts_header',
      fs.readFileSync(path.join(template_dir, '/partials/posts_header.hbt')).toString());
  handlebars.registerPartial('footer',
      fs.readFileSync(path.join(template_dir, '/partials/footer.hbt')).toString());
  handlebars.registerPartial('paper',
      fs.readFileSync(path.join(template_dir, '/partials/paper.hbt')).toString());
  handlebars.registerPartial('proposal',
      fs.readFileSync(path.join(template_dir, '/partials/proposal.hbt')).toString());
  handlebars.registerPartial('course',
      fs.readFileSync(path.join(template_dir, '/partials/course.hbt')).toString());
  handlebars.registerPartial('projectsandpapers',
      fs.readFileSync(path.join(template_dir, '/partials/projectsandpapers.hbt')).toString());

  var object_link = function(o) {
    if (o.person && o.institution) {
      name = o.name + " <i>(" + o.institution + ")</i>";
    } else {
      name = o.name || o.title;
    }
    if (o.person) {
      if (o.group || o.long_alumni) {
        if (o.finished) {
          return '<a href="/' + o.path + '/">' + name + '</a>';
        } else {
          return name;
        }
      } else if (o.website) {
        return '<a href="' + o.website + '">' + name + '</a>';
      } else {
        return name;
      }
    } else {
      if (o.external) {
        link = o.external;
      } else if (o.path) {
        link = '/' + o.path;
      } else {
        link = o.link;
      }
			if (link.startsWith("/") && !(link.startsWith("//")) && !(link.endsWith("/"))) {
				link = link + "/";
			}
      return '<a href="' + link + '">' + name + '</a>';
    }
  };

  handlebars.registerHelper('link', function (o) {
    return new handlebars.SafeString(object_link(o));
  });

  handlebars.registerHelper('and_list', function (people) {
    var list = _.map(people, object_link).map(function (e) {
      return "<span style='white-space: nowrap;'>" + e + "</span>";
    });
    if (list.length == 1) {
      list = list[0];
    } else if (list.length == 2) {
      list = list.join(" and ");
    } else {
      comma_list = list.slice(0, -1);
      list = comma_list.join(", ") + ", and " + list.slice(-1)[0];
    }
    return new handlebars.SafeString(list);
  });

  handlebars.registerHelper('list_with_years', function (os, options) {
    var last_year;
    var ret = "";

    for (var i = 0; i < os.length; i++) {
      if (options.data) {
        data = handlebars.createFrame(options.data || {});
        if (!last_year || (os[i].year != last_year)) {
          data.new_year = true;
        } else {
          data.new_year = false;
        }
        data.index = os.length - i;
        last_year = os[i].year;
      }
      ret += options.fn(os[i], {data: data});
    }
    return ret;
  });

  handlebars.registerHelper('format_date', common.format_date);
	handlebars.registerHelper('eq', function(val, val2, options) {
		return val == val2 ? options.fn(this) : undefined;
	});
	handlebars.registerHelper('ne', function(val, val2, options) {
		return val != val2 ? options.fn(this) : undefined;
	});
	handlebars.registerHelper('single', function(val, val2, val3, options) {
		return val.length === 1 ? val2 : val3;
	});
}

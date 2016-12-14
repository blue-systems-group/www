var argv = require('minimist')(process.argv.slice(2)),
    path = require('path');

var site_dir = argv._[0];
if (!site_dir) {
  console.log("Usage: blue <dir>, where <dir> has your sources (src) and templates (layouts).");
  return;
}
site_dir = path.join(process.cwd(), site_dir);
var template_dir = path.join(site_dir, 'layouts');

require('../lib/setupHandlebars')(template_dir);

// 23 Sep 2015 : GWA : Pipeline includes.

var metalsmith = require('metalsmith'),
    build_date = require('metalsmith-build-date'),
    drafts = require('metalsmith-drafts'),
    filemetadata = require('metalsmith-filemetadata'),
    metadata = require('metalsmith-metadata'),
    collections = require('metalsmith-collections'),
    github = require('./github.js'),
    asciidoc = require('metalsmith-asciidoc'),
    updated = require('metalsmith-updated'),
    filepath = require('metalsmith-filepath'),
    snippet = require('./snippet.js'), 
    footnotes = require('./footnotes.js'),
    annotate = require('./annotate.js'),
    permalinks = require('metalsmith-permalinks'),
    sort = require('./sort.js'),
    link = require('./link.js'),
    fixsnippets = require('../lib/fixsnippets.js'),
    layouts = require('metalsmith-layouts'),
    sections = require('./sections.js'),
    lessjavascript = require('../lib/lessjavascript.js'),
		failmeta = require('./failmeta.js'),
    concat_convention = require('metalsmith-concat-convention'),
    hacks = require('./hacks.js'),
    sass = require('metalsmith-sass'),
    highlight = require('metalsmith-highlight'),
		inplace = require('metalsmith-in-place'),
		msif = require('metalsmith-if'),
		clean_css = require('metalsmith-clean-css'),
		uglify = require('metalsmith-uglify'),
		rename = require('metalsmith-rename'),
    beautify = require('./beautify.js'),
    spellingexceptions = require('../lib/spellingexceptions.js'),
    spellcheck = require('metalsmith-spellcheck'),
    formatcheck = require('metalsmith-formatcheck'),
    linkcheck = require('metalsmith-linkcheck');


var people_pattern = 'people/**/bio.adoc';
var projects_pattern = 'projects/**/summary.adoc';
var papers_pattern = 'papers/**/**/summary.adoc';
var proposals_pattern = 'proposals/**/summary.adoc';
var courses_pattern = 'courses/**/**/summary.adoc';
var posts_pattern = 'people/**/posts/*.adoc';

metalsmith(site_dir)
  .destination('.build')
  .use(build_date())
  .use(drafts())
  .use(filemetadata([
    {pattern: people_pattern,
      metadata: {'person': true, 'title_h1': false, 'layout': 'people/single.hbt', 'doGithub': true},
      preserve: true},
    {pattern: projects_pattern, metadata: {'project': true, 'layout': 'projects/single.hbt', 'doGithub': true}},
    {pattern: papers_pattern, metadata: {'paper': true, 'layout': 'papers/single.hbt', 'doGithub': true}},
    {pattern: proposals_pattern, metadata: {'proposal': true, 'layout': 'proposals/single.hbt'}},
    {pattern: courses_pattern, metadata: {'course': true, 'layout': 'courses/single.hbt'}},
    {pattern: posts_pattern, metadata: {'post': true, 'layout': 'posts/single.hbt'}}
  ]))
  .use(metadata({
    people: 'people/other.yaml',
    conferences: 'papers/conferences.yaml',
    sources: 'proposals/sources.yaml',
    courses_common: 'courses/common.yaml'
  }))
  .use(collections({
    people: {
      pattern: people_pattern,
    },
    projects: {
      pattern: projects_pattern,
    },
    papers: {
      pattern: papers_pattern,
    },
    proposals: {
      pattern: proposals_pattern,
    },
    courses: {
      pattern: courses_pattern,
    },
    posts: {
      pattern: posts_pattern,
    }
  }))
  .use(github())
  .use(asciidoc())
  .use(updated({ignoreKeys: ["draft", "working"], filePatterns: ["**/*.html"]}))
  .use(filepath({
    absolute: true,
    permalinks: true
  }))
  .use(snippet())
  .use(footnotes())
  .use(annotate())
  .use(permalinks({
    pattern: ':collection/:slug',
		relative: false
  }))
  .use(sort())
  .use(link())
  .use(fixsnippets())
  .use(sections())
  .use(layouts({
    engine: 'handlebars',
    directory: template_dir
  }))
  .use(lessjavascript())
	.use(sass({
    outputStyle: 'expanded'
  }))
  .use(concat_convention({
		extname: '.concat'
	}))
	.use(hacks())
  .use(highlight())
	.use(inplace({
		engine: 'handlebars',
		pattern: 'sitemap.xml'
	}))
  .use(failmeta())
	.use(msif((argv['deploy'] == true), clean_css({ files: 'assets/css/*.css' })))
	.use(msif((argv['deploy'] == true), uglify()))
	.use(msif((argv['deploy'] == true), rename([[/\.min\.js$/, ".js"]])))
	.use(msif((argv['deploy'] == true), beautify({'indent_size': 2, 'css': false, 'js': false})))
  .use(msif((argv['check'] == true), spellingexceptions()))
  .use(msif((argv['check'] == true),
		spellcheck({ dicFile: 'dicts/en_US.dic',
                 affFile: 'dicts/en_US.aff',
                 exceptionFile: 'dicts/spelling_exceptions.json',
                 checkedPart: "div#content",
                 verbose: true})))
  .use(msif((argv['check'] == true),
		formatcheck({ verbose: true ,
									checkedPart: "div#content",
									failWithoutNetwork: false })))
	.use(msif((argv['check'] == true),
		linkcheck({ verbose: true , failWithoutNetwork: false })))
  .clean(true)
  .build(function throwErr (err) { 
    if (err) {
      throw err;
    }
  });

// vim: ts=2:sw=2:et

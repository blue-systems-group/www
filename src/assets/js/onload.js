$(function() {
  // Turn on scrollspy
  if ($('.blue-sidebar').length > 0) {
    $('body').scrollspy({ target: '.blue-sidebar', offset: 60 });
  }

  // Enable popovers
  $('[data-toggle="popover"]').popover();
  $('body').on('click', function (e) {
    $('[data-toggle="popover"]').each(function () {
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });
  
  // Enable LightBox
	$(document).on('click', '[data-toggle="lightbox"]', function(event) {
		event.preventDefault();
		$(this).ekkoLightbox({
      always_show_close: false
    });
	});

  // Load Google Analytics
  $.getScript("/assets/js/analytics.js", function () {
    window.ga = window.ga || function() {
      (ga.q=ga.q || []).push(arguments)
    };
    ga.l =+ new Date;

    ga('create', 'UA-45109275-1', 'auto');
    ga('send', 'pageview');

    $("#content a[href$='.pdf']")
    .attr("target","_blank")
    .click(function() {
      ga('send', 'pageview', $(this).attr('href'));
    });
  });
});

// vim: ts=2:sw=2:et

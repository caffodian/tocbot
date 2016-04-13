/**
 * Tocbot
 * Tocbot creates a toble of contents based on HTML headings on a page,
 * this allows users to easily jump to different sections of the document.
 * Tocbot was inspired by tocify (http://gregfranko.com/jquery.tocify.js/).
 * The main differences are that it works natively without any need for jquery or jquery UI).
 *
 * @author Tim Scanlin
 */

/* globals define */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory(root));
	} else if (typeof exports === 'object') {
    module.exports = factory(root);
	} else {
    root.tocbot = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function(root) {

  'use strict';

  // Require smooth-scroll by default.
  var smoothScroll = require('smooth-scroll');

  // Default options.
  var defaultOptions = require('./default-options.js');
  // Object to store current options.
  var options = {};
  // Object for public APIs.
  var tocbot = {};

  var BuildHtml = require('./build-html.js');
  var ParseContent = require('./parse-content.js');
  // Keep these variables at top scope once options are passed in.
  var buildHtml;
  var parseContent;

  var doc = root.document;
  var body = document.body;
  var supports = !!root.document.querySelector && !!root.addEventListener; // Feature test
  var headingsArray;

  // From: https://github.com/Raynos/xtend
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  function updateTocListener(headings) {
    return function updateToc() {
      return buildHtml.updateToc(headings);
    };
  }

  /**
	 * Destroy tocbot.
	 */
  tocbot.destroy = function() {
    // Clear HTML.
    document.querySelector(options.tocSelector).innerHTML = '';

		// Remove event listeners.
    document.removeEventListener('scroll', this._updateTocListener, false);
    document.removeEventListener('resize', this._updateTocListener, false);
    if (buildHtml) {
      document.removeEventListener('click', this._disableTocAnimation, false);
    }

    // Destroy smoothScroll if it exists.
    if (smoothScroll) {
      smoothScroll.destroy();
    }
  };

  /**
	 * Initialize tocbot.
	 * @param {object} customOptions
	 */
  tocbot.init = function(customOptions) {
    // feature test
    if (!supports) {
      return;
    }

    // Merge defaults with user options.
    // Set to options variable at the top.
    options = extend(defaultOptions, customOptions || {});
    this.options = options;
    this.state = {};

    // Pass options to these modules.
    buildHtml = BuildHtml(options);
    parseContent = ParseContent(options);

    // For testing purposes.
    this._buildHtml = buildHtml;
    this._parseContent = parseContent;

    // Destroy it if it exists first.
    tocbot.destroy();

    // Get headings array
    headingsArray = parseContent.selectHeadings(options.contentSelector, options.headingSelector);

    // Build nested headings array.
    var nestedHeadingsObj = parseContent.nestHeadingsArray(headingsArray);
    var nestedHeadings = nestedHeadingsObj.nest;

    // Render.
    buildHtml.render(options.tocSelector, nestedHeadings);

    // Update Sidebar and bind listeners.
    buildHtml.updateToc(headingsArray);
    this._updateTocListener = updateTocListener(headingsArray);
    document.addEventListener('scroll', this._updateTocListener, false);
    document.addEventListener('resize', this._updateTocListener, false);

    // Bind click listeners to disable animation.
    this._disableTocAnimation = buildHtml.disableTocAnimation; // Save reference so event is created / removed properly.
    document.addEventListener('click', this._disableTocAnimation, false);

    // Initialize smoothscroll if it exists.
    if (smoothScroll) {
      this.smoothScroll = smoothScroll.init(extend(options.smoothScrollOptions, {
        callback: buildHtml.enableTocAnimation
      }));
    }

    return this;
  };

  /**
   * Refresh tocbot.
   */
  tocbot.refresh = function(customOptions) {
    tocbot.destroy();
    tocbot.init(customOptions || this.options);
  };

  // Make tocbot available globally.
  root.tocbot = tocbot;

  return tocbot;
});

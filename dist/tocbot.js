/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Tocbot
	 * Tocbot creates a toble of contents based on HTML headings on a page,
	 * this allows users to easily jump to different sections of the document.
	 * Tocbot was inspired by tocify (http://gregfranko.com/jquery.tocify.js/).
	 * The main differences are that it works natively without any need for jquery or jquery UI).
	 *
	 * @author Tim Scanlin
	 */
	
	/* globals define */
	
	(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory(root)), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  } else if (typeof exports === 'object') {
	    module.exports = factory(root)
	  } else {
	    root.tocbot = factory(root)
	  }
	})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {
	  'use strict'
	
	  // Default options.
	  var defaultOptions = __webpack_require__(/*! ./default-options.js */ 1)
	  // Object to store current options.
	  var options = {}
	  // Object for public APIs.
	  var tocbot = {}
	
	  var BuildHtml = __webpack_require__(/*! ./build-html.js */ 2)
	  var ParseContent = __webpack_require__(/*! ./parse-content.js */ 3)
	  // Keep these variables at top scope once options are passed in.
	  var buildHtml
	  var parseContent
	
	  // Just return if its not a browser.
	  if (typeof window === 'undefined') {
	    return
	  }
	  var supports = !!root.document.querySelector && !!root.addEventListener // Feature test
	  var headingsArray
	
	  // From: https://github.com/Raynos/xtend
	  var hasOwnProperty = Object.prototype.hasOwnProperty
	  function extend () {
	    var target = {}
	    for (var i = 0; i < arguments.length; i++) {
	      var source = arguments[i]
	      for (var key in source) {
	        if (hasOwnProperty.call(source, key)) {
	          target[key] = source[key]
	        }
	      }
	    }
	    return target
	  }
	
	  // From: https://remysharp.com/2010/07/21/throttling-function-calls
	  function throttle (fn, threshhold, scope) {
	    threshhold || (threshhold = 250)
	    var last
	    var deferTimer
	    return function () {
	      var context = scope || this
	      var now = +new Date()
	      var args = arguments
	      if (last && now < last + threshhold) {
	        // hold on to it
	        clearTimeout(deferTimer)
	        deferTimer = setTimeout(function () {
	          last = now
	          fn.apply(context, args)
	        }, threshhold)
	      } else {
	        last = now
	        fn.apply(context, args)
	      }
	    }
	  }
	
	  /**
	   * Destroy tocbot.
	   */
	  tocbot.destroy = function () {
	    // Clear HTML.
	    try {
	      document.querySelector(options.tocSelector).innerHTML = ''
	    } catch (e) {
	      console.warn('Element not found: ' + options.tocSelector); // eslint-disable-line
	    }
	
	    // Remove event listeners.
	    document.removeEventListener('scroll', this._scrollListener, false)
	    document.removeEventListener('resize', this._scrollListener, false)
	    if (buildHtml) {
	      document.removeEventListener('click', this._clickListener, false)
	    }
	  }
	
	  /**
	   * Initialize tocbot.
	   * @param {object} customOptions
	   */
	  tocbot.init = function (customOptions) {
	    // feature test
	    if (!supports) {
	      return
	    }
	
	    // Merge defaults with user options.
	    // Set to options variable at the top.
	    options = extend(defaultOptions, customOptions || {})
	    this.options = options
	    this.state = {}
	
	    // Init smooth scroll if enabled (default).
	    if (options.smoothScroll) {
	      tocbot.zenscroll = __webpack_require__(/*! zenscroll */ 4)
	      tocbot.zenscroll.setup(options.smoothScrollDuration)
	    }
	
	    // Pass options to these modules.
	    buildHtml = BuildHtml(options)
	    parseContent = ParseContent(options)
	
	    // For testing purposes.
	    this._buildHtml = buildHtml
	    this._parseContent = parseContent
	
	    // Destroy it if it exists first.
	    tocbot.destroy()
	
	    // Get headings array.
	    headingsArray = parseContent.selectHeadings(options.contentSelector, options.headingSelector)
	    // Return if no headings are found.
	    if (headingsArray === null) {
	      return
	    }
	
	    // Build nested headings array.
	    var nestedHeadingsObj = parseContent.nestHeadingsArray(headingsArray)
	    var nestedHeadings = nestedHeadingsObj.nest
	
	    // Render.
	    buildHtml.render(options.tocSelector, nestedHeadings)
	
	    // Update Sidebar and bind listeners.
	    this._scrollListener = throttle(function (e) {
	      buildHtml.updateToc(headingsArray)
	      var isTop = e && e.target && e.target.scrollingElement && e.target.scrollingElement.scrollTop === 0
	      if ((e && e.eventPhase === 0) || isTop) {
	        buildHtml.enableTocAnimation()
	        buildHtml.updateToc(headingsArray)
	        if (options.scrollEndCallback) {
	          options.scrollEndCallback(e)
	        }
	      }
	    }, options.throttleTimeout)
	    this._scrollListener()
	    document.addEventListener('scroll', this._scrollListener, false)
	    document.addEventListener('resize', this._scrollListener, false)
	
	    // Bind click listeners to disable animation.
	    this._clickListener = throttle(function (event) {
	      if (options.smoothScroll) {
	        buildHtml.disableTocAnimation(event)
	      }
	      buildHtml.updateToc(headingsArray)
	    }, options.throttleTimeout)
	    document.addEventListener('click', this._clickListener, false)
	
	    return this
	  }
	
	  /**
	   * Refresh tocbot.
	   */
	  tocbot.refresh = function (customOptions) {
	    tocbot.destroy()
	    tocbot.init(customOptions || this.options)
	  }
	
	  // Make tocbot available globally.
	  root.tocbot = tocbot
	
	  return tocbot
	})
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/*!***********************************!*\
  !*** ./src/js/default-options.js ***!
  \***********************************/
/***/ function(module, exports) {

	module.exports = {
	  // Where to render the table of contents.
	  tocSelector: '.js-toc',
	  // Where to grab the headings to build the table of contents.
	  contentSelector: '.js-toc-content',
	  // Which headings to grab inside of the contentSelector element.
	  headingSelector: 'h1, h2, h3',
	  // Headings that match the ignoreSelector will be skipped.
	  ignoreSelector: '.js-toc-ignore',
	  // Main class to add to links.
	  linkClass: 'toc-link',
	  // Extra classes to add to links.
	  extraLinkClasses: '',
	  // Class to add to active links,
	  // the link corresponding to the top most heading on the page.
	  activeLinkClass: 'is-active-link',
	  // Main class to add to lists.
	  listClass: 'toc-list',
	  // Extra classes to add to lists.
	  extraListClasses: '',
	  // Class that gets added when a list should be collapsed.
	  isCollapsedClass: 'is-collapsed',
	  // Class that gets added when a list should be able
	  // to be collapsed but isn't necessarily collpased.
	  collapsibleClass: 'is-collapsible',
	  // Class to add to list items.
	  listItemClass: 'toc-list-item',
	  // whether additional classes should be copied from the heading
	  copyListItemClassesFromHeading: false,
	  // How many heading levels should not be collpased.
	  // For example, number 6 will show everything since
	  // there are only 6 heading levels and number 0 will collpase them all.
	  // The sections that are hidden will open
	  // and close as you scroll to headings within them.
	  collapseDepth: 0,
	  // Smooth scrolling enabled.
	  smoothScroll: true,
	  // Smooth scroll duration.
	  smoothScrollDuration: 420,
	  // Callback for scroll end (requires: smoothScroll).
	  scrollEndCallback: function (e) {},
	  // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
	  headingsOffset: 0,
	  // Timeout between events firing to make sure it's
	  // not too rapid (for performance reasons).
	  throttleTimeout: 50,
	  // Element to add the positionFixedClass to.
	  positionFixedSelector: null,
	  // Fixed position class to add to make sidebar fixed after scrolling
	  // down past the fixedSidebarOffset.
	  positionFixedClass: 'is-position-fixed',
	  // fixedSidebarOffset can be any number but by default is set
	  // to auto which sets the fixedSidebarOffset to the sidebar
	  // element's offsetTop from the top of the document on init.
	  fixedSidebarOffset: 'auto',
	  // includeHtml can be set to true to include the HTML markup from the
	  // heading node instead of just including the textContent.
	  includeHtml: false
	}


/***/ },
/* 2 */
/*!******************************!*\
  !*** ./src/js/build-html.js ***!
  \******************************/
/***/ function(module, exports) {

	/**
	 * This file is responsible for building the DOM and updating DOM state.
	 *
	 * @author Tim Scanlin
	 */
	
	module.exports = function (options) {
	  var forEach = [].forEach
	  var some = [].some
	  var body = document.body
	  var currentlyHighlighting = true
	  var SPACE_CHAR = ' '
	
	  /**
	   * Create link and list elements.
	   * @param {Object} d
	   * @param {HTMLElement} container
	   * @return {HTMLElement}
	   */
	  function createEl (d, container) {
	    var link = container.appendChild(createLink(d))
	    if (d.children.length) {
	      var list = createList(d.isCollapsed)
	      d.children.forEach(function (child) {
	        createEl(child, list)
	      })
	      link.appendChild(list)
	    }
	  }
	
	  /**
	   * Render nested heading array data into a given selector.
	   * @param {String} selector
	   * @param {Array} data
	   * @return {HTMLElement}
	   */
	  function render (selector, data) {
	    var collapsed = false
	    var container = createList(collapsed)
	
	    data.forEach(function (d) {
	      createEl(d, container)
	    })
	
	    var parent = document.querySelector(selector)
	
	    // Return if no parent is found.
	    if (parent === null) {
	      return
	    }
	
	    // Remove existing child if it exists.
	    if (parent.firstChild) {
	      parent.removeChild(parent.firstChild)
	    }
	
	    // Append the Elements that have been created;
	    return parent.appendChild(container)
	  }
	
	  /**
	   * Create link element.
	   * @param {Object} data
	   * @return {HTMLElement}
	   */
	  function createLink(data) {
	    var item = document.createElement('li');
	    var a = document.createElement('a');
	    var classString;
	    if (options.listItemClass) {
	      item.setAttribute('class', options.listItemClass)
	    }
	    if (options.includeHtml && data.childNodes.length) {
	      forEach.call(data.childNodes, function (node) {
	        a.appendChild(node.cloneNode(true))
	      })
	    } else {
	      // Default behavior.
	      a.textContent = data.textContent
	    }
	    classString = options.linkClass
	      + SPACE_CHAR + 'node-name--' + data.nodeName
	      + SPACE_CHAR + options.extraLinkClasses;
	    if (options.copyListItemClassesFromHeading && data.className) {
	      classString += SPACE_CHAR + data.className;
	    }
	    // Property for smooth-scroll.
	    a.setAttribute('data-scroll', '');
	    a.setAttribute('href', '#' + data.id);
	    a.setAttribute('class', options.linkClass +
	      SPACE_CHAR + 'node-name--' + data.nodeName +
	      SPACE_CHAR + options.extraLinkClasses)
	    item.appendChild(a)
	    return item
	  }
	
	  /**
	   * Create list element.
	   * @param {Boolean} isCollapsed
	   * @return {HTMLElement}
	   */
	  function createList (isCollapsed) {
	    var list = document.createElement('ul')
	    var classes = options.listClass +
	      SPACE_CHAR + options.extraListClasses
	    if (isCollapsed) {
	      classes += SPACE_CHAR + options.collapsibleClass
	      classes += SPACE_CHAR + options.isCollapsedClass
	    }
	    list.setAttribute('class', classes)
	    return list
	  }
	
	  /**
	   * Update fixed sidebar class.
	   * @return {HTMLElement}
	   */
	  function updateFixedSidebarClass () {
	    var top = document.documentElement.scrollTop || body.scrollTop
	    var posFixedEl = document.querySelector(options.positionFixedSelector)
	
	    if (options.fixedSidebarOffset === 'auto') {
	      options.fixedSidebarOffset = document.querySelector(options.tocSelector).offsetTop
	    }
	
	    if (top > options.fixedSidebarOffset) {
	      if (posFixedEl.className.indexOf(options.positionFixedClass) === -1) {
	        posFixedEl.className += SPACE_CHAR + options.positionFixedClass
	      }
	    } else {
	      posFixedEl.className = posFixedEl.className.split(SPACE_CHAR + options.positionFixedClass).join('')
	    }
	  }
	
	  /**
	   * Update TOC highlighting and collpased groupings.
	   */
	  function updateToc (headingsArray) {
	    var top = document.documentElement.scrollTop || body.scrollTop
	
	    // Add fixed class at offset;
	    if (options.positionFixedSelector) {
	      updateFixedSidebarClass()
	    }
	
	    // Get the top most heading currently visible on the page so we know what to highlight.
	    var headings = headingsArray
	    var topHeader
	    // Using some instead of each so that we can escape early.
	    if (currentlyHighlighting &&
	      document.querySelector(options.tocSelector) !== null &&
	      headings.length > 0) {
	      some.call(headings, function (heading, i) {
	        if (heading.offsetTop > top + options.headingsOffset + 10) {
	          // Don't allow negative index value.
	          var index = (i === 0) ? i : i - 1
	          topHeader = headings[index]
	          return true
	        } else if (i === headings.length - 1) {
	          // This allows scrolling for the last heading on the page.
	          topHeader = headings[headings.length - 1]
	          return true
	        }
	      })
	
	      // Remove the active class from the other tocLinks.
	      var tocLinks = document.querySelector(options.tocSelector)
	        .querySelectorAll('.' + options.linkClass)
	      forEach.call(tocLinks, function (tocLink) {
	        tocLink.className = tocLink.className.split(SPACE_CHAR + options.activeLinkClass).join('')
	      })
	
	      // Add the active class to the active tocLink.
	      var activeTocLink = document.querySelector(options.tocSelector)
	        .querySelector('.' + options.linkClass +
	          '.node-name--' + topHeader.nodeName +
	          '[href="#' + topHeader.id + '"]')
	      activeTocLink.className += SPACE_CHAR + options.activeLinkClass
	
	      var tocLists = document.querySelector(options.tocSelector)
	        .querySelectorAll('.' + options.listClass + '.' + options.collapsibleClass)
	
	      // Collapse the other collapsible lists.
	      forEach.call(tocLists, function (list) {
	        var collapsedClass = SPACE_CHAR + options.isCollapsedClass
	        if (list.className.indexOf(collapsedClass) === -1) {
	          list.className += SPACE_CHAR + options.isCollapsedClass
	        }
	      })
	
	      // Expand the active link's collapsible list and its sibling if applicable.
	      if (activeTocLink.nextSibling) {
	        activeTocLink.nextSibling.className = activeTocLink.nextSibling.className.split(SPACE_CHAR + options.isCollapsedClass).join('')
	      }
	      removeCollapsedFromParents(activeTocLink.parentNode.parentNode)
	    }
	  }
	
	  /**
	   * Remove collpased class from parent elements.
	   * @param {HTMLElement} element
	   * @return {HTMLElement}
	   */
	  function removeCollapsedFromParents (element) {
	    if (element.className.indexOf(options.collapsibleClass) !== -1) {
	      element.className = element.className.split(SPACE_CHAR + options.isCollapsedClass).join('')
	      return removeCollapsedFromParents(element.parentNode.parentNode)
	    }
	    return element
	  }
	
	  /**
	   * Disable TOC Animation when a link is clicked.
	   * @param {Event} event
	   */
	  function disableTocAnimation (event) {
	    var target = event.target || event.srcElement
	    if (typeof target.className !== 'string' || target.className.indexOf(options.linkClass) === -1) {
	      return
	    }
	    // Bind to tocLink clicks to temporarily disable highlighting
	    // while smoothScroll is animating.
	    currentlyHighlighting = false
	  }
	
	  /**
	   * Enable TOC Animation.
	   */
	  function enableTocAnimation () {
	    currentlyHighlighting = true
	  }
	
	  return {
	    enableTocAnimation: enableTocAnimation,
	    disableTocAnimation: disableTocAnimation,
	    render: render,
	    updateToc: updateToc
	  }
	}


/***/ },
/* 3 */
/*!*********************************!*\
  !*** ./src/js/parse-content.js ***!
  \*********************************/
/***/ function(module, exports) {

	/**
	 * This file is responsible for parsing the content from the DOM and making
	 * sure data is nested properly.
	 *
	 * @author Tim Scanlin
	 */
	
	module.exports = function parseContent (options) {
	  var reduce = [].reduce
	
	  /**
	   * Get the last item in an array and return a reference to it.
	   * @param {Array} array
	   * @return {Object}
	   */
	  function getLastItem (array) {
	    return array[array.length - 1]
	  }
	
	  /**
	   * Get heading level for a heading dom node.
	   * @param {HTMLElement} heading
	   * @return {Number}
	   */
	  function getHeadingLevel (heading) {
	    return +heading.nodeName.split('H').join('')
	  }
	
	  /**
	   * Get important properties from a heading element and store in a plain object.
	   * @param {HTMLElement} heading
	   * @return {Object}
	   */
	  function getHeadingObject (heading) {
	    var obj = {
	      id: heading.id,
	      children: [],
	      className: heading.className,
	      nodeName: heading.nodeName,
	      headingLevel: getHeadingLevel(heading),
	      textContent: heading.textContent.trim()
	    }
	
	    if (options.includeHtml) {
	      obj.childNodes = heading.childNodes
	    }
	
	    return obj
	  }
	
	  /**
	   * Add a node to the nested array.
	   * @param {Object} node
	   * @param {Array} nest
	   * @return {Array}
	   */
	  function addNode (node, nest) {
	    var obj = getHeadingObject(node)
	    var level = getHeadingLevel(node)
	    var array = nest
	    var lastItem = getLastItem(array)
	    var lastItemLevel = lastItem
	      ? lastItem.headingLevel
	      : 0
	    var counter = level - lastItemLevel
	
	    while (counter > 0) {
	      lastItem = getLastItem(array)
	      if (lastItem && lastItem.children !== undefined) {
	        array = lastItem.children
	      }
	      counter--
	    }
	
	    if (level >= options.collapseDepth) {
	      obj.isCollapsed = true
	    }
	
	    array.push(obj)
	    return array
	  }
	
	  /**
	   * Select headings in content area, exclude any selector in options.ignoreSelector
	   * @param {String} contentSelector
	   * @param {Array} headingSelector
	   * @return {Array}
	   */
	  function selectHeadings (contentSelector, headingSelector) {
	    var selectors = headingSelector
	    if (options.ignoreSelector) {
	      selectors = headingSelector.split(',')
	        .map(function mapSelectors (selector) {
	          return selector.trim() + ':not(' + options.ignoreSelector + ')'
	        })
	    }
	    try {
	      return document.querySelector(contentSelector)
	        .querySelectorAll(selectors)
	    } catch (e) {
	      console.warn('Element not found: ' + contentSelector); // eslint-disable-line
	      return null
	    }
	  }
	
	  /**
	   * Nest headings array into nested arrays with 'children' property.
	   * @param {Array} headingsArray
	   * @return {Object}
	   */
	  function nestHeadingsArray (headingsArray) {
	    return reduce.call(headingsArray, function reducer (prev, curr) {
	      var currentHeading = getHeadingObject(curr)
	
	      addNode(currentHeading, prev.nest)
	      return prev
	    }, {
	      nest: []
	    })
	  }
	
	  return {
	    nestHeadingsArray: nestHeadingsArray,
	    selectHeadings: selectHeadings
	  }
	}


/***/ },
/* 4 */
/*!**********************************!*\
  !*** ./~/zenscroll/zenscroll.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Zenscroll 4.0.0
	 * https://github.com/zengabor/zenscroll/
	 *
	 * Copyright 2015–2017 Gabor Lenard
	 *
	 * This is free and unencumbered software released into the public domain.
	 * 
	 * Anyone is free to copy, modify, publish, use, compile, sell, or
	 * distribute this software, either in source code form or as a compiled
	 * binary, for any purpose, commercial or non-commercial, and by any
	 * means.
	 * 
	 * In jurisdictions that recognize copyright laws, the author or authors
	 * of this software dedicate any and all copyright interest in the
	 * software to the public domain. We make this dedication for the benefit
	 * of the public at large and to the detriment of our heirs and
	 * successors. We intend this dedication to be an overt act of
	 * relinquishment in perpetuity of all present and future rights to this
	 * software under copyright law.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	 * OTHER DEALINGS IN THE SOFTWARE.
	 * 
	 * For more information, please refer to <http://unlicense.org>
	 * 
	 */
	
	/*jshint devel:true, asi:true */
	
	/*global define, module */
	
	
	(function (root, factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory()), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
		} else if (typeof module === "object" && module.exports) {
			module.exports = factory()
		} else {
			(function install() {
				// To make sure Zenscroll can be referenced from the header, before `body` is available
				if (document && document.body) {
					root.zenscroll = factory()
				} else {
					// retry 9ms later
					setTimeout(install, 9)
				}
			})()
		}
	}(this, function () {
		"use strict"
	
	
		// Detect if the browser already supports native smooth scrolling (e.g., Firefox 36+ and Chrome 49+) and it is enabled:
		var isNativeSmoothScrollEnabledOn = function (elem) {
			return ("getComputedStyle" in window) &&
				window.getComputedStyle(elem)["scroll-behavior"] === "smooth"
		}
	
	
		// Exit if it’s not a browser environment:
		if (typeof window === "undefined" || !("document" in window)) {
			return {}
		}
	
	
		var makeScroller = function (container, defaultDuration, edgeOffset) {
	
			// Use defaults if not provided
			defaultDuration = defaultDuration || 999 //ms
			if (!edgeOffset && edgeOffset !== 0) {
				// When scrolling, this amount of distance is kept from the edges of the container:
				edgeOffset = 9 //px
			}
	
			// Handling the life-cycle of the scroller
			var scrollTimeoutId
			var setScrollTimeoutId = function (newValue) {
				scrollTimeoutId = newValue
			}
	
			/**
			 * Stop the current smooth scroll operation immediately
			 */
			var stopScroll = function () {
				clearTimeout(scrollTimeoutId)
				setScrollTimeoutId(0)
			}
	
			var getTopWithEdgeOffset = function (elem) {
				return Math.max(0, container.getTopOf(elem) - edgeOffset)
			}
	
			/**
			 * Scrolls to a specific vertical position in the document.
			 *
			 * @param {targetY} The vertical position within the document.
			 * @param {duration} Optionally the duration of the scroll operation.
			 *        If not provided the default duration is used.
			 * @param {onDone} An optional callback function to be invoked once the scroll finished.
			 */
			var scrollToY = function (targetY, duration, onDone) {
				stopScroll()
				if (duration === 0 || (duration && duration < 0) || isNativeSmoothScrollEnabledOn(container.body)) {
					container.toY(targetY)
					if (onDone) {
						onDone()
					}
				} else {
					var startY = container.getY()
					var distance = Math.max(0, targetY) - startY
					var startTime = new Date().getTime()
					duration = duration || Math.min(Math.abs(distance), defaultDuration);
					(function loopScroll() {
						setScrollTimeoutId(setTimeout(function () {
							// Calculate percentage:
							var p = Math.min(1, (new Date().getTime() - startTime) / duration)
							// Calculate the absolute vertical position:
							var y = Math.max(0, Math.floor(startY + distance*(p < 0.5 ? 2*p*p : p*(4 - p*2)-1)))
							container.toY(y)
							if (p < 1 && (container.getHeight() + y) < container.body.scrollHeight) {
								loopScroll()
							} else {
								setTimeout(stopScroll, 99) // with cooldown time
								if (onDone) {
									onDone()
								}
							}
						}, 9))
					})()
				}
			}
	
			/**
			 * Scrolls to the top of a specific element.
			 *
			 * @param {elem} The element to scroll to.
			 * @param {duration} Optionally the duration of the scroll operation.
			 * @param {onDone} An optional callback function to be invoked once the scroll finished.
			 */
			var scrollToElem = function (elem, duration, onDone) {
				scrollToY(getTopWithEdgeOffset(elem), duration, onDone)
			}
	
			/**
			 * Scrolls an element into view if necessary.
			 *
			 * @param {elem} The element.
			 * @param {duration} Optionally the duration of the scroll operation.
			 * @param {onDone} An optional callback function to be invoked once the scroll finished.
			 */
			var scrollIntoView = function (elem, duration, onDone) {
				var elemHeight = elem.getBoundingClientRect().height
				var elemBottom = container.getTopOf(elem) + elemHeight
				var containerHeight = container.getHeight()
				var y = container.getY()
				var containerBottom = y + containerHeight
				if (getTopWithEdgeOffset(elem) < y || (elemHeight + edgeOffset) > containerHeight) {
					// Element is clipped at top or is higher than screen.
					scrollToElem(elem, duration, onDone)
				} else if ((elemBottom + edgeOffset) > containerBottom) {
					// Element is clipped at the bottom.
					scrollToY(elemBottom - containerHeight + edgeOffset, duration, onDone)
				} else if (onDone) {
					onDone()
				}
			}
	
			/**
			 * Scrolls to the center of an element.
			 *
			 * @param {elem} The element.
			 * @param {duration} Optionally the duration of the scroll operation.
			 * @param {offset} Optionally the offset of the top of the element from the center of the screen.
			 * @param {onDone} An optional callback function to be invoked once the scroll finished.
			 */
			var scrollToCenterOf = function (elem, duration, offset, onDone) {
				scrollToY(Math.max(0, container.getTopOf(elem) - container.getHeight()/2 + (offset || elem.getBoundingClientRect().height/2)), duration, onDone)
			}
	
			/**
			 * Changes default settings for this scroller.
			 *
			 * @param {newDefaultDuration} Optionally a new value for default duration, used for each scroll method by default.
			 *        Ignored if null or undefined.
			 * @param {newEdgeOffset} Optionally a new value for the edge offset, used by each scroll method by default. Ignored if null or undefined.
			 * @returns An object with the current values.
			 */
			var setup = function (newDefaultDuration, newEdgeOffset) {
				if (newDefaultDuration === 0 || newDefaultDuration) {
					defaultDuration = newDefaultDuration
				}
				if (newEdgeOffset === 0 || newEdgeOffset) {
					edgeOffset = newEdgeOffset
				}
				return {
					defaultDuration: defaultDuration,
					edgeOffset: edgeOffset
				}
			}
	
			return {
				setup: setup,
				to: scrollToElem,
				toY: scrollToY,
				intoView: scrollIntoView,
				center: scrollToCenterOf,
				stop: stopScroll,
				moving: function () { return !!scrollTimeoutId },
				getY: container.getY,
				getTopOf: container.getTopOf
			}
	
		}
	
	
		var docElem = document.documentElement
		var getDocY = function () { return window.scrollY || docElem.scrollTop }
	
		// Create a scroller for the document:
		var zenscroll = makeScroller({
			body: document.scrollingElement || document.body,
			toY: function (y) { window.scrollTo(0, y) },
			getY: getDocY,
			getHeight: function () { return window.innerHeight || docElem.clientHeight },
			getTopOf: function (elem) { return elem.getBoundingClientRect().top + getDocY() - docElem.offsetTop }
		})
	
	
		/**
		 * Creates a scroller from the provided container element (e.g., a DIV)
		 *
		 * @param {scrollContainer} The vertical position within the document.
		 * @param {defaultDuration} Optionally a value for default duration, used for each scroll method by default.
		 *        Ignored if 0 or null or undefined.
		 * @param {edgeOffset} Optionally a value for the edge offset, used by each scroll method by default. 
		 *        Ignored if null or undefined.
		 * @returns A scroller object, similar to `zenscroll` but controlling the provided element.
		 */
		zenscroll.createScroller = function (scrollContainer, defaultDuration, edgeOffset) {
			return makeScroller({
				body: scrollContainer,
				toY: function (y) { scrollContainer.scrollTop = y },
				getY: function () { return scrollContainer.scrollTop },
				getHeight: function () { return Math.min(scrollContainer.clientHeight, window.innerHeight || docElem.clientHeight) },
				getTopOf: function (elem) { return elem.offsetTop }
			}, defaultDuration, edgeOffset)
		}
	
	
		// Automatic link-smoothing on achors
		// Exclude IE8- or when native is enabled or Zenscroll auto- is disabled
		if ("addEventListener" in window && !window.noZensmooth && !isNativeSmoothScrollEnabledOn(document.body)) {
	
	
			var isScrollRestorationSupported = "scrollRestoration" in history
	
			// On first load & refresh make sure the browser restores the position first
			if (isScrollRestorationSupported) {
				history.scrollRestoration = "auto"
			}
	
			window.addEventListener("load", function () {
	
				if (isScrollRestorationSupported) {
					// Set it to manual
					setTimeout(function () { history.scrollRestoration = "manual" }, 9)
					window.addEventListener("popstate", function (event) {
						if (event.state && "zenscrollY" in event.state) {
							zenscroll.toY(event.state.zenscrollY)
						}
					}, false)
				}
	
				// Add edge offset on first load if necessary
				// This may not work on IE (or older computer?) as it requires more timeout, around 100 ms
				if (window.location.hash) {
					setTimeout(function () {
						// Adjustment is only needed if there is an edge offset:
						var edgeOffset = zenscroll.setup().edgeOffset
						if (edgeOffset) {
							var targetElem = document.getElementById(window.location.href.split("#")[1])
							if (targetElem) {
								var targetY = Math.max(0, zenscroll.getTopOf(targetElem) - edgeOffset)
								var diff = zenscroll.getY() - targetY
								// Only do the adjustment if the browser is very close to the element:
								if (0 <= diff && diff < 9 ) {
									window.scrollTo(0, targetY)
								}
							}
						}
					}, 9)
				}
	
			}, false)
	
			// Handling clicks on anchors
			var RE_noZensmooth = new RegExp("(^|\\s)noZensmooth(\\s|$)")
			window.addEventListener("click", function (event) {
				var anchor = event.target
				while (anchor && anchor.tagName !== "A") {
					anchor = anchor.parentNode
				}
				// Let the browser handle the click if it wasn't with the primary button, or with some modifier keys:
				if (!anchor || event.which !== 1 || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
					return
				}
				// Save the current scrolling position so it can be used for scroll restoration:
				if (isScrollRestorationSupported) {
					try {
						history.replaceState({ zenscrollY: zenscroll.getY() }, "")
					} catch (e) {
						// Avoid the Chrome Security exception on file protocol, e.g., file://index.html
					}
				}
				// Find the referenced ID:
				var href = anchor.getAttribute("href") || ""
				if (href.indexOf("#") === 0 && !RE_noZensmooth.test(anchor.className)) {
					var targetY = 0
					var targetElem = document.getElementById(href.substring(1))
					if (href !== "#") {
						if (!targetElem) {
							// Let the browser handle the click if the target ID is not found.
							return
						}
						targetY = zenscroll.getTopOf(targetElem)
					}
					event.preventDefault()
					// By default trigger the browser's `hashchange` event...
					var onDone = function () { window.location = href }
					// ...unless there is an edge offset specified
					var edgeOffset = zenscroll.setup().edgeOffset
					if (edgeOffset) {
						targetY = Math.max(0, targetY - edgeOffset)
						onDone = function () { history.pushState(null, "", href) }
					}
					zenscroll.toY(targetY, null, onDone)
				}
			}, false)
	
		}
	
	
		return zenscroll
	
	
	}));


/***/ }
/******/ ]);
//# sourceMappingURL=tocbot.js.map
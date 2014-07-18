/*!
 * reveal.js
 * http://lab.hakim.se/reveal-js
 * MIT licensed
 *
 * Copyright (C) 2014 Hakim El Hattab, http://hakim.se
 */

(function ( window, factory ) {

    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        // Expose a factory as module.exports in loaders that implement the Node
        // module pattern (including browserify).
        // This accentuates the need for a real window in the environment
        // e.g. var jQuery = require('jquery')(window);
        module.exports = function( w ) {
            w = w || window;
            if ( !w.document ) {
                throw new Error('RevealJS requires a window with a document');
            }
            return factory( w, w.document );
        };
    } else {
        if ( typeof define === 'function' && define.amd ) {
            // AMD. Register as a named module.
            define( [], function () {
                return factory(window, document);
            });
        } else {
            // Browser globals
            window.Reveal = factory(window, document);
        }
    }

// Pass this, window may not be defined yet
}(this, function ( window, document, undefined ) {

    'use strict';

    // these *_SELECTOR defines are all `dom.wrapper` based, which explains why they won't have the `.reveal` root/wrapper DIV class in them:
	var SLIDES_SELECTOR = '.slides > section, .slides > section > section',
		HORIZONTAL_SLIDES_SELECTOR = '.slides > section',
		VERTICAL_SLIDES_SELECTOR = '.slides > section.present > section',
		HOME_SLIDE_SELECTOR = '.slides > section:first-of-type',
        FRAGMENTS_SELECTOR = '.slides > section .fragment',
        LINKS_SELECTOR = '.slides a',
        ROLLING_LINKS_SELECTOR = '.slides a.roll';
    // this *_SELECTOR define is (horizontal) slide `section` selection based:
    var SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR = ':scope > section',
        SLIDE_NO_DISPLAY_DISTANCE = 1;

    var nil_function = function () {};

    var Reveal = null,

        // Configurations defaults, can be overridden at initialization time
        config = {

            // The 'normal' size of the presentation, aspect ratio will be preserved
            // when the presentation is scaled to fit different resolutions
            width: '100%', //960,
            height: '100%', //700,

            // Dimensions of the content when produced onto printed media
            printWidth: 1122 /* 2974 */,
            printHeight: 867 /* 2159 */,

            // Factor of the display size that should remain empty around the content
            margin: 0.05,

            // Bounds for smallest/largest possible scale to apply to content
            minScale: 0.05,
            maxScale: 1.0,

            // Bounds for smallest/largest possible scale to apply to overview display
            overviewMinScale: 0.01,
            overviewMaxScale: 1.0,

            // {boolean} Display controls in the bottom right corner
            controls: true,

            // {boolean} Display a presentation progress bar
            progress: true,

            // Display a subtle timer bar (time is in minutes)
            timeRemaining: 0,

            // {boolean} Display the page number of the current slide
            slideNumber: false,

            // {boolean} Push each slide change to the browser history
            history: false,

            // Enable keyboard shortcuts for navigation
            keyboard: true,

            // Optional function that blocks keyboard events when returning false
            keyboardCondition: nil_function,

            // {boolean} Enable the slide overview mode
            overview: true,

            // {boolean} Vertical centering of slides
            center: true,

            // {boolean} Enables touch navigation on devices with touch input
            touch: true,

            // {boolean} Loop the presentation
            loop: false,

            // {boolean} Change the presentation direction to be RTL
            rtl: false,

            // {boolean} Turns fragments on and off globally
            fragments: true,

            // {boolean} Flags if the presentation is running in an embedded mode,
            // i.e. contained within a limited portion of the screen
            embedded: false,

			// Flags if we should show a help overlay when the '?' questionmark
			// key is pressed
			help: true,

            // Number of milliseconds between automatically proceeding to the
            // next slide, disabled when set to 0, this value can be overwritten
            // by using a data-autoslide attribute on your slides
            autoSlide: 0,

            // {boolean} Stop auto-sliding after user input
            autoSlideStoppable: true,

            // {boolean} Enable slide navigation via mouse wheel
            mouseWheel: false,

            // {boolean} Apply a 3D roll to links on hover
            rollingLinks: false,

            // {boolean} Hides the address bar on mobile devices
            hideAddressBar: true,

            // {boolean} Opens links in an iframe preview overlay
            previewLinks: false,

            // {boolean} Exposes the reveal.js API through window.postMessage
            postMessage: true,

            // {boolean} Dispatches all reveal.js events to the parent window through postMessage
            postMessageEvents: false,

            // {boolean} Focuses body when page changes visibility to ensure keyboard shortcuts work
            focusBodyOnPageVisibilityChange: true,

            // Theme (see /css/theme)
            theme: null,

            // Transition style
            transition: 'default', // default/cube/page/slide/concave/convex/zoom/linear/fade/none

            // Transition speed
            transitionSpeed: 'default', // default/fast/slow

            // Transition style for full page slide backgrounds
            backgroundTransition: 'default', // default/cube/page/slide/concave/convex/zoom/linear/fade/none

            // number of milliseconds the CSS transitions will take when navigating the deck, worst case
            transitionMaxDuration: 3000,

            // Parallax background image
            parallaxBackgroundImage: '', // CSS syntax, e.g. 'a.jpg'

            // // Parallax background size [DEPRECATED]
            // parallaxBackgroundSize: '', // CSS syntax, e.g. '3000px 2000px'

            // Number of slides away from the current that are visible in overview mode
            viewDistance: 6,

            // Script dependencies to load
            dependencies: []

        },

        // Flags if reveal.js is loaded (has dispatched the 'ready' event)
        loaded = false,

        // The horizontal and vertical index of the currently active slide
        indexh /* = undefined */,
        indexv /* = undefined */,

        // The previous and current slide HTML elements
        previousSlide = null,
        currentSlide /* = undefined */,

        previousBackground,

        // Slides may hold a data-state attribute which we pick up and apply
        // as a class to the body. This list contains the combined state of
        // all current slides.
        state = [],

        // contains the overview info (number of H/V slides, ...)
        overview_slides_info = null,

        // The current scale of the presentation (see width/height config)
        scale = 1,

        // Cached references to DOM elements
        dom = {},

        // Features supported by the browser, see #checkCapabilities()
        features = {},

        // Client is a mobile device, see #checkCapabilities()
        isMobileDevice,

        // Use Zoom fallback, see #checkCapabilities()
        useZoomFallback,

        // queue for event registrations which arrive while Reveal has not yet completely initialized:
        queuedEventListenerRegistrations = [],

        // Throttles mouse wheel navigation
        lastMouseWheelStep = 0,

        // Delays updates to the URL due to a Chrome thumbnailer bug
        writeURLTimeout = 0,

        // Registers what the viewDistance settings are for the present overview
        currentOverviewInfo = null,

        // {setTimeout handler} A delay used to activate the overview mode
        // activateOverviewTimeout = null,

        // {setTimeout handler} A delay used to deactivate the overview mode
        deactivateOverviewTimeout = null,

        // {setTimeout handler} A delay used to hide next/previous slides in the deck after the transition to the new current slide has completed.
        transitionMaxDurationTimeout = null,

        // Flags if the interaction event listeners are bound
        eventsAreBound = false,

        // The current auto-slide duration
        autoSlide = 0,

        // Auto slide properties
        autoSlidePlayer,
        autoSlideTimeout = 0,
        autoSlideStartTime = -1,
        autoSlidePaused = false,

        // Holds information about the currently ongoing touch input
        touch = {
            startX: 0,
            startY: 0,
            startSpan: 0,
            startCount: 0,
            captured: false,
            threshold: 40
		},

		// Holds information about the keyboard shortcuts
		keyboardShortcuts = {
			'N  ,  SPACE':			'Next slide',
			'P':					'Previous slide',
			'&#8592;  ,  H':		'Navigate left',
			'&#8594;  ,  L':		'Navigate right',
			'&#8593;  ,  K':		'Navigate up',
			'&#8595;  ,  J':		'Navigate down',
			'Home':					'First slide',
			'End':					'Last slide',
			'B  ,  .':				'Pause',
			'F':					'Fullscreen',
			'ESC, O':				'Slide overview'
        };

    /*
     * debug /test assistant
     */
    function assert( condition ) {
        if (typeof window.assert === 'function') {
            return window.assert(condition);
        } else if (!condition) {
            msg = Array.prototype.slice.call(arguments, 1).join(' ').trim();
            if (console && console.log) {
                console.log('@@@@@@ assertion failed: ', arguments, (msg || ''));
            }
            if (window.QUnit.begin) {
                throw new Error('ASSERTION failed' + (msg ? ': ' + msg : ''));
            } else if (window.invoke_debugger !== false) {
                debugger;
            }
        }
        return !!condition;
    }


    /**
     * Starts up the presentation if the client is capable.
     *
     * Return FALSE when the function failed to run to completion.
     */
    function initialize( options ) {

        if ( !document.body ) {
            return false;
        }

        checkCapabilities();

        dom.viewport = document.querySelector( '.reveal-viewport' );

        // If there's no viewport defined use the body element
        if( !dom.viewport ) {
            dom.viewport = document.body;
            if (!dom.viewport.classList.contains('reveal-viewport')) {
                dom.viewport.classList.add('reveal-viewport');
            }
        }

		// Since JS won't be running any further, we need to load all
		// images that were intended to lazy load now
		var images = document.getElementsByTagName( 'img' );
		for( var i = 0, len = images.length; i < len; i++ ) {
			var image = images[i];
			if( image.getAttribute( 'data-src' ) ) {
				image.setAttribute( 'src', image.getAttribute( 'data-src' ) );
				image.removeAttribute( 'data-src' );
			}
		}

        // If the browser doesn't support core features we won't be
        // using JavaScript to control the presentation
        // and we fall back to a JavaScript-free mode without transforms
        if( !features.transforms2d && !features.transforms3d ) {
            if (!dom.viewport.classList.contains('no-transforms')) {
                dom.viewport.classList.add('no-transforms');
            }
            return true;
        }
    
		//dom.wrapper = document.querySelector( '.reveal' );
		//dom.slides = document.querySelector( '.reveal .slides' );

        // Force a layout when the whole page, incl fonts, has loaded
        window.addEventListener( 'load', layout, false );

        var query = Reveal.getQueryHash();

        // Do not accept new dependencies via query config 
        // (which may specify user-defined JavaScript code) to avoid
        // the potential of malicious script injection. Same goes for
        // keyboardCondition option which can be used to inject 
        // malicious code.
        //
        // Note: 
        // This is a blacklist approach; a better way is to 
        // whitelist the ones that are okay. 
        // See the augmented extend() function below.
        if( typeof query.dependencies !== 'undefined' ) delete query.dependencies;

        // Copy options over to our config object
        extend( config, options );
        extend( config, query, function( fieldname ) {
            // filter 1: only accept query parameters which do already exist in our `config` object.
            //
            // filter 2: only accept query parameters which do not contain executable JavaScript code.
            return typeof config[fieldname] !== 'undefined'
                && typeof config[fieldname] !== 'function';
        } );

        // Hide the address bar in mobile browsers
        hideAddressBar();

        // Loads the dependencies and continues to #start() once done
        return load();

    }

    /**
     * Inspect the client to see what it's capable of, this
     * should only happens once per runtime.
     */
    function checkCapabilities() {

        features.transforms3d = 'WebkitPerspective' in document.body.style ||
                                'MozPerspective' in document.body.style ||
                                'msPerspective' in document.body.style ||
                                'OPerspective' in document.body.style ||
                                'perspective' in document.body.style;

        features.transforms2d = 'WebkitTransform' in document.body.style ||
                                'MozTransform' in document.body.style ||
                                'msTransform' in document.body.style ||
                                'OTransform' in document.body.style ||
                                'transform' in document.body.style;

        features.requestAnimationFrameMethod = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        features.requestAnimationFrame = typeof features.requestAnimationFrameMethod === 'function';

        features.canvas = !!document.createElement( 'canvas' ).getContext;

		features.touch = !!( 'ontouchstart' in window );

        // See http://davidwalsh.name/vendor-prefix
        features.vendorPrefix = (function () {
          var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice
              .call(styles)
              .join('') 
              .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
            )[1],
            dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
          return {
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: pre[0].toUpperCase() + pre.substr(1)
          };
        })();

		isMobileDevice = navigator.userAgent.match( /(iphone|ipod|ipad|android)/gi );

        // Prefer zooming in desktop Chrome (and other browsers) so that content remains crisp
        // with nested transforms.
        //
        // Unfortunately, CSS3 zoom in Chrome has the very bad habit to scale text correctly only down to zoom factors of about 0.4,
        // go below that number and your text gets bigger and bigger (relatively speaking).
        // Try this at: http://jsbin.com/aluniv/3
        // Hence we must revert to using CSS3 transform scale() or scale3d() for Chrome.
        //
        // However, using CSS zoom produces a changed layout compared to a layout which is transform:scale()d, hence
        // we should enhance the layout() code further below to account for this artifact.
        var isChromeBrowser = /chrome/gi.test( navigator.userAgent ) && 0;  
        useZoomFallback = !isMobileDevice && isChromeBrowser && typeof document.createElement( 'div' ).style.zoom !== 'undefined';
    }

    /**
     * Generate a function which is retried at the given interval until it returns a truthy value.
     */
    function generateKickstarter(f, interval) {
        var timer = null;
        var kick;
        
        interval = Math.max(50, (interval || 0));

        // kick the starter until it succeeds
        kick = function() {
            clearTimeout( timer );
            timer = null;

            var rv = f();
            if ( !rv ) {
                timer = setTimeout( kick, interval );
                rv = false;
            }
            return rv;
        };

        return kick;
    }

    /**
     * Loads the dependencies of reveal.js. Dependencies are
     * defined via the configuration option 'dependencies'
     * and will be loaded prior to starting/binding reveal.js.
     * Some dependencies may have an 'async' flag, if so they
     * will load after reveal.js has been started up.
     *
     * Return FALSE when the function failed to run to completion.
     */
    function load() {

        var scriptsAsync = [],
            scriptsToPreload = 0,
            asyncScriptsToLoad = 0,
            tryStart = generateKickstarter( start, 100 );

        // Called once synchronous scripts finish loading
        //
        // Return FALSE when the function failed to run to completion.
        function proceed() {
            if( scriptsToPreload === 0 ) {
                loadAsyncScripts();

                // kick the starter until it succeeds
                tryStart();
            }
            return true;
        }

        function loadAsyncScripts() {
            asyncScriptsToLoad = scriptsAsync.length;
            for (var i = 0, len = scriptsAsync.length; i < len; i++) {
                loadOne(scriptsAsync[i]);         // making sure this instance sticks around in the require(...) closure
            }

            // closure:
            function loadOne(s) {
                require([s.src].concat(s.dependencies || []), function () {
                    // Extension may contain callback function
                    if( typeof s.callback === 'function' ) {
                        s.callback.apply( this, arguments );
                    }

                    // and check whether we got them all...
                    if (--asyncScriptsToLoad === 0) {
                        dispatchEvent( 'asyncscriptsloaded' );
                    }
                });
            }
        }

        function loadScript( s ) {
            if( !s.async ) {
                scriptsToPreload++;

                require([s.src].concat(s.dependencies || []), function () {
                    // Extension may contain callback function
                    if( typeof s.callback === 'function' ) {
                        s.callback.apply( this, arguments );
                    }

                    // async scripts may take longer, the 'synchronous' ones are required to complete loading and initializing before we can truly start:
                    if( --scriptsToPreload === 0 ) {
                        proceed();
                    }
                });
            } else {
                // make the async scripts wait till we're done loading the more important synchronous ones:
                scriptsAsync.push(s);
            }
        }

        for( var i = 0, len = config.dependencies.length; i < len; i++ ) {
            var s = config.dependencies[i];

            // Load if there's no condition or the condition is truthy
            if( s.condition == null || (s.condition && typeof s.condition !== 'function') || s.condition() ) {
                loadScript( s );
            }
        }

        return proceed();
    }



    /**
     * Starts up reveal.js by binding input events and navigating
     * to the current URL deeplink if there is one.
     *
     * Return FALSE when the function failed to run to completion.
     */
    function start( config, restarting ) {

        // Make sure we've got all the DOM elements we need
        if (!setupDOM()) return false;

        // :-(  can't detect styles that only kick in when exactly?...
        //
        // // Detect how much time we should give 'disappearing slides' when we navigate through the deck:
        // var duration = 0;
        // var s, i, len;
        // var animSet = [ dom.wrapper, dom.slides, dom.slides_wrapper ].concat( toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ) );
        // var len = animSet.length;
        //
        // for( i = 0; i < len; i++ ) {
        //     var element = animSet[i];
        //     s = getStyle( element, 'transition-duration', true );
        //     s = s.match(/(\d*\.?\d+)(m?s)/);
        //     s = parseFloat( s[1] ) * ( s[2] === 'ms' ? 1 : 1000 );
        //     duration = Math.max( duration, s );
        // }
        // slideTransitionDuration = duration;

        // Listen to messages posted to this window
        setupPostMessage();

        // Resets all vertical slides so that only the first is visible
        resetVerticalSlides();

        // set vertical slide stacks to their initial position (= top vertical slide)
        resetSlideStacks();

        // Prep the slide hierarchy so getTotalSlides(), etc. will work as expected
        prepSlideHierarchy();

        // Updates the presentation to match the current configuration values
        configure( config );

        // Read the initial hash
        readURL();

        // Update all backgrounds
        updateBackground();

        // Notify listeners that the presentation is ready but use a 1ms
        // timeout to ensure it's not fired synchronously after #initialize()
        setTimeout( function() {
            // Enable transitions now that we're loaded
            dom.slides.classList.remove( 'no-transition' );

            loaded = true;

            dispatchEvent( 'ready', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide,
                restarting: restarting
            } );
        }, 1 );

		// Special setup and config is required when printing to PDF
		if( isPrintingPDF() ) {
			removeEventListeners();

			// The document needs to have loaded for the PDF layout
			// measurements to be accurate
			if( document.readyState === 'complete' ) {
				if (!setupPDF()) {
                    return false;
                }
			}
			else {
				window.addEventListener( 'load', setupPDF );
			}
		}

        return true;
    }

    /**
     * Restarts reveal.js when a new presentation has been loaded.
     *
     * Return FALSE when the function failed to run to completion.
     */
    function restart( config ) {

        // Notify listeners that the presentation is about to restart
        dispatchEvent( 'restart:before' );

        // Clean up the remains of the previous state, if there ever was one.
        while( state.length ) {
            document.documentElement.classList.remove( state.pop() );
        }

        // Reset the important presentation values:

        // The horizontal and vertical index of the currently active slide
        indexh = undefined;
        indexv = undefined;

        // The previous and current slide HTML elements
        previousSlide = null;
        currentSlide = undefined;

        // Slides may hold a data-state attribute which we pick up and apply
        // as a class to the body. This list contains the combined state of
        // all current slides.
        state = [];

        // The current scale of the presentation (see width/height config)
        scale = 1;

        return start( config, true );
    }


    function startTimer( minutes ) {

        if ( !minutes ) return;
        dom.msRemaining = minutes * 60 * 1000;

        var stepTimer = function() {

            dom.msRemaining = dom.msRemaining - 1000;

            var totalCount = minutes * 60;
            var pastCount = totalCount - ( dom.msRemaining / 1000 );
            dom.timeRemainingBar.style.width = ( pastCount / ( totalCount - 1 ) ) * window.innerWidth + 'px';

            if ( dom.msRemaining > 0 ) setTimeout( stepTimer, 1000 );

        };

        setTimeout( stepTimer, 1000 );

    }

    /**
     * Finds and stores references to DOM elements which are
     * required by the presentation. If a required element is
     * not found, it is created.
     *
     * Return FALSE when the function failed to run to completion.
     */
    function setupDOM() {

        // Cache references to key DOM elements
        dom.theme = document.querySelector( '#theme' );
        dom.wrapper = document.querySelector( '.reveal' );
        dom.slides = document.querySelector( '.reveal .slides' );
        if (!dom.wrapper || !dom.slides) return false;

        // Prevent transitions while we're loading
        dom.slides.classList.add( 'no-transition' );

		dom.wrapper.setAttribute( 'role', 'application' );

        dom.slides_wrapper = createSingletonNode( dom.wrapper, 'div', 'slides-wrapper', null );
        // now place wrapper at the 'slides' position in the DOM and wrap it around the slides when we didn't already:
        //   http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-952280727
        if (!dom.slides_wrapper.hasChildNodes()) {
            dom.slides_wrapper = dom.wrapper.insertBefore(dom.slides_wrapper, dom.slides);
            dom.slides_wrapper.appendChild(dom.slides);
        }
        // set width/height or zoom/scale won't work:
        dom.slides_wrapper.style.width = '100%';
        dom.slides_wrapper.style.height = '100%';

        // Background element
        dom.background = createSingletonNode( dom.wrapper, 'div', 'backgrounds', null );

        // Progress bar
        dom.progress = createSingletonNode( dom.wrapper, 'div', 'progress', '<span></span>' );
        dom.progressbar = dom.progress.querySelector( 'span' );

        // Time remaining bar
        dom.timeRemaining = createSingletonNode( dom.wrapper, 'div', 'time-remaining', '<span></span>');
        dom.timeRemainingBar = dom.timeRemaining.querySelector( 'span' );

        // Arrow controls
        dom.arrow_controls = createSingletonNode( dom.wrapper, 'aside', 'controls',
            '<div class="navigate-left"></div>' +
            '<div class="navigate-right"></div>' +
            '<div class="navigate-up"></div>' +
            '<div class="navigate-down"></div>' );
        if (dom.arrow_controls) {
            // inspired by http://www.quirksmode.org/dom/events/blurfocus.html when mixing reveal with contenteditable areas and 100% keyboard control:
            // this should make sure that TAB should end up at a node which we recognize as presentation control area and hence process the keys pressed.
            dom.arrow_controls.setAttribute( 'tabindex', '9999' );
        }

        // Slide number
        dom.slideNumber = createSingletonNode( dom.wrapper, 'div', 'slide-number', '' );

        // State background element [DEPRECATED]
        createSingletonNode( dom.wrapper, 'div', 'state-background', null );

        // Overlay graphic which is displayed during the paused mode
        createSingletonNode( dom.wrapper, 'div', 'pause-overlay', null );

        // Cache references to elements
        if ( config.controls ) {
            dom.controls = document.querySelector( '.reveal .controls' );

            // There can be multiple instances of controls throughout the page
            dom.controlsLeft = toArray( document.querySelectorAll( '.navigate-left' ) );
            dom.controlsRight = toArray( document.querySelectorAll( '.navigate-right' ) );
            dom.controlsUp = toArray( document.querySelectorAll( '.navigate-up' ) );
            dom.controlsDown = toArray( document.querySelectorAll( '.navigate-down' ) );
            dom.controlsPrev = toArray( document.querySelectorAll( '.navigate-prev' ) );
            dom.controlsNext = toArray( document.querySelectorAll( '.navigate-next' ) );
        }

		dom.statusDiv = createStatusDiv();

        return !!dom.statusDiv;
    }

	/**
	 * Creates a hidden div with role aria-live to announce the
	 * current slide content. Hide the div off-screen to make it
	 * available only to Assistive Technologies.
	 */
	function createStatusDiv() {

		var statusDiv = document.getElementById( 'aria-status-div' );
		if( !statusDiv && dom.wrapper ) {
			statusDiv = document.createElement( 'div' );
			statusDiv.style.position = 'absolute';
			statusDiv.style.height = '1px';
			statusDiv.style.width = '1px';
			statusDiv.style.overflow = 'hidden';
			statusDiv.style.clip = 'rect( 1px, 1px, 1px, 1px )';
			statusDiv.setAttribute( 'id', 'aria-status-div' );
			statusDiv.setAttribute( 'aria-live', 'polite' );
			statusDiv.setAttribute( 'aria-atomic','true' );
			dom.wrapper.appendChild( statusDiv );
		}
		return statusDiv;

    }

    /**
     * Obtain the currently active CSS style (not just the value available in the DOMnode.style property!)
     *
     * See also http://www.quirksmode.org/dom/getstyles.html
     *
     * Adjusted to match http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/ yet follow
     * https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle
     */
    function getStyle(el, styleProp, styleMayBeBrowserDependent)
    {
        var rv = "";
        var vendorSpecificStyleProp;

        if (document.defaultView && document.defaultView.getComputedStyle) {
            var info = document.defaultView.getComputedStyle(el, null);
            rv = info.getPropertyValue(styleProp);
            if (styleMayBeBrowserDependent && ( rv == null || rv === '' ) ) {
                vendorSpecificStyleProp = features.vendorPrefix.js + styleProp[0].toUpperCase() + styleProp.substr(1);
                rv = info.getPropertyValue(vendorSpecificStyleProp);
            }
        }
        else if (el.currentStyle) {
            styleProp = styleProp.replace(/\-(\w)/g, function (strMatch, p1) {
                return p1.toUpperCase();
            });
            rv = el.currentStyle[styleProp];
            if (styleMayBeBrowserDependent && ( rv == null || rv === '' ) ) {
                vendorSpecificStyleProp = features.vendorPrefix.js + styleProp[0].toUpperCase() + styleProp.substr(1);
                rv = el.currentStyle[vendorSpecificStyleProp];
            }
        }
        return rv;
    }


    /**
     * Configures the presentation for printing to a static
     * PDF.
     */
    function setupPDF() {
/*
TBD: we need something completely different for printing slides [GerHobbelt]
*/

		var slideSize = getViewportAndSlideDimensionsInfo();
        if (slideSize === false) {
            return false;
        }

		// Dimensions of the PDF pages
		var pageWidth = Math.floor( slideSize.width * ( 1 + config.margin ) ),
			pageHeight = Math.floor( slideSize.height * ( 1 + config.margin  ) );

		// Dimensions of slides within the pages
		var slideWidth = slideSize.width,
			slideHeight = slideSize.height;

		// Let the browser know what page size we want to print
		injectStyleSheet( '@page{size:'+ pageWidth +'px '+ pageHeight +'px; margin: 0;}' );

		// Limit the size of certain elements to the dimensions of the slide
		injectStyleSheet( '.reveal section > img, .reveal section > video, .reveal section > iframe{max-width: ' + slideWidth + 'px; max-height:' + slideHeight + 'px}' );

/*
TBD end
*/


        // mark the current context as print rather than screen display
        document.body.classList.add( 'print-pdf' );

        var targetInfo = getViewportAndSlideDimensionsInfo();

        document.body.style.width = targetInfo.rawAvailableWidth + 'px';
        document.body.style.height = targetInfo.rawAvailableHeight + 'px';

        // Slide and slide background layout
		toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {

            // Vertical stacks are not centred since their section
            // children will be
			if( slide.classList.contains( 'stack' ) === false ) {
				// Center the slide inside of the page, giving the slide some margin
                var left = ( targetInfo.rawAvailableWidth - targetInfo.slideWidth ) / 2;
                var top = ( targetInfo.rawAvailableHeight - targetInfo.slideHeight ) / 2;

				var contentSize = getComputedSlideSize( slide );
				var numberOfPages = Math.max( Math.ceil( contentSize.height / pageHeight ), 1 );

				// Center slides vertically
				if( numberOfPages === 1 && config.center || slide.classList.contains( 'center' ) ) {
					top = Math.max( ( pageHeight - contentSize.height ) / 2, 0 );
                }

				// Position the slide inside of the page
                slide.style.left = left + 'px';
                slide.style.top = top + 'px';
                slide.style.width = targetInfo.slideWidth + 'px';
                slide.style.height = targetInfo.slideHeight + 'px';

/*
TBD this is the old code; next marker starts the new code. To be checked and re-evaluated. [GerHobbelt]
*/

                if( slide.scrollHeight > targetInfo.slideHeight ) {
                    slide.style.overflow = 'hidden';
                }

/*
TBD end of old code, start of new code
*/

				// TODO Backgrounds need to be multiplied when the slide
				// stretches over multiple pages
                var background = slide.querySelector( ':scope > .slide-background' );
                if( background ) {
                    background.style.width = targetInfo.printWidth + 'px';
					background.style.height = ( targetInfo.printHeight * numberOfPages ) + 'px';
                    background.style.top = -top + 'px';
                    background.style.left = -left + 'px';
                }
            }

        } );

        // Show all fragments
		toArray( dom.wrapper.querySelectorAll( FRAGMENTS_SELECTOR ) ).forEach( function( fragment ) {
            fragment.classList.add( 'visible' );
        } );

        return true;
    }

    /**
     * Creates an HTML element and returns a reference to it.
     * If the element already exists the existing instance will
     * be returned.
     */
    function createSingletonNode( container, tagname, classname, innerHTML ) {

		// Find all nodes matching the description
		var nodes = container.querySelectorAll( '.' + classname );

		// Check all matches to find one which is a direct child of
		// the specified container
		for( var i = 0; i < nodes.length; i++ ) {
			var testNode = nodes[i];
			if( testNode.parentNode === container ) {
				return testNode;
			}
		}

		// If no node was found, create it now
		var node = document.createElement( tagname );
			node.classList.add( classname );
		if( typeof innerHTML === 'string' ) {
				node.innerHTML = innerHTML;
			}
			container.appendChild( node );

        return node;

    }

    /**
     * Creates the slide background elements and appends them
     * to the background container. One element is created per
     * slide no matter if the given slide has visible background.
     */
    function createBackgrounds() {

        var printMode = isPrintingPDF();

        // Clear prior backgrounds
        dom.background.innerHTML = '';
        dom.background.classList.add( 'no-transition' );

        // Iterate over all horizontal slides
		toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( slideh, x ) {

            var backgroundStack;
            var back = null;

            if( printMode ) {
                backgroundStack = createBackground( slideh, slideh, x, false );
            }
            else {
                backgroundStack = createBackground( slideh, dom.background, x, false );
            }

            // Iterate over all vertical slides
            toArray( slideh.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ).forEach( function( slidev, y ) {

                if( printMode ) {
                    createBackground( slidev, slidev, x, y );
                }
                else {
                    createBackground( slidev, backgroundStack, x, y );
                }

				backgroundStack.classList.add( 'stack' );

            } );

        } );

        // Add parallax background if specified
        if( config.parallaxBackgroundImage && typeof config.parallaxBackgroundImage === 'string' ) {
            dom.background.style.backgroundImage = 'url("' + config.parallaxBackgroundImage + '")';
        }
        else {
            dom.background.style.backgroundImage = '';
        }

    }

    /**
     * Creates a background for the given slide.
     *
     * @param {HTMLElement} slide
     * @param {HTMLElement} container The element that the background
     * should be appended to
     */
    function createBackground( slide, container, x, y ) {

        var data = {
            background: slide.getAttribute( 'data-background' ),
            backgroundSize: slide.getAttribute( 'data-background-size' ),
            backgroundImage: slide.getAttribute( 'data-background-image' ),
            backgroundVideo: slide.getAttribute( 'data-background-video' ),
            backgroundColor: slide.getAttribute( 'data-background-color' ),
            backgroundRepeat: slide.getAttribute( 'data-background-repeat' ),
            backgroundPosition: slide.getAttribute( 'data-background-position' ),
            backgroundTransition: slide.getAttribute( 'data-background-transition' )
        };

        // Force linear transition based on browser capabilities
        if( features.transforms3d === false && data.backgroundTransition ) {
            data.backgroundTransition = 'linear';
        }

        var add_bg_el = false;
        var element = getSlideBackground( x, y );
        if( !element ) {
            element = document.createElement( 'div' );
            add_bg_el = true;
        }

        // Carry over custom classes from the slide to the background
        //
        // http://jsperf.com/element-classlist-vs-element-classname/6  .className vs. classList: for modern browsers it doesn't matter all that much
        // http://jsperf.com/element-classlist-vs-element-classname/8  .classList.remove vs. .classList.toggle(X, false): latter is not available everywhere
        element.className = slide.className;
        element.classList.add( 'slide-background' );
        // element.classList.remove( 'present' );
        // element.classList.remove( 'past' );
        // element.classList.remove( 'future' );

        if( data.background ) {
            // Auto-wrap image urls in url(...)
            if( /^(http|file|\/\/)/gi.test( data.background ) || /\.(svg|png|jpg|jpeg|gif|bmp)$/gi.test( data.background ) ) {
				slide.setAttribute( 'data-background-image', data.background );
                data.backgroundImage = data.background;
            }
            else {
                element.style.background = data.background;
            }
        }

        // Create a hash for this combination of background settings.
        // This is used to determine when two slide backgrounds are
        // the same.
        if( data.background || data.backgroundColor || data.backgroundImage || data.backgroundVideo ) {
            element.setAttribute( 'data-background-hash', 
                data.background + ':' + 
                data.backgroundSize + ':' +
                data.backgroundImage + ':' +
                data.backgroundVideo + ':' +
                data.backgroundColor + ':' +
                data.backgroundRepeat + ':' +
                data.backgroundPosition + ':' +
                data.backgroundTransition 
            );
        }

        // Additional and optional background properties
        if( data.backgroundSize ) element.style.backgroundSize = data.backgroundSize;
        if( data.backgroundColor ) element.style.backgroundColor = data.backgroundColor;
        if( data.backgroundRepeat ) element.style.backgroundRepeat = data.backgroundRepeat;
        if( data.backgroundPosition ) element.style.backgroundPosition = data.backgroundPosition;
        if( data.backgroundTransition ) element.setAttribute( 'data-background-transition', data.backgroundTransition );
        if( data.backgroundImage ) element.setAttribute( 'data-background-image', data.backgroundImage );
        if( data.backgroundVideo ) element.setAttribute( 'data-background-video', data.backgroundVideo );

        if( add_bg_el ) {
            container.appendChild( element );
        }
        
        return element;

    }


    /**
     * The event listener for postMessage events, which makes it
     * possible to call all reveal.js API methods from another
     * window. For example:
     *
     * revealWindow.postMessage( JSON.stringify({
     *   method: 'slide',
     *   args: [ 2 ]
     * }), '*' );
     */
    function postMessageListener( event ) {

        // Make sure we're dealing with JSON
        try {
            data = JSON.parse( data ); 

            // Check if the requested method can be found
            if( data.method && typeof Reveal[data.method] === 'function' ) {
                Reveal[data.method].apply( Reveal, data.args );
            }
        } catch (e) {
        }

    }


    /**
     * Registers a listener to postMessage events, this makes it
     * possible to call all reveal.js API methods from another
     * window. For example:
     *
     * revealWindow.postMessage( JSON.stringify({
     *   method: 'slide',
     *   args: [ 2 ]
     * }), '*' );
     */
    function setupPostMessage() {

        // when registered before, make sure we don't register it twice:
        window.removeEventListener( 'message', postMessageListener, false );

        if( config.postMessage ) {
            window.addEventListener( 'message', postMessageListener, false );
        }

    }

    /**
     * Mix the configuration settings in `options` , if any, into the config
     * object.
     *
     * Applies the configuration settings from the config
     * object. May be called multiple times.
     */
    function configure( options ) {

        // New config options may be passed when this method
        // is invoked through the API after initialization
        if( typeof options === 'object' ) extend( config, options );

        // Force linear transition based on browser capabilities
        if( features.transforms3d === false ) {
            config.transition = 'linear';
            config.backgroundTransition = 'linear';
        }

        if( !dom.wrapper ) {
            return false;
        }

        var numberOfSlides = getTotalSlides();

        dom.wrapper.classList.remove( config.transition );

        dom.wrapper.classList.add( config.transition );

        dom.wrapper.setAttribute( 'data-transition-speed', config.transitionSpeed );
        dom.wrapper.setAttribute( 'data-background-transition', config.backgroundTransition );

        if( dom.controls ) {
            dom.controls.style.display = config.controls ? 'block' : 'none';
        }

        if( dom.progress ) {
            dom.progress.style.display = config.progress ? 'block' : 'none';
        }

        if( dom.timeRemaining ) {
            dom.timeRemaining.style.display = config.timeRemaining ? 'block' : 'none';
        }

        if( config.rtl ) {
            dom.wrapper.classList.add( 'rtl' );
        }
        else {
            dom.wrapper.classList.remove( 'rtl' );
        }

        if( config.center ) {
            dom.wrapper.classList.add( 'center' );
        }
        else {
            dom.wrapper.classList.remove( 'center' );
        }

        if( config.mouseWheel ) {
            document.addEventListener( 'DOMMouseScroll', onDocumentMouseScroll, false ); // FF
            document.addEventListener( 'mousewheel', onDocumentMouseScroll, false );
        }
        else {
            document.removeEventListener( 'DOMMouseScroll', onDocumentMouseScroll, false ); // FF
            document.removeEventListener( 'mousewheel', onDocumentMouseScroll, false );
        }

        // Rolling 3D links
        if( config.rollingLinks ) {
            enableRollingLinks();
        }
        else {
            disableRollingLinks();
        }

        // Iframe link previews
        if( config.previewLinks ) {
            enablePreviewLinks();
        }
        else {
            disablePreviewLinks();
            enablePreviewLinks( '[data-preview-link]' );
        }

        // Remove existing auto-slide controls
        if( autoSlidePlayer ) {
            autoSlidePlayer.destroy();
            autoSlidePlayer = null;
        }

        // Generate auto-slide controls if needed
        if( numberOfSlides > 1 && config.autoSlide && config.autoSlideStoppable && features.canvas && features.requestAnimationFrame ) {
            autoSlidePlayer = new Playback( dom.wrapper, function() {
                return Math.min( Math.max( ( Date.now() - autoSlideStartTime ) / autoSlide, 0 ), 1 );
            } );

            autoSlidePlayer.on( 'click', onAutoSlidePlayerClick );
            autoSlidePaused = false;
        }

        // When fragments are turned off they should be visible
        if( !config.fragments ) {
            toArray( dom.slides.querySelectorAll( '.fragment' ) ).forEach( function( element ) {
                element.classList.add( 'visible' );
                element.classList.remove( 'current-fragment' );
            } );
        }

        // Load the theme in the config, if it's not already loaded
        if( config.theme && dom.theme ) {
            var themeURL = dom.theme.getAttribute( 'href' );
            var themeFinder = /[^\/]*?(?=\.css)/;
            var themeName = themeURL.match(themeFinder)[0];

            if( config.theme !== themeName ) {
                themeURL = themeURL.replace(themeFinder, config.theme);
                dom.theme.setAttribute( 'href', themeURL );
            }
        }

        // Start timer
        if ( config.timeRemaining ) {
            var minutesRemaining = parseInt( config.timeRemaining, 10 );
            startTimer( minutesRemaining );
        }

        sync();

        return true;

    }

    /**
     * Binds all event listeners.
     */
    function addEventListeners() {

        if (eventsAreBound) {
            console.log('*** attempt to double-register Reveal events.');
            removeEventListeners();
        }

        eventsAreBound = true;

        window.addEventListener( 'hashchange', onWindowHashChange, false );
        window.addEventListener( 'resize', onWindowResize, false );

        if( config.touch && features.touch && dom.wrapper ) {
            dom.wrapper.addEventListener( 'touchstart', onTouchStart, false );
            dom.wrapper.addEventListener( 'touchmove', onTouchMove, false );
            dom.wrapper.addEventListener( 'touchend', onTouchEnd, false );

            // Support pointer-style touch interaction as well
            if( window.navigator.pointerEnabled ) {
                // IE 11 uses un-prefixed version of pointer events
                dom.wrapper.addEventListener( 'pointerdown', onPointerDown, false );
                dom.wrapper.addEventListener( 'pointermove', onPointerMove, false );
                dom.wrapper.addEventListener( 'pointerup', onPointerUp, false );
            }
            else if( window.navigator.msPointerEnabled ) {
                // IE 10 uses prefixed version of pointer events
                dom.wrapper.addEventListener( 'MSPointerDown', onPointerDown, false );
                dom.wrapper.addEventListener( 'MSPointerMove', onPointerMove, false );
                dom.wrapper.addEventListener( 'MSPointerUp', onPointerUp, false );
            }
        }

        if( config.keyboard ) {
            document.addEventListener( 'keydown', onDocumentKeyDown, false );
			document.addEventListener( 'keypress', onDocumentKeyPress, false );
        }

        if ( config.progress && dom.progress ) {
            dom.progress.addEventListener( 'click', onProgressClicked, false );
        }

        if( config.focusBodyOnPageVisibilityChange ) {
            var visibilityChange;

            if( 'hidden' in document ) {
                visibilityChange = 'visibilitychange';
            }
            else if( 'msHidden' in document ) {
                visibilityChange = 'msvisibilitychange';
            }
            else if( 'webkitHidden' in document ) {
                visibilityChange = 'webkitvisibilitychange';
            }

            if( visibilityChange ) {
                document.addEventListener( visibilityChange, onPageVisibilityChange, false );
            }
        }

        if ( config.controls && dom.controls ) {
    		// Listen to both touch and click events, in case the device
    		// supports both
    		var pointerEvents = ( config.touch && features.touch ) ? [ 'touchstart', 'click' ] : [ 'click' ];

    		// Only support touch for Android, fixes double navigations in
    		// stock browser
    		if( navigator.userAgent.match( /android/gi ) ) {
    			pointerEvents = [ 'touchstart' ];
    		}

    		pointerEvents.forEach( function( eventName ) {
                dom.controlsLeft.forEach( function( el ) { el.addEventListener( eventName, onNavigateLeftClicked, false ); } );
                dom.controlsRight.forEach( function( el ) { el.addEventListener( eventName, onNavigateRightClicked, false ); } );
                dom.controlsUp.forEach( function( el ) { el.addEventListener( eventName, onNavigateUpClicked, false ); } );
                dom.controlsDown.forEach( function( el ) { el.addEventListener( eventName, onNavigateDownClicked, false ); } );
                dom.controlsPrev.forEach( function( el ) { el.addEventListener( eventName, onNavigatePrevClicked, false ); } );
                dom.controlsNext.forEach( function( el ) { el.addEventListener( eventName, onNavigateNextClicked, false ); } );
            } );
        }

    }

    /**
     * Unbinds all event listeners.
     */
    function removeEventListeners() {

        eventsAreBound = false;

        document.removeEventListener( 'keydown', onDocumentKeyDown, false );
		document.removeEventListener( 'keypress', onDocumentKeyPress, false );
        window.removeEventListener( 'hashchange', onWindowHashChange, false );
        window.removeEventListener( 'resize', onWindowResize, false );

        if ( dom.wrapper ) {
            dom.wrapper.removeEventListener( 'touchstart', onTouchStart, false );
            dom.wrapper.removeEventListener( 'touchmove', onTouchMove, false );
            dom.wrapper.removeEventListener( 'touchend', onTouchEnd, false );

            // IE11
            if( window.navigator.pointerEnabled ) {
                dom.wrapper.removeEventListener( 'pointerdown', onPointerDown, false );
                dom.wrapper.removeEventListener( 'pointermove', onPointerMove, false );
                dom.wrapper.removeEventListener( 'pointerup', onPointerUp, false );
            }
            // IE10
            else if( window.navigator.msPointerEnabled ) {
                dom.wrapper.removeEventListener( 'MSPointerDown', onPointerDown, false );
                dom.wrapper.removeEventListener( 'MSPointerMove', onPointerMove, false );
                dom.wrapper.removeEventListener( 'MSPointerUp', onPointerUp, false );
            }
        }

        if ( dom.progress ) {
            dom.progress.removeEventListener( 'click', onProgressClicked, false );
        }

        if ( dom.controls ) {
            [ 'touchstart', 'click' ].forEach( function( eventName ) {
                dom.controlsLeft.forEach( function( el ) { el.removeEventListener( eventName, onNavigateLeftClicked, false ); } );
                dom.controlsRight.forEach( function( el ) { el.removeEventListener( eventName, onNavigateRightClicked, false ); } );
                dom.controlsUp.forEach( function( el ) { el.removeEventListener( eventName, onNavigateUpClicked, false ); } );
                dom.controlsDown.forEach( function( el ) { el.removeEventListener( eventName, onNavigateDownClicked, false ); } );
                dom.controlsPrev.forEach( function( el ) { el.removeEventListener( eventName, onNavigatePrevClicked, false ); } );
                dom.controlsNext.forEach( function( el ) { el.removeEventListener( eventName, onNavigateNextClicked, false ); } );
            } );
        }

    }

    /**
     * Extend object `a` with the properties of object `b`.
     * If there's a conflict, object `b` takes precedence.
     *
     * When function `filter` has been specified, it must return a truthy value
     * for the `b.property` to be accepted. Use this, for example, 
     * to only allow a specific subset of all the `b.properties` 
     * to be copied into `a`.
     *
     * Return the augmented `a` object as the result. 
     */
    function extend( a, b, filter ) {

        if( b ) {
            if( !filter ) {
                for( var i in b ) {
                    a[ i ] = b[ i ];
                }
            } 
            else {
                for( var i in b ) {
                    if( filter( i ) ) {
                        a[ i ] = b[ i ];
                    }
                }
            }
        }
        return a;

    }

    /**
     * Converts the target object to an array.
     */
    function toArray( o ) {

        return Array.prototype.slice.call( o );

    }

    /**
     * Utility for de-serializing a value.
     */
    function deserialize( value ) {

        if( typeof value === 'string' ) {
            if( value === 'null' ) return null;
            else if( value === 'true' ) return true;
            else if( value === 'false' ) return false;
            else if( value.match( /^\d+$/ ) ) return parseFloat( value );
        }

        return value;

    }

    /**
     * Filter object before encoding it in JSON: 
     * remove any properties which are functions or objects.
     */
    function filterForJSONtransmission( obj ) {
        if( !obj ) return null;

        var rv = {};
        for( var k in obj ) {
            if( typeof k === 'function' ) continue;
            //if( typeof k === 'object' ) continue;    // really we should only ditch DOM elements?
            if( k === 'currentSlide' || k === 'previousSlide' ) continue;
            if( k === 'fragment' || k === 'fragments' ) continue;
            rv[ k ] = obj[ k ];
        }
        return rv;
    }

    /**
     * Measures the distance in pixels between point a
     * and point b.
     *
     * @param {Object} a point with x/y properties
     * @param {Object} b point with x/y properties
     */
    function distanceBetween( a, b ) {

        var dx = a.x - b.x,
            dy = a.y - b.y;

        return Math.sqrt( dx*dx + dy*dy );

    }

    /**
     * Applies a CSS transform to the target element.
     */
    function transformElement( element, transform ) {

        if ( transform == null ) {
            element.style.WebkitTransform = transform;
            element.style.MozTransform = transform;
            element.style.msTransform = transform;
            element.style.OTransform = transform;
            element.style.transform = transform;
        }
        else {
            element.style.WebkitTransform += transform;
            element.style.MozTransform += transform;
            element.style.msTransform += transform;
            element.style.OTransform += transform;
            element.style.transform += transform;
        }

    }

    /**
     * Applies the given scale to the target element.
     */
    function scaleElement( element, scale, targetInfo ) {
        if ( scale == null ) {
            // reset the scale and related attributes:
            element.style.left = null;
            element.style.top = null;
            element.style.bottom = null;
            element.style.right = null;
            element.style.zoom = null;
            transformElement( element, null );
        }
        else {
            element.style.left = 0;
            element.style.top = 0;
            element.style.bottom = 0;
            element.style.right = 0;

            if( useZoomFallback ) {
                element.style.zoom = scale;
            }
            // Apply scale transform
            else {
                var post_translation = '';
                if ( targetInfo ) {
                    // compensation: -0.5 * delta_of_origin / scale
                    var scale_inv = 1 / scale;
                    var delta_h = targetInfo.slideHeight * scale_inv - targetInfo.slideHeight;
                    var c_h = -0.5 * delta_h * scale_inv; 
                    var delta_w = targetInfo.slideWidth * scale_inv - targetInfo.slideWidth;
                    var c_w = -0.5 * delta_w * scale_inv; 
                    post_translation = ' translate3d(' + c_w + 'px, ' + c_h + 'px, 0px)';
                }
                transformElement( element, 'scale(' + scale + ') ' + post_translation );
            }
        }
    }


    /**
	 * Injects the given CSS styles into the DOM.
	 */
	function injectStyleSheet( value ) {

		var tag = document.createElement( 'style' );
		tag.type = 'text/css';
		if( tag.styleSheet ) {
			tag.styleSheet.cssText = value;
		}
		else {
			tag.appendChild( document.createTextNode( value ) );
		}
		document.getElementsByTagName( 'head' )[0].appendChild( tag );

	}

	/**
     * Retrieves the height & width of the given element by looking
     * at the position and height/width of its immediate children.
     */
    function getComputedSlideSize( element ) {

        var height = 0;
        var width = 0;

        if( element ) {

            // account for padding/margins around children by inspecting the node itself too:
            height = Math.max( height, element.offsetTop + element.offsetHeight );
            width = Math.max( width, element.offsetLeft + element.offsetWidth );

            toArray( element.childNodes ).forEach( function( child ) {

                if( typeof child.offsetTop === 'number' && child.style ) {
                    // Ignore offsetX/Y for children which are attached to the viewport itself
                    if( getStyle( child, "position" ) === 'fixed' ) {
                        // Still we cannot completely ignore them because we have to ensure their
                        // width/height indeed *does* fit in the viewport, right?
                        height = Math.max( height, child.offsetHeight );
                        width = Math.max( width, child.offsetWidth );
                        return;
                    }

                    // media elements may have been stretched!
                    if( /(img|video)/gi.test( child.nodeName ) ) {
                        var nw = child.naturalWidth || child.videoWidth,
                            nh = child.naturalHeight || child.videoHeight;

                        height = Math.max( height, child.offsetTop + child.nh );
                        width = Math.max( width, child.offsetLeft + child.nw );
                    }
                    else {
                        height = Math.max( height, child.offsetTop + child.offsetHeight );
                        width = Math.max( width, child.offsetLeft + child.offsetWidth );
                    }
                }

            } );

        }

        return {
            height: height,
            width: width
        };

    }

    /**
     * Returns the remaining height within the parent of the
     * target element.
     *
     * remaining height = [ configured parent height ] - [ current parent height ]
     */
    function getRemainingHeight( element, height ) {

        height = height || 0;

        if( element ) {
            var newHeight, oldHeight = element.style.height;

            // Change the .stretch element height to 0 in order to find the height of all
            // the other elements
            element.style.height = '0px';
            newHeight = height - element.parentNode.offsetHeight;

            // Restore the old height, just in case
            element.style.height = oldHeight;

            return newHeight;
        }

        return height;

    }

    /**
     * Checks if this instance is being used to print a PDF.
     */
    function isPrintingPDF() {

        return ( /print-pdf/gi ).test( window.location.search );

    }

    /**
     * Hides the address bar if we're on a mobile device.
     */
    function hideAddressBar() {

        if( config.hideAddressBar && isMobileDevice ) {
            // Events that should trigger the address bar to hide
            window.addEventListener( 'load', removeAddressBar, false );
            window.addEventListener( 'orientationchange', removeAddressBar, false );
        }

    }

    /**
     * Causes the address bar to hide on mobile devices,
     * more vertical space ftw.
     */
    function removeAddressBar() {

        setTimeout( function() {
            window.scrollTo( 0, 1 );
        }, 10 );

    }

    /**
     * Dispatches an event of the specified type from the
     * reveal DOM element.
     *
     * Return the DOM event or NULL when the event could not be fired.
     */
    function dispatchEvent( type, args ) {

        if( !dom.wrapper ) {
            dom.wrapper = document.querySelector( '.reveal' );
        }

        if( dom.wrapper ) {
            // register any lingering (queued) event handlers before we fire the event:
            while( queuedEventListenerRegistrations.length ) {
                var qev = queuedEventListenerRegistrations.shift();
                if( qev.add ) {
                    Reveal.addEventListener( qev.type, qev.listener, qev.useCapture );
                }
                else {
                    Reveal.removeEventListener( qev.type, qev.listener, qev.useCapture );
                }
            }

            var event = document.createEvent( 'HTMLEvents', 1, 2 );
            event.initEvent( type, true, true );
            extend( event, args );
            dom.wrapper.dispatchEvent( event );

            // If we're in an iframe, post each reveal.js event to the
            // parent window. Used by the notes plugin
            if( config.postMessageEvents && window.parent !== window.self ) {
                window.parent.postMessage( JSON.stringify({
                    namespace: 'reveal',
                    eventName: type,
                    eventData: filterForJSONtransmission(args),
                    state: getState()
                } ), '*' );
            }

            return event;
        }

        return null;

    }

    /**
     * Wrap all links in 3D goodness.
     */
    function enableRollingLinks() {

        if( features.transforms3d && !( 'msPerspective' in document.body.style ) ) {
			var anchors = dom.wrapper.querySelectorAll( LINKS_SELECTOR );

            for( var i = 0, len = anchors.length; i < len; i++ ) {
                var anchor = anchors[i];

                if( anchor.textContent && !anchor.querySelector( '*' ) && ( !anchor.className || !anchor.classList.contains( 'roll' ) ) ) {
                    var span = document.createElement('span');
                    span.setAttribute('data-title', anchor.text);
                    span.innerHTML = anchor.innerHTML;

                    anchor.classList.add( 'roll' );
                    anchor.innerHTML = '';
                    anchor.appendChild(span);
                }
            }
        }

    }

    /**
     * Unwrap all 3D links.
     */
    function disableRollingLinks() {

		var anchors = dom.wrapper.querySelectorAll( ROLLING_LINKS_SELECTOR );

        for( var i = 0, len = anchors.length; i < len; i++ ) {
            var anchor = anchors[i];
            var span = anchor.querySelector( 'span' );

            if( span ) {
                anchor.classList.remove( 'roll' );
                anchor.innerHTML = span.innerHTML;
            }
        }

    }

    /**
     * Bind preview frame links.
     */
    function enablePreviewLinks( selector ) {

        var anchors = toArray( document.querySelectorAll( selector ? selector : 'a' ) );

        anchors.forEach( function( element ) {
            if( /^(http|www)/gi.test( element.getAttribute( 'href' ) ) ) {
                element.addEventListener( 'click', onPreviewLinkClicked, false );
            }
        } );

    }

    /**
     * Unbind preview frame links.
     */
    function disablePreviewLinks() {

        var anchors = toArray( document.querySelectorAll( 'a' ) );

        anchors.forEach( function( element ) {
            if( /^(http|www)/gi.test( element.getAttribute( 'href' ) ) ) {
                element.removeEventListener( 'click', onPreviewLinkClicked, false );
            }
        } );

    }

    /**
     * Opens a preview window for the target URL.
     */
	function showPreview( url ) {

		closeOverlay();

        if( dom.wrapper ) {
    		dom.overlay = document.createElement( 'div' );
    		dom.overlay.classList.add( 'overlay' );
    		dom.overlay.classList.add( 'overlay-preview' );
    		dom.wrapper.appendChild( dom.overlay );

    		dom.overlay.innerHTML = [
                '<header>',
                    '<a class="close" href="#"><span class="icon"></span></a>',
                    '<a class="external" href="'+ url +'" target="_blank"><span class="icon"></span></a>',
                '</header>',
                '<div class="spinner"></div>',
                '<div class="viewport">',
                    '<iframe src="'+ url +'"></iframe>',
                '</div>'
            ].join('');

    		dom.overlay.querySelector( 'iframe' ).addEventListener( 'load', function( event ) {
    			dom.overlay.classList.add( 'loaded' );
            }, false );

    		dom.overlay.querySelector( '.close' ).addEventListener( 'click', function( event ) {
    			closeOverlay();
                event.preventDefault();
            }, false );

    		dom.overlay.querySelector( '.external' ).addEventListener( 'click', function( event ) {
    			closeOverlay();
            }, false );

            setTimeout( function() {
			    dom.overlay.classList.add( 'visible' );
            }, 1 );
        }

    }

	/**
	 * Opens a overlay window with help material.
	 */
	function showHelp() {

		if( config.help ) {

			closeOverlay();

            if( dom.wrapper ) {

        		dom.overlay = document.createElement( 'div' );
        		dom.overlay.classList.add( 'overlay' );
        		dom.overlay.classList.add( 'overlay-help' );
        		dom.wrapper.appendChild( dom.overlay );

        		var html = '<p class="title">Keyboard Shortcuts</p><br/>';

        		html += '<table><th>KEY</th><th>ACTION</th>';
        		for( var key in keyboardShortcuts ) {
        			html += '<tr><td>' + key + '</td><td>' + keyboardShortcuts[ key ] + '</td></tr>';
        		}

        		html += '</table>';

        		dom.overlay.innerHTML = [
        			'<header>',
        				'<a class="close" href="#"><span class="icon"></span></a>',
        			'</header>',
        			'<div class="viewport">',
        				'<div class="viewport-inner">'+ html +'</div>',
        			'</div>'
        		].join('');

        		dom.overlay.querySelector( '.close' ).addEventListener( 'click', function( event ) {
        			closeOverlay();
        			event.preventDefault();
        		}, false );

        		setTimeout( function() {
        			dom.overlay.classList.add( 'visible' );
        		}, 1 );

            }

        }
        
	}

    /**
	 * Closes any currently open overlay.
	 */
	function closeOverlay() {

		if( dom.overlay ) {
			dom.overlay.parentNode.removeChild( dom.overlay );
			dom.overlay = null;
        }

    }


    /**
     * Prepare the slide hierarchy for use: set up the classes, etc.
     */
    function prepSlideHierarchy() {

        // Select all slides, vertical and horizontal
        var slides = toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) );
        var slidesLength = slides.length;

        for( var i = 0; i < slidesLength; i++ ) {
            var element = slides[i];

            // If this element contains vertical slides (or fragments)
            if( element.querySelector( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ) {
                element.classList.add( 'stack' );
            }
        }

        sortAllFragments();

    }


    /**
     * Applies JavaScript-controlled layout rules to the
     * presentation.
     *
     * The `prevIndexv` and `prevIndexh` parameters are mere helpers when rendering the overview mode:
     * when these are given, the layout renders the layout positioned as it would be 
     * for these 'old' coordinates, while using the 'visibility rules' for the new `indexh/indexv`
     * coordinates.
     *
     * This ensures that the overview mode exhibits nice transitions while we walk through the deck
     * while staying in overview mode.
     */
    function layout( prevIndexh, prevIndexv ) {

        if ( prevIndexh == null ) {
            prevIndexh = indexh;
        }
        if ( prevIndexv == null ) {
            prevIndexv = indexv;
        }

        var i, j, len, hlen, vlen;
        var targetInfo = getViewportAndSlideDimensionsInfo();

        function layoutSingleSlide( slide, x, y ) {
        
            // Check if this slide comes with a dimensions/scale cache.
            var cache = slide.getAttribute( 'data-reveal-dim-cache' ) || '';
    
            // Make sure we're dealing with JSON, if there's any cache.
            if ( !cache.length ) {
                cache = false;
            }
            else {
                try {
                    cache = JSON.parse( cache ) || false; 
                } 
                catch (e) {
                    cache = false;
                }
            }

            var isCurrentSlide = (slide === currentSlide);

            // Resets all transforms to use the external styles
            scaleElement( slide, null );
            transformElement( slide, null );

            // Remove the previous height/size pinning.
            slide.style.height = null;
            slide.style.width = null;
    
            slide.style.paddingTop = null;
            slide.style.paddingBottom = null;
            slide.style.paddingLeft = null;
            slide.style.paddingRight = null;
            slide.style.top = null;
            slide.style.left = null;

            // Make sure the slide is visible in the DOM for otherwise we cannot obtain measurements.
            // Later on in the layout process we'll invoke updateSlidesVisibility() to ensure all
            // slides that *must* be visible, will be, and those that must not, aren't.
            showSlide( slide );

            // Layout the contents of the slide.

            // Setting a fixed width helps to produce a consistent layout and slide dimensions measurement.
            dom.slides.style.width = targetInfo.slideWidth + 'px';

            // When the current slide is a 'scrollable slide' we need to make some special preparations.
            // Do note however that we bluntly clip such a node in overview as there all slides are
            // supposed to have fixed, identical dimensions. 
            var isScrollableSlide = slide.hasAttribute( 'data-scrollable' );
            if ( isScrollableSlide ) {
                dom.slides_wrapper.classList.add( 'scrollable-slide' );

                // let the browser reflow the scrollable content so we can decide what to do next:
                dom.slides.style.width = targetInfo.slideWidth + 'px';
                dom.slides.style.height = targetInfo.slideHeight + 'px';
            }
            //slide.style.width = targetInfo.slideWidth + 'px';

            // Calculate the amount of vertical padding required to *center* the slide.
            // That is, IFF we want the slide to be centered at all?
            //
            // Also note that, when we are rendering this slide in CSS *box content model* than classic *box border model*, that
            // we only need to set the slide height to have it center!
            var display_style = getStyle( slide, 'display' );

            console.log("layout: slide ", x, y, " -> display: ", display_style, ", class:", slide.classList, slide.classList.contains( 'visible' ));

            // Handle sizing of elements with the 'stretch' class
            toArray( slide.querySelectorAll( ':scope > .stretch' ) ).forEach( function( element ) {
                layoutSlideContents( element, targetInfo.slideWidth, ( isScrollableSlide ? Infinity : targetInfo.slideHeight ) );
            });

            // Calculate the dimensions of the slide
            var slideDimensions = getComputedSlideSize( slide );

            // Determine scale of content to fit within available space
            var realScale = 1.0;
            if ( slideDimensions && !isScrollableSlide && !isOverview() ) {
                // Protect the scaling calculation against zero-sized slides: make those produce a sensible scale, e.g.: 1.0
                realScale = Math.min( targetInfo.slideWidth / ( slideDimensions.width || targetInfo.slideWidth ), targetInfo.slideHeight / ( slideDimensions.height || targetInfo.slideHeight ) );
            }

            // We need to compensate for the scale factor, which is applied to the entire slide,
            // hence for centering properly *and* covering the entire intended slide area, we need
            // to scale the target size accordingly and use this scaled up/down version: 
            var targetSlideHeight = Math.round(targetInfo.slideHeight / realScale);
            var targetSlideWidth = Math.round(targetInfo.slideWidth / realScale);


            // Allow user code to modify the slide layout and/or dimensions during the layout phase:
            var eventData = {
                x: x,
                y: y,
                slide: slide,
                slideDimensions: slideDimensions,
                slideScale: realScale,
                scaledTargetSlideHeight: targetSlideHeight,
                scaledTargetSlideWidth: targetSlideWidth,
                cssDisplayStyle: display_style,
                inOverviewMode: isOverview(),
                targetInfo: targetInfo,
                slidesMatrixInfo: getSlidesOverviewInfo()
            }; 
            dispatchEvent( 'layout:before', eventData );
            
            // Pick up the changes user code *may* have made to the eventData.
            display_style = eventData.cssDisplayStyle;
            targetSlideHeight = eventData.scaledTargetSlideHeight;
            targetSlideWidth = eventData.scaledTargetSlideWidth;
            realScale = eventData.slideScale;

            // Pin the height of every slide as otherwise the overview rendering will be botched
            // and so will the regular view, when the slide is 'scrollable'.
            //
            // WARNING: it also means the user cannot set a hardwired style="height: YYY px;" style
            // or some such for any SECTION and expect to live...
            if ( !isOverview() ) {
                slide.style.height = Math.max(targetSlideHeight, slideDimensions.height) + 'px';
                slide.style.width = Math.max(targetSlideWidth, slideDimensions.width) + 'px';
            }
            else {
                // In overview mode, we treat all slides as fixed, identical sized:
                slide.style.height = targetInfo.slideHeight + 'px';
                slide.style.width = targetInfo.slideWidth + 'px';
            }
            slide.style.top = 0;
            slide.style.left = 0;

            // If the display mode is 'block' flexbox is not supported by
            // the current browser so we fall back on JavaScript centering
            if( display_style === 'block' ) {
                var center_pad_v = Math.max(0, Math.floor((targetSlideHeight - slideDimensions.height) / 2));
                var center_pad_h = Math.max(0, Math.floor((targetSlideWidth - slideDimensions.width) / 2));

                // Do not apply the center padding if the user didn't ask for it via configuration, either globally or for this particular slide
                if ( config.center || slide.classList.contains( 'center' ) ) {
                    if (center_pad_v > 0) {
                        slide.style.paddingTop = center_pad_v + 'px';
                        slide.style.paddingBottom = center_pad_v + 'px';
                    }
                    if (center_pad_h > 0) {
                        slide.style.paddingLeft = center_pad_h + 'px';
                        slide.style.paddingRight = center_pad_h + 'px';
                    }
                }
            }
            else {
                // We must set height:100% for flexbox layout to work for us.
                // 
                // In a sense, we're doing so further below, where we always set a slide height in pixels.
            }

            // Set the slide height/width where appropriate, keeping the slide scale in mind:
            // it is applied to the individual slide, hence its dimensions will differ from those
            // of its wrapper.
            if ( slideDimensions && !isScrollableSlide && !isOverview() ) {
                dom.slides.style.width = targetInfo.slideWidth + 'px';
                dom.slides.style.height = targetInfo.slideHeight + 'px';
            } else {
                if ( isScrollableSlide && !isOverview() ) {
                    // when the scrollable content is wider/higher than the slide area, we better kill the fixed height. Same for the width...
                    if ( slideDimensions && slideDimensions.width > targetInfo.slideWidth ) {
                        dom.slides.style.width = null;
                    } else {
                        dom.slides.style.width = targetInfo.slideWidth + 'px';
                    }
                    if ( slideDimensions && slideDimensions.height > targetInfo.slideHeight ) {
                        dom.slides.style.height = null;
                    } else {
                        dom.slides.style.height = targetInfo.slideHeight + 'px';
                    }
                } else {
                    dom.slides.style.width = targetInfo.slideWidth + 'px';
                    dom.slides.style.height = targetInfo.slideHeight + 'px';
                }
            }

            scaleElement( slide, realScale, targetInfo );

            console.log("SLIDE layout: ", {
                slideDimensions: slideDimensions,
                isScrollableSlide: isScrollableSlide,
                targetInfo: targetInfo,
                overview_slides_info: getSlidesOverviewInfo(),
                scale: fundamentalScale,
                realScale: realScale,
                slide: slide
            });

        }


        if ( targetInfo && dom.slides ) {

            //
            // Calculated slide dimensions code properties:
            //
            // - the way these are cached must be easy & fast to be invalidated: 
            //   this is accomplished by storing them in a DOM data attribute
            //
            // - as the user may decide to render a different view of a slide 
            //   in overview mode, e.g. only showing the H1-H3 elements in there, 
            //   we store two different size + scale sets to facilitate this
            //   specialized 'overview mode' behaviour of each slide
            //
            // - we assume slide dimensions (width / height) do not change very
            //   frequently, but individual slides may change their layout anywhere
            //   in user code. We assume the user code, upon changing a slide's
            //   layout, also ensures the slide dimensions cache (mentioned
            //   above) is invalidated.
            //
            // - each slide caches its own dimensions, hence moving slides around
            //   and/or removing slides should not invalidate the caches. New
            //   added slides of course won't yet have a valid dimension cache
            //   hence these will be calculated on demand.
            //
            // Notes/Warnings:
            //
            // The cache recalculation logic assumes that no user code is required 
            // to produce the correct numbers, but that inspection of the DOM
            // under the proper conditions (classes applied to the DOM) produces 
            // the correct numbers.
            //
            // The recalculation logic also assumes it can freely remove/add
            // top/right/bottom/left and width/height/padding/zoom styles to any slide and
            // to the reveal and slides' wrapper DOM nodes.
            //
            // ----------------------------------------------------------------

            // Before recalculating the slide height(s), position, etc., we must nuke 
            // the previously patched in padding/top/etc. to get a correct measurement.

            // Reset wrapper scale for both single sheet view / overview modes:
            scaleElement( dom.slides_wrapper, null );

            dom.slides.style.width = null;
            dom.slides.style.height = null;
            // Setting a fixed width helps to produce a consistent layout and slide dimensions measurement.
            dom.slides.style.width = targetInfo.slideWidth + 'px';

            // Calculate the fundamental scale for each slide to ensure it will fit the viewport.
            // This scale factor assumes all slides to be equal in dimensions; 'scrollable slides'
            // will therefor most probably end up with a scrollbar (as per CSS styling) and 
            // all slides will be be made to fit this 'one size fits all' by scaling them individually 
            // as the need arises.
            //
            // We assume a 'fundamental scale factor' of 1.0 when we're rendering an Overview layout.

            var fundamentalScale = 1.0;

            if ( !isOverview() ) {
                fundamentalScale = Math.min( targetInfo.availableWidth / targetInfo.slideWidth, targetInfo.availableHeight / targetInfo.slideHeight );

                // Respect max/min scale settings
                fundamentalScale = Math.max( fundamentalScale, config.minScale );
                fundamentalScale = Math.min( fundamentalScale, config.maxScale );

                // nuke the overview layout info cache
                currentOverviewInfo = null;
            }
            else {
                // On the other hand, when we're doing the layout for the Overview mode, then we need
                // to know the fundamental scale for the entire *visible* series of slides so that they
                // will fit in the viewport together.
                //
                // We calculate the scale such that the two outermost slides are partially obscured
                // (hence the times-2 instead of the seemingly more proper times-2-plus-1 below). This
                // is done to make horizontal navigation through the slide set seem 'better' as it is 
                // harder to notice that the slides farther away from the current focus are simply never
                // rendered (display:none) to speed up the display.

                var info = getSlidesOverviewInfo();

                // The number of steps away from the present slide that will be visible
                var viewDistance = getViewDistance();
                var hcount = Math.min(info.horizontal_count, viewDistance * 2); // notice the lacking '+1' in here: both outermost slides are shown *half*.
                var vcount = Math.min(info.vertical_count, viewDistance * 2); // as above, but now for the vertical direction.

                // And remember the current overview layout's viewDistance settings:
                currentOverviewInfo = {
                    hcount: hcount,
                    vcount: vcount
                };

                var totalSlidesWidth = targetInfo.slideWidth * hcount * 1.05; // Reveal uses 5% spacing between slides in the overview display
                var totalSlidesHeight = targetInfo.slideHeight * vcount * 1.05;

                // Determine scale of content to fit within available space
                fundamentalScale = Math.min( targetInfo.availableWidth / totalSlidesWidth, targetInfo.availableHeight / totalSlidesHeight );

                // Respect max/min scale settings
                fundamentalScale = Math.max( fundamentalScale, config.overviewMinScale );
                fundamentalScale = Math.min( fundamentalScale, config.overviewMaxScale );
            }

            var currentSlideScale = null;

            // Now process each slide individually, as they can be dimensioned and 
            // positioned independently (this only works because each slide has
            // the 'position: absolute' style, hence their layouts do not 
            // influence one other in the DOM irrespective of where they are
            // currently located -- all are overlapping at (x=0, y=0, z=0).
            //
            // Noe that we always position *all* slides, also when we're not in overview mode,
            // to facilitate CSS3 transitions: once the slides become visible (display:block)
            // then this work will pay out as the transition(s) will already have registered
            // previous layout.

            var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR );
            var info = getSlidesOverviewInfo();

            for ( var i = 0, hlen = horizontalSlides.length; i < hlen; i++ ) {
                var hslide = horizontalSlides[i],
                    hoffset = config.rtl ? -105 : 105,
                    voffset = 105;

                if( hslide.classList.contains( 'stack' ) ) {

                    if ( isOverview() ) {
                        // Apply CSS transform to position the slide for the overview.
                        transformElement( hslide, 'translate3d( ' + ( ( i - prevIndexh ) * hoffset ) + '%, 0px, 0px ) rotateX( 0deg ) rotateY( 0deg ) scale(1)' );
                    }
                    else {
                        // reset transform: the stack is at (0,0,0) in regular view mode
                        transformElement( hslide, null );
                    }

                    var verticalSlides = hslide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );

                    for ( var j = 0, vlen = verticalSlides.length; j < vlen; j++ ) {
                        var verticalIndex = ( i === prevIndexh ? prevIndexv : getPreviousVerticalIndex( hslide ) );

                        var vslide = verticalSlides[j];

                        layoutSingleSlide( vslide, i, j );

                        if ( isOverview() ) {
                            // Apply CSS transform
                            transformElement( vslide, 'translate3d( 0px, ' + ( ( j - verticalIndex ) * voffset ) + '%, 0px ) rotateX( 0deg ) rotateY( 0deg ) scale(1)' );
                        }
                    }

                }
                else {

                    layoutSingleSlide( hslide, i, 0 );

                    if ( isOverview() ) {
                        // Apply CSS transform to position the slide for the overview.
                        transformElement( hslide, 'translate3d( ' + ( ( i - prevIndexh ) * hoffset ) + '%, 0px, 0px ) rotateX( 0deg ) rotateY( 0deg ) scale(1)' );
                    }

                }

            }

            // Ensure only the current slide is visible when in regular display mode; 
            // the previous and next siblings will be visible for a while though too to facilitate
            // smooth fore- and background transitions.
            //
            // When in Overview mode, here is where we limit the visibility of the 
            // viewDistance-restricted set of slides.
            updateSlidesVisibility();




            // set the scale for the slide(s) is the last thing we do, so it gets CSS3 animation applied:
            console.log("layout: ", {
                targetInfo: targetInfo,
                overview_slides_info: getSlidesOverviewInfo(),
                indices: getIndices(),
                scale: fundamentalScale
            });


            if ( !isOverview() ) {
                scaleElement( dom.slides, fundamentalScale );
            } 
            else {
                scaleElement( dom.slides_wrapper, fundamentalScale );
            }

            updateProgress();
            updateParallax();

        }

    }

    /**
     * Applies layout logic to the contents of the target slide.
     */
    function layoutSlideContents( element, width, height ) {

        element.style.width = null;
        element.style.height = null;

        // Determine how much vertical space we can use
        var remainingHeight = isFinite( height ) ? getRemainingHeight( element, height ) : height;

        // Consider the aspect ratio of media elements
        if( /(img|video)/gi.test( element.nodeName ) ) {
            var nw = element.naturalWidth || element.videoWidth,
                nh = element.naturalHeight || element.videoHeight;

            var es = Math.min( width / nw, remainingHeight / nh );

            element.style.width = ( nw * es ) + 'px';
            element.style.height = ( nh * es ) + 'px';
        }
        else {
            element.style.width = width + 'px';
            if ( isFinite( remainingHeight ) ) {
                element.style.height = remainingHeight + 'px';
            }
        }

	}

	/**
	 * Calculates the computed pixel size of our slides. These
	 * values are based on the width and height configuration
	 * options.
     *
     * Returns the viewport and slide display sizes in pixels
     * (percentage-based slide width and height are converted to pixels).
     */
    function getViewportAndSlideDimensionsInfo() {

        if (!dom.wrapper || !dom.slides) return false;

        var rawAvailableWidth, rawAvailableHeight, availableWidth, availableHeight;

        if ( isPrintingPDF() ) {
            // Dimensions of the page surface
            rawAvailableWidth = config.printWidth;
            rawAvailableHeight = config.printHeight;
        }
        else {
            // Available space to scale within
            rawAvailableWidth = dom.wrapper.offsetWidth;
            rawAvailableHeight = dom.wrapper.offsetHeight;
        }

        // Reduce available space by margin
        var shrinkage = 1 - config.margin;
        availableWidth = Math.floor(rawAvailableWidth * shrinkage); // ... and round down to whole pixels
        availableHeight = Math.floor(rawAvailableHeight * shrinkage);

        // Dimensions of the content
        var slideWidth = config.width,
            slideHeight = config.height,
            slidePadding = 20; // TODO Dig this out of DOM

        // Slide width may be a percentage of available width
        if( typeof slideWidth === 'string' && /%$/.test( slideWidth ) ) {
            slideWidth = parseInt( slideWidth, 10 ) / 100 * availableWidth;
        }

        // Slide height may be a percentage of available height
        if( typeof slideHeight === 'string' && /%$/.test( slideHeight ) ) {
            slideHeight = parseInt( slideHeight, 10 ) / 100 * availableHeight;
        }

        return {
            rawAvailableWidth: rawAvailableWidth,
            rawAvailableHeight: rawAvailableHeight,

            // available space reduced by margin
            availableWidth: availableWidth,             // a.k.a. presentationWidth
            availableHeight: availableHeight,

            // (Target) Dimensions of the content
            slideWidth: slideWidth,                     // a.k.a. width ~ slide width
            slideHeight: slideHeight,
            slidePadding: slidePadding
        };

    }


    /**
     * Stores the vertical index of a stack so that the same
     * vertical slide can be selected when navigating to and
     * from the stack.
     *
     * @param {HTMLElement} stack The vertical stack element
     * @param {int} v Index to memorize
     */
    function setPreviousVerticalIndex( stack, v ) {

        if( typeof stack === 'object' && typeof stack.setAttribute === 'function' ) {
            stack.setAttribute( 'data-previous-indexv', v || 0 );
        }

    }

    /**
     * Retrieves the vertical index which was stored using
     * #setPreviousVerticalIndex() or 0 if no previous index
     * exists.
     *
     * @param {HTMLElement} stack The vertical stack element
     */
    function getPreviousVerticalIndex( stack ) {

        if( typeof stack === 'object' && typeof stack.hasAttribute === 'function' && stack.classList.contains( 'stack' ) ) {
            // Prefer manually defined start-indexv
            var attributeName = stack.hasAttribute( 'data-start-indexv' ) ? 'data-start-indexv' : 'data-previous-indexv';

            return parseInt( stack.getAttribute( attributeName ), 10 ) || 0;
        }

        return 0;

    }

    /**
     * Displays the overview of slides (quick nav) by
     * scaling down and arranging all slide elements.
     *
     * Experimental feature, might be dropped if perf
     * can't be improved.
     */
    function activateOverview() {

        if ( isOverview() ) {
            var info = getSlidesOverviewInfo();

            // The number of steps away from the present slide that will be visible
            var viewDistance = getViewDistance();
            var hcount = Math.min(info.horizontal_count, viewDistance * 2); // notice the lacking '+1' in here: both outermost slides are shown *half*.
            var vcount = Math.min(info.vertical_count, viewDistance * 2); // as above, but now for the vertical direction.

            // We only have to re-render the overview when the viewDistance has changed with probable noticeable effect.
            if ( currentOverviewInfo && ( hcount === currentOverviewInfo.hcount || vcount === currentOverviewInfo.vcount ) ) {
                return;
            }
        }

        // Only proceed if enabled in config
        if( config.overview && dom.wrapper ) {

            // Notify observers of the overview coming up
            dispatchEvent( 'overviewshown:before', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide,
                slidesMatrixInfo: getSlidesOverviewInfo()
            } );

            // Don't auto-slide while in overview mode
            cancelAutoSlide();

            // Vary the depth of the overview based on screen size
            //var depth = window.innerWidth < 400 ? 1000 : 2500;

            dom.wrapper.classList.add( 'overview' );
            dom.wrapper.classList.remove( 'overview-deactivating' );

            // clearTimeout( activateOverviewTimeout );
            clearTimeout( deactivateOverviewTimeout );
            deactivateOverviewTimeout = null;

            console.log('Feed the slides matrix to LAYOUT so we can determine properly how far to zoom/transform: ', overview_slides_info);

            // Select all slides
            toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {
                slide.addEventListener( 'click', onOverviewSlideClicked, true );
            } );

            layout();

            // Notify observers of the overview showing
            dispatchEvent( 'overviewshown', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide,
                slidesMatrixInfo: getSlidesOverviewInfo()
            } );

            // }, 10 );

        }

    }

    /**
     * Exits the slide overview and enters the currently
     * active slide.
     */
    function deactivateOverview() {

        if ( !isOverview() ) {
            return;
        }

        // Only proceed if enabled in config
        if( config.overview && dom.wrapper ) {

            // overview_slides_info = null;

            // Notify observers of the overview hiding
            dispatchEvent( 'overviewhidden:before', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide
            } );

            // clearTimeout( activateOverviewTimeout );
            clearTimeout( deactivateOverviewTimeout );
            // activateOverviewTimeout = null;

            dom.wrapper.classList.remove( 'overview' );

            // Temporarily add a class so that transitions can do different things
            // depending on whether they are exiting/entering overview, or just
            // moving from slide to slide
            dom.wrapper.classList.add( 'overview-deactivating' );

            deactivateOverviewTimeout = setTimeout( function () {
                deactivateOverviewTimeout = null;
                dom.wrapper.classList.remove( 'overview-deactivating' );
            }, 50 );

            // Select all slides
			toArray( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ) ).forEach( function( slide ) {
                slide.removeEventListener( 'click', onOverviewSlideClicked, true );
            } );

            slide( indexh, indexv );

            cueAutoSlide();

            // Notify observers of the overview hiding
            dispatchEvent( 'overviewhidden', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide
            } );

        }
    }

    /**
     * Toggles the slide overview mode on and off.
     *
     * @param {Boolean} override Optional flag which overrides the
     * toggle logic and forcibly sets the desired state. True means
     * overview is open, false means it's closed.
     */
    function toggleOverview( override ) {

        if( typeof override === 'boolean' ) {
            if (override) {
                activateOverview();
            } else {
                deactivateOverview();
            }
        }
        else {
            if (isOverview()) {
                deactivateOverview();
            } else {
                activateOverview();
            }
        }

    }

    /**
     * Checks if the overview is currently active.
     *
     * @return {Boolean} true if the overview is active,
     * false otherwise
     */
    function isOverview() {

        return dom.wrapper && dom.wrapper.classList.contains( 'overview' );

    }

    /**
     * Produce the slides' info: 
     * - number of horizontal slides
     * - maximum number of vertical slides
     * and updates the each slide's `data-index-h` and `data-index-v` slide coordinate DOM attributes.
     *
     * This info is cached and recalculated on demand, i.e. when this function is invoked while the cache is flushed.
     */
    function getSlidesOverviewInfo() {

        if ( overview_slides_info ) {
            return overview_slides_info;
        }

        var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR );
        var len1 = horizontalSlides.length;
        overview_slides_info = {
            horizontal_count: len1,
            vertical_count: 1
        };

        for( var i = 0; i < len1; i++ ) {
            var hslide = horizontalSlides[i];

            hslide.setAttribute( 'data-index-h', i );

            // this assumes we have invoked prepSlideHierarchy() at the appropriate time.
            if( hslide.classList.contains( 'stack' ) ) {

                var verticalSlides = hslide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );
                var len2 = verticalSlides.length;
                overview_slides_info.vertical_count = Math.max( overview_slides_info.vertical_count, len2 );

                for( var j = 0; j < len2; j++ ) {
                    var vslide = verticalSlides[j];

                    vslide.setAttribute( 'data-index-h', i );
                    vslide.setAttribute( 'data-index-v', j );
                }
            }
        }


    } 

    /**
     * Return the overview rendering mode:
     *
     * 0: default. Uses CSS3 translateZ style. This mode does not work well subelements which have been tweaked using CSS z-index
     * 1: outer DIV zoom
     * 2: outer DIV scale
     */
    function getSpecialOverviewMode() {
        switch (config.overview) {
        case false:
            return false;

        default:
        case true:
        case 'translateZ':
        case 'translate3d':
            return 0;

        case 'zoom':
        case 'perspective':
            return 1;

        case 'scale':
            return 2;
        }
    }

    /**
     * Checks if the current or specified slide is vertical
     * (nested within another slide).
     *
     * @param {HTMLElement} slide [optional] The slide to check
     * orientation of
     */
    function isVerticalSlide( slide ) {

        // Prefer slide argument, otherwise use current slide
        slide = slide ? slide : currentSlide;

        return slide && slide.parentNode && !!slide.parentNode.nodeName.match( /^section$/i );

    }

    /**
     * Handling the fullscreen functionality via the fullscreen API
     *
     * @see http://fullscreen.spec.whatwg.org/
     * @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
     */
    function enterFullscreen() {

        var element = dom.viewport;

        // Check which implementation is available
        var requestMethod = element.requestFullScreen ||
                            element.webkitRequestFullscreen ||
                            element.webkitRequestFullScreen ||
                            element.mozRequestFullScreen ||
                            element.msRequestFullscreen;

        if( requestMethod ) {
            requestMethod.apply( element );
        }

    }

    /**
     * Enters the paused mode which fades everything on screen to
     * black.
     */
    function pause() {

        if( dom.wrapper ) {
            var wasPaused = dom.wrapper.classList.contains( 'paused' );

            cancelAutoSlide();
            dom.wrapper.classList.add( 'paused' );

            if( wasPaused === false ) {
                dispatchEvent( 'paused' );
            }
        }

    }

    /**
     * Exits from the paused mode.
     */
    function resume() {

        if( dom.wrapper ) {
            var wasPaused = dom.wrapper.classList.contains( 'paused' );
            dom.wrapper.classList.remove( 'paused' );

            cueAutoSlide();

            if( wasPaused ) {
                dispatchEvent( 'resumed' );
            }
        }

    }

    /**
     * Toggles the paused mode on and off.
     */
    function togglePause( override ) {

        if( typeof override === 'boolean' ) {
            override ? pause() : resume();
        }
        else {
            isPaused() ? resume() : pause();
        }

    }

    /**
     * Checks if we are currently in the paused mode.
     */
    function isPaused() {

        return dom.wrapper && dom.wrapper.classList.contains( 'paused' );

    }

    /**
     * Toggles the auto slide mode on and off.
     *
     * @param {Boolean} override Optional flag which sets the desired state.
     * True means autoplay starts, false means it stops.
     */

    function toggleAutoSlide( override ) {

        if( typeof override === 'boolean' ) {
            override ? resumeAutoSlide() : pauseAutoSlide();
        }
        else {
            autoSlidePaused ? resumeAutoSlide() : pauseAutoSlide();
        }

    }

    /**
     * Checks if the auto slide mode is currently on.
     */
    function isAutoSliding() {

        return !!( autoSlide && !autoSlidePaused );

    }

    /**
     * Steps from the current point in the presentation to the
     * slide which matches the specified horizontal and vertical
     * indices.
     *
     * @param {int} h Horizontal index of the target slide
     * @param {int} v Vertical index of the target slide
     * @param {int} f Optional index of a fragment within the
     * target slide to activate
     * @param {any} o Optional origin for use in multimaster environments
     *
     * When the `h`, `v` and/or `f` indices are not valid integer numbers, 
     * huristics will be applied to determine the target slide:
     *
     * - when `h` is a numeric type but not an index pointing at a valid horizontal slide / vertical slide stack,
     *   then the nearest horizontal slide coordinate is assumed.
     *
     * - when `h` is not a numeric type, e.g. `null` or `undefined`,
     *   then the current vertical slide coordinate is assumed. 
     *
     * - when `v` is a numeric type but not an index pointing at a valid vertical slide,
     *   then the nearest vertical slide coordinate is assumed.
     *
     * - when `v` is not a numeric index pointing at a vertical slide, 
     *   then:
     *   
     *   + if the specified horizontal coordinate `h` matches the current 
     *     horizontal position, then the current vertical slide coordinate is used.
     *
     *   + otherwise, the previously last visited vertical slide coordinate is used.
     *     Note that these 'last visited' coordinates are (re)set to zero(0) when the presentation
     *     starts or rewinds.
     *
     * - the `f` fragment index follows the rules encoded in the navigateFragment() function. 
     */
    function slide( h, v, f, o ) {

        // Remember where we were at before
        var oldSlide = currentSlide;

        // If we were on a vertical stack, remember what vertical index
        // it was on so we can resume at the same position when returning
        if( oldSlide && oldSlide.parentNode && oldSlide.parentNode.classList.contains( 'stack' ) ) {
            setPreviousVerticalIndex( oldSlide.parentNode, indexv );
        }

        var indexhBefore = indexh || 0,
            indexvBefore = indexv || 0;

        // Remember the state before this slide
        var stateBefore = state.concat();

        // Reset the state array
        state.length = 0;

        // Query all horizontal slides in the deck
		var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR );

        // Apply horizontal index heuristics:
        if ( h >= horizontalSlides.length ) {
            h = horizontalSlides.length - 1;
        }
        else if (h < 0) {
            h = 0;
        }
        else if ( typeof h !== 'number' || !isFinite(h) ) {
            h = indexhBefore;
        }
        h = Math.round( h );

        // Find the target horizontal slide and any possible vertical slides
        // within it
        var currentHorizontalSlide = horizontalSlides[ h ],
            currentVerticalSlides = (currentHorizontalSlide && currentHorizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR )),
            currentVerticalSlide = currentHorizontalSlide;

        assert( currentHorizontalSlide );

        // Apply vertical index heuristics (assuming there's a vertical slide stack here)
        if ( !currentVerticalSlides || currentVerticalSlides.length === 0 ) {
            v = 0;
        }
        else {
            if ( v >= currentVerticalSlides.length ) {
                v = currentVerticalSlides.length - 1;
            }
            else if (v < 0) {
                v = 0;
            }
            else if ( typeof v !== 'number' || !isFinite(v) ) {
                if ( h === indexh ) {
                    v = indexvBefore;
                }
                else {
                    // If no vertical index is specified and the upcoming slide is a
                    // stack, resume at its previous vertical index
                    v = getPreviousVerticalIndex( currentHorizontalSlide );
                }
            }
            v = Math.round( v );

            currentVerticalSlide = currentVerticalSlides[ v ];
            assert( currentVerticalSlide );
        }

        // Store reference to the current slide
        currentSlide = currentVerticalSlide;
        assert( currentSlide );

        // Do we change to another the slide or not?
        var slideChanged = ( h !== indexhBefore || v !== indexvBefore || !oldSlide );

        // Activate and transition to the new slide
        indexh = updateSlides( HORIZONTAL_SLIDES_SELECTOR, h );
        indexv = updateSlides( VERTICAL_SLIDES_SELECTOR, v );
        assert( indexh === h );
        assert( indexv === v );

        // Apply the new state
        stateLoop: for( var i = 0, len = state.length; i < len; i++ ) {
            // Check if this state existed on the previous slide. If it
            // did, we will avoid adding it repeatedly
            for( var j = 0; j < stateBefore.length; j++ ) {
                if( stateBefore[j] === state[i] ) {
                    stateBefore.splice( j, 1 );
                    continue stateLoop;
                }
            }

            document.documentElement.classList.add( state[i] );

            // Dispatch custom event matching the state's name
            dispatchEvent( state[i] );
        }

        // Clean up the remains of the previous state
        while( stateBefore.length ) {
            document.documentElement.classList.remove( stateBefore.pop() );
        }

        if ( isOverview() && 0 ) {
            // Make sure the next layout discards all transitions resulting from it:
            dom.wrapper.classList.add( 'reset-transitions' );

            // This initial layout will position all slides in their 'old' coordinates, while 
            // already adjusting their visibility (show/hide) to the new situation.
            layout( indexhBefore, indexvBefore );
            // Then we force the browser to render the DOM to fixate these locations for the
            // purpose of smooth transitions while moving around inside the overview.
            //
            // Re-render the DOM to enforce the 'reset-transitions' style above:
            dom.wrapper.offsetHeight;
            dom.wrapper.classList.remove( 'reset-transitions' );
        }

        // - Update the visibility of slides now that the indices have changed.
        // - If the overview is active, update positions.
        layout();

        // Show fragment, if specified
        if( f != null ) {
            navigateFragment( f );
        }

        // Dispatch an event if the slide changed
        if( slideChanged ) {
            // Ensure that the previous slide is never the same as the current
            previousSlide = oldSlide;

            dispatchEvent( 'slidechanged', {
                indexh: indexh,
                indexv: indexv,
                previousSlide: previousSlide,
                currentSlide: currentSlide,
                origin: o
            } );
        }

   //      // Solves an edge case where the previous slide maintains the
   //      // 'present' class when navigating between adjacent vertical
   //      // stacks
   //      if( previousSlide ) {
   //          previousSlide.classList.remove( 'present' );
			// previousSlide.setAttribute( 'aria-hidden', 'true' );
   //      }

        if ( indexh === 0 && indexv === 0 && slideChanged ) {
            // Reset all slides upon navigate to home
            // Issue: #285
            resetSlideStacks();
        }

        // Handle embedded content
		if( slideChanged ) {
            if ( oldSlide ) {
                stopEmbeddedContent( oldSlide );
            }
            startEmbeddedContent( currentSlide );
        }

		// Announce the current slide contents, for screen readers
		dom.statusDiv.textContent = currentSlide.textContent;

        updateControls();
        updateProgress();
        updateBackground();
        updateParallax();
        updateSlideNumber();

        // Update the URL hash
        writeURL();

        cueAutoSlide();

    }

    /**
     * Syncs the presentation with the current DOM. Useful
     * when new slides or control elements are added or when
     * the configuration has changed.
     */
    function sync() {

        // Subscribe to input
        removeEventListeners();
        addEventListeners();

        prepSlideHierarchy();

        // Force a layout to make sure the current config is accounted for
        layout();

        // Reflect the current autoSlide value
        autoSlide = config.autoSlide;

        // Start auto-sliding if it's enabled
        cueAutoSlide();

        // Re-create the slide backgrounds
        createBackgrounds();

		// Write the current hash to the URL
		writeURL();

        updateControls();
        updateProgress();
        updateBackground();
        updateSlideNumber();

		formatEmbeddedContent();

    }

    /**
     * Resets all vertical slides so that only the first
     * is visible.
     */
    function resetVerticalSlides() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );
        horizontalSlides.forEach( function( horizontalSlide, x ) {

            var lower_bound = ( x === indexh ? 1 : 0 );

            var verticalSlides = toArray( horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) );
            verticalSlides.forEach( function( verticalSlide, y ) {

                if( y >= lower_bound ) {
                    verticalSlide.classList.remove( 'past-1' );
                    verticalSlide.classList.remove( 'past' );
                    verticalSlide.classList.remove( 'present' );
                    verticalSlide.classList.add( 'future' );
                    if ( y === lower_bound ) {
                        verticalSlide.classList.add( 'future-1' );
                    }
					verticalSlide.setAttribute( 'aria-hidden', 'true' );
                }

            } );

        } );

    }

    /**
     * Resets slide stack to their initial state (i.e. show the top vertical slide when navigated to).
     */
    function resetSlideStacks() {

        var slides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.stack') );
        for( var i = 0, len = slides.length; i < len; i++ ) {
            // Reset stack
            setPreviousVerticalIndex( slides[i], 0 );
        }

    }

    /**
     * Sorts and formats all of fragments in the
     * presentation.
     */
    function sortAllFragments() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );
        horizontalSlides.forEach( function( horizontalSlide ) {

            var verticalSlides = toArray( horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) );
            verticalSlides.forEach( function( verticalSlide, y ) {

                sortFragments( verticalSlide.querySelectorAll( '.fragment' ) );

            } );

            if( verticalSlides.length === 0 ) {
                sortFragments( horizontalSlide.querySelectorAll( '.fragment' ) );
            }

        } );

    }

    /**
     * Updates one dimension of slides by showing the slide
     * with the specified index.
     *
     * @param {String} selector A CSS selector that will fetch
     * the group of slides we are working with
     * @param {Number} index The index of the slide that should be
     * shown
     *
     * @return {Number} The index of the slide that is now shown,
     * might differ from the `index` parameter value if it was out of
     * bounds.
     */
    function updateSlides( selector, index ) {

        // Select all slides and convert the NodeList result to
        // an array
		var slides = toArray( dom.wrapper.querySelectorAll( selector ) ),
            slidesLength = slides.length;

        // var printMode = isPrintingPDF();

        if( slidesLength ) {

            // Should the index loop?
            if( config.loop ) {
                index %= slidesLength;

                if( index < 0 ) {
                    index = slidesLength + index;
                }
            }

            // Enforce max and minimum index bounds
            index = Math.max( Math.min( index, slidesLength - 1 ), 0 );

            for( var i = 0; i < slidesLength; i++ ) {
                var element = slides[i];

                // // Optimization; hide all slides that are N or more steps
                // // away from the present slide
                // if( isOverview() === false ) {
                //     // The distance loops so that it measures 1 between the first
                //     // and last slides -- in fact it calculates the minimum distance from
                //     // slide [index] to slide [i] while assuming the sequence is a loop.
                //     var d1 = Math.abs(index - i);
                //     var d2 = slidesLength - d1;   // this will always produce a positive 'd2' value as  d1 <= slidesLength
                //     var distance = Math.min(d1, d2);

                //     if (distance <= SLIDE_NO_DISPLAY_DISTANCE) {
                //         showSlide( element );
                //     }
                //     else {
                //         hideSlide( element );
                //     }
                // }

                var reverse = config.rtl && !isVerticalSlide( element );

                element.classList.remove( 'past-1' );
                element.classList.remove( 'past' );
                element.classList.remove( 'present' );
                element.classList.remove( 'future' );
                element.classList.remove( 'future-1' );

                // http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
                element.setAttribute( 'hidden', '' );
				element.setAttribute( 'aria-hidden', 'true' );

                // // If we're printing static slides, all slides are 'present'
                // if( printMode ) {
                //     element.classList.add( 'present' );
                //     continue;
                // }

                if( i < index ) {
                    // Any element previous to index is given the 'past' class
                    element.classList.add( reverse ? 'future' : 'past' );
                    if ( i + 1 === index ) {
                        element.classList.add( reverse ? 'future-1' : 'past-1' );
                    }

                    if( config.fragments ) {
                        var pastFragments = toArray( element.querySelectorAll( '.fragment' ) );

                        // Show all fragments on prior slides
                        while( pastFragments.length ) {
                            var pastFragment = pastFragments.pop();
                            pastFragment.classList.add( 'visible' );
                            pastFragment.classList.remove( 'current-fragment' );
                        }
                    }
                }
                else if( i > index ) {
                    // Any element subsequent to index is given the 'future' class
                    element.classList.add( reverse ? 'past' : 'future' );
                    if ( i - 1 === index ) {
                        element.classList.add( reverse ? 'past-1' : 'future-1' );
                    }

                    if( config.fragments ) {
                        var futureFragments = toArray( element.querySelectorAll( '.fragment.visible' ) );

                        // No fragments in future slides should be visible ahead of time
                        while( futureFragments.length ) {
                            var futureFragment = futureFragments.pop();
                            futureFragment.classList.remove( 'visible' );
                            futureFragment.classList.remove( 'current-fragment' );
                        }
                    }
                }

                // If this element contains vertical slides
                if( element.querySelector( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ) {

                    // Solves an edge case where the previous slide maintains the
                    // 'present' class when navigating between adjacent vertical
                    // stacks
                    if (i !== index) {
                        var subslides = toArray( element.querySelectorAll( 'section.present' ) ),
                            subslidesLength = subslides.length;

                        for( var j = 0; j < subslidesLength; j++ ) {
                            var subelement = subslides[j];

                            subelement.classList.remove( 'present' );

                            if( i < index ) {
                                // Any element previous to index is given the 'past' class
                                subelement.classList.add( reverse ? 'future' : 'past' );
                                if ( i + 1 === index ) {
                                    subelement.classList.add( reverse ? 'future-1' : 'past-1' );
                                }
                            }
                            else if( i > index ) {
                                // Any element subsequent to index is given the 'future' class
                                subelement.classList.add( reverse ? 'past' : 'future' );
                                if ( i - 1 === index ) {
                                    subelement.classList.add( reverse ? 'past-1' : 'future-1' );
                                }
                            }
                        }
                    }
                }
            }

            // Mark the current slide as present
            slides[index].classList.add( 'present' );
            slides[index].removeAttribute( 'hidden' );
			slides[index].removeAttribute( 'aria-hidden' );

            // If this slide has a state associated with it, add it
            // onto the current state of the deck
            var slideState = slides[index].getAttribute( 'data-state' );
            if( slideState ) {
                state = state.concat( slideState.split( ' ' ) );
            }

        }
        else {
            // Since there are no slides we can't be anywhere beyond the
            // zeroth index
            index = 0;
        }

        return index;

    }

    /**
     * Return the number of slides (in any direction) next to the current slide which must be
     * 'visible' in the current view mode.
     *
     * Note that 'being visible' does not imply that these are actually visible to the
     * user but it rather means that technically these slides are NOT display:none and
     * thus part of the actual DOM.
     */
    function getViewDistance() {

        // The number of steps away from the present slide that will
        // be visible
        var viewDistance = isOverview() ? config.viewDistance : SLIDE_NO_DISPLAY_DISTANCE;

        // Limit view distance on weaker devices
        if( isMobileDevice ) {
            viewDistance = Math.min(viewDistance, isOverview() ? 6 : 1);
        }

        // Unlimited view distance for printing: we want to print all sheets all at once
        if( isPrintingPDF() ) {
            viewDistance = Number.MAX_VALUE;
        }

        return viewDistance;

    }


    /**
     * Optimization method; hide all slides that are far away
     * from the present slide.
     */
    function updateSlidesVisibility() {

        // the list of slides which must be made invisible after the transitions are completed.
        var slides_to_clear = [];

        function hideSiblingSlides() {
            for ( var i = 0, len = slides_to_clear.length; i < len; i++ ) {
                hideSlide( slides_to_clear[i] );
            }
            slides_to_clear = [];
            transitionMaxDurationTimeout = null;
        }

        // Reset the kill timer, as we don't care about old transitions: those will
        // be handled immediately by the code below. We are only interested in *delayed hiding*
        // of the new prev/next siblings!
        clearTimeout( transitionMaxDurationTimeout );
        transitionMaxDurationTimeout = setTimeout( hideSiblingSlides, Math.max( config.transitionMaxDuration, 1 ) );

        // Select all slides and convert the NodeList result to
        // an array
		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ),
            horizontalSlidesLength = horizontalSlides.length,
            distanceX,
            distanceY;

		if( horizontalSlidesLength && typeof indexh !== 'undefined' ) {

            // The number of steps away from the present slide that will
            // be visible
            var viewDistance = getViewDistance();

            for( var x = 0; x < horizontalSlidesLength; x++ ) {
                var horizontalSlide = horizontalSlides[x];

                var verticalSlides = toArray( horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ),
                    verticalSlidesLength = verticalSlides.length;

				if( 0 ) {
                    // Loops so that it measures 1 between the first and last slides
				    distanceX = Math.abs( ( ( indexh || 0 ) - x ) % ( horizontalSlidesLength - viewDistance ) ) || 0;
                }
                else {
                    distanceX = Math.abs( ( indexh || 0 ) - x ) || 0;
                }

                // Show the horizontal slide if it's within the view distance.
                //
                // In regular display mode, we only ever want to see the previous slide and the current slide,
                // for the sake of smooth transitions. 
                if( distanceX <= viewDistance ) {
                    console.log("updateSlidesVisibility: slide ", x, " SHOW: ", distanceX, "<=", viewDistance);
					showSlide( horizontalSlide );
                    if ( distanceX !== 0 && !isOverview() ) {
                        slides_to_clear.push( horizontalSlide );
                    }
                }
                else {
                    console.log("updateSlidesVisibility: slide ", x, " HIDE: ", distanceX, ">", viewDistance);
					hideSlide( horizontalSlide );
                }

                if( verticalSlidesLength ) {

                    var oy = getPreviousVerticalIndex( horizontalSlide );

                    for( var y = 0; y < verticalSlidesLength; y++ ) {
                        var verticalSlide = verticalSlides[y];

						distanceY = x === ( indexh || 0 ) ? Math.abs( ( indexv || 0 ) - y ) : Math.abs( y - oy );

                        if( distanceX + distanceY <= viewDistance ) {
                            console.log("updateSlidesVisibility: slide ", x, ", ", y, " SHOW: ", distanceX, "+", distanceY, "<=", viewDistance);
							showSlide( verticalSlide );
                            if ( distanceX + distanceY !== 0 && !isOverview() ) {
                                slides_to_clear.push( verticalSlide );
                            }
                        }
                        else {
                            console.log("updateSlidesVisibility: slide ", x, ", ", y, " HIDE: ", distanceX, "+", distanceY, ">", viewDistance);
							hideSlide( verticalSlide );
                        }
                    }

                }
            }

        }

    }

    /**
     * Updates the progress bar to reflect the current slide.
     */
    function updateProgress() {

        // Update progress if enabled
		if( config.progress && dom.progressbar ) {

            dom.progressbar.style.width = getProgress() * window.innerWidth + 'px';

        }
    }

    /**
     * Updates the slide number div to reflect the current slide.
     */
    function updateSlideNumber() {

        // Update slide number if enabled
        if( config.slideNumber && dom.slideNumber) {

            // Display the number of the page using 'indexh - indexv [ . fragment ]' format
            var indexString = '' + indexh;
            if( indexv > 0 ) {
                indexString += '-' + indexv;
            }

            if( config.fragments ) {
                if( currentSlide ) {
                    var currentFragment = currentSlide.querySelector( '.fragment.visible.current-fragment' );
                    if( currentFragment ) {
                        var f = (parseInt( currentFragment.getAttribute( 'data-fragment-index' ), 10 ) + 1) || 0;
                        indexString += '.' + f;
                    }
                    else {
                        var allFragments = currentSlide.querySelectorAll( '.fragment' );
                        // when the current slide has fragments but none of them is 'current' then we are at the start of the slide
                        // which we represent by fragment number zero(0):
                        if( allFragments.length > 0 ) {
                            indexString += '.0';
                        }
                    }
                }
            }

            dom.slideNumber.innerHTML = indexString;
        }

    }

    /**
     * Updates the state of all control/navigation arrows.
     */
    function updateControls() {

        if ( config.controls && dom.controls ) {

            var routes = availableRoutes();
            var fragments = availableFragments();

            // Remove the 'enabled' class from all directions
            dom.controlsLeft.concat( dom.controlsRight )
                            .concat( dom.controlsUp )
                            .concat( dom.controlsDown )
                            .concat( dom.controlsPrev )
                            .concat( dom.controlsNext ).forEach( function( node ) {
                node.classList.remove( 'enabled' );
                node.classList.remove( 'fragmented' );
            } );

            // Add the 'enabled' class to the available routes
            if( routes.left ) dom.controlsLeft.forEach( function( el ) { el.classList.add( 'enabled' ); } );
            if( routes.right ) dom.controlsRight.forEach( function( el ) { el.classList.add( 'enabled' ); } );
            if( routes.up ) dom.controlsUp.forEach( function( el ) { el.classList.add( 'enabled' ); } );
            if( routes.down ) dom.controlsDown.forEach( function( el ) { el.classList.add( 'enabled' ); } );

            // Prev/next buttons
            if( routes.left || routes.up ) dom.controlsPrev.forEach( function( el ) { el.classList.add( 'enabled' ); } );
            if( routes.right || routes.down ) dom.controlsNext.forEach( function( el ) { el.classList.add( 'enabled' ); } );

            // Highlight fragment directions
            if( currentSlide ) {

                // Always apply fragment decorator to prev/next buttons
                if( fragments.prev ) dom.controlsPrev.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
                if( fragments.next ) dom.controlsNext.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );

                // Apply fragment decorators to directional buttons based on
                // what slide axis they are in
                if( isVerticalSlide( currentSlide ) ) {
                    if( fragments.prev ) dom.controlsUp.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
                    if( fragments.next ) dom.controlsDown.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
                }
                else {
                    if( fragments.prev ) dom.controlsLeft.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
                    if( fragments.next ) dom.controlsRight.forEach( function( el ) { el.classList.add( 'fragmented', 'enabled' ); } );
                }

            }

        }

    }

    /**
     * Updates all the background elements to reflect the current
     * slide.
     */
    function updateBackground() {

        var currentBackground = null;

        // Reverse past/future classes when in RTL mode
        var horizontalPast = config.rtl ? 'future' : 'past',
            horizontalFuture = config.rtl ? 'past' : 'future';

        // Update the classes of all backgrounds to match the
        // states of their slides (past/present/future)
        toArray( dom.background.childNodes ).forEach( function( backgroundh, h ) {

            backgroundh.classList.remove( 'past-1' );
            backgroundh.classList.remove( 'past' );
            backgroundh.classList.remove( 'present' );
            backgroundh.classList.remove( 'future' );
            backgroundh.classList.remove( 'future-1' );

            if( h < indexh ) {
                backgroundh.classList.add( horizontalPast );
                if ( h + 1 === indexh ) {
                    backgroundh.classList.add( horizontalPast + '-1' );
                }
            }
            else if ( h > indexh ) {
                backgroundh.classList.add( horizontalFuture );
                if ( h - 1 === indexh ) {
                    backgroundh.classList.add( horizontalFuture + '-1' );
                }
            }
            else {
                backgroundh.classList.add( 'present' );

                // Store a reference to the current background element
                currentBackground = backgroundh;
            }

            toArray( backgroundh.querySelectorAll( ':scope > .slide-background' ) ).forEach( function( backgroundv, v ) {

                backgroundv.classList.remove( 'past-1' );
                backgroundv.classList.remove( 'past' );
                backgroundv.classList.remove( 'present' );
                backgroundv.classList.remove( 'future' );
                backgroundv.classList.remove( 'future-1' );

                if( h < indexh ) {
                    backgroundv.classList.add( horizontalPast );
                    if ( h + 1 === indexh ) {
                        backgroundv.classList.add( horizontalPast + '-1' );
                    }
                }
                else if ( h > indexh ) {
                    backgroundv.classList.add( horizontalFuture );
                    if ( h - 1 === indexh ) {
                        backgroundv.classList.add( horizontalFuture + '-1' );
                    }
                }
                else {
                    if( v < indexv ) {
                        backgroundv.classList.add( 'past' );
                        if ( v + 1 === indexv ) {    
                            backgroundv.classList.add( 'past-1' );
                        }
                    }
                    else if ( v > indexv ) {
                        backgroundv.classList.add( 'future' );
                        if ( v - 1 === indexv ) {
                            backgroundv.classList.add( 'future-1' );
                        }
                    }
                    else {
                        backgroundv.classList.add( 'present' );

                        // Store a reference to the current background element
                        // if this is the present horizontal and vertical slide
                        currentBackground = backgroundv;
                    }
                }

            } );

        } );

        // Stop any currently playing video background
        if( previousBackground ) {

            var previousVideo = previousBackground.querySelector( 'video' );
            if( previousVideo ) previousVideo.pause();

        }

        if( currentBackground ) {

            // Start video playback
            var currentVideo = currentBackground.querySelector( 'video' );
            if( currentVideo ) currentVideo.play();

            // Don't transition between identical backgrounds. This
            // prevents unwanted flicker.
            var previousBackgroundHash = previousBackground ? previousBackground.getAttribute( 'data-background-hash' ) : null;
            var currentBackgroundHash = currentBackground.getAttribute( 'data-background-hash' );
            if( currentBackgroundHash && currentBackgroundHash === previousBackgroundHash && currentBackground !== previousBackground ) {
                dom.background.classList.add( 'no-transition' );
            }

            previousBackground = currentBackground;

        }

        // Allow the first background to apply without transition
        setTimeout( function() {
            dom.background.classList.remove( 'no-transition' );
        }, 1 );

    }

    /**
     * Updates the position of the parallax background based
     * on the current slide index.
     */
    function updateParallax() {

        // Check if background has an image: it may have come from us via config.parallaxBackgroundImage or via the stylesheet
        var imgsrc = getStyle(dom.background, 'background-image') || '';
        var hasImage = (imgsrc.length > 0 && imgsrc !== 'none');
        if (hasImage) {
            var bgimg = new Image();
            bgimg.src = imgsrc.replace(/url\(|\)$|["']/ig, '');
            console.log('updateParallax: ', bgimg, imgsrc);

            if (bgimg.width && bgimg.height) {

                // Make sure the below properties are set on the element - these properties are
                // needed for proper transitions to be set on the element via CSS. To remove
                // annoying background slide-in effect when the presentation starts, apply
                // these properties after short time delay
                setTimeout( function() {
                    dom.wrapper.classList.add( 'has-parallax-background' );
                }, 1 );

    			var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ),
    				verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

                var backgroundWidth = parseInt( bgimg.width, 10 ),
                    backgroundHeight = parseInt( bgimg.height, 10 );

                var slideWidth = dom.background.offsetWidth;
                var horizontalSlideCount = horizontalSlides.length;
                var horizontalOffset = -( backgroundWidth - slideWidth ) / ( horizontalSlideCount - 1 ) * indexh;

                var slideHeight = dom.background.offsetHeight;
                var verticalSlideCount = verticalSlides.length;
                var verticalOffset = verticalSlideCount > 1 ? -( backgroundHeight - slideHeight ) / ( verticalSlideCount-1 ) * indexv : 0;

                dom.background.style.backgroundPosition = horizontalOffset + 'px ' + verticalOffset + 'px';

            }
            else {

                hasImage = false;
            }
        }

        if (!hasImage) {

            dom.wrapper.classList.remove( 'has-parallax-background' );

        }

    }

    /**
	 * Called when the given slide is within the configured view
	 * distance. Shows the slide element and loads any content
	 * that is set to load lazily (data-src).
     */
	function showSlide( slide ) {

		// Show the slide element
		//slide.style.display = 'block';
        slide.classList.add( 'visible' );

        // Media elements with data-src attributes
        toArray( slide.querySelectorAll( 'img[data-src], video[data-src], audio[data-src], iframe[data-src]' ) ).forEach( function( element ) {
            element.setAttribute( 'src', element.getAttribute( 'data-src' ) );
            element.removeAttribute( 'data-src' );
        } );

		// Media elements with <source> children
        toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( media ) {
            var sources = 0;

            toArray( media.querySelectorAll( 'source[data-src]' ) ).forEach( function( source ) {
                source.setAttribute( 'src', source.getAttribute( 'data-src' ) );
                source.removeAttribute( 'data-src' );
                sources += 1;
            } );

            // If we rewrote sources for this video/audio element, we need
            // to manually tell it to load from its new origin
            if( sources > 0 ) {
                media.load();
            }
        } );


		// Show the corresponding background element
		var indices = getIndices( slide );
		var background = getSlideBackground( indices.h, indices.v );
		if( background ) {
			//background.style.display = 'block';
            background.classList.add( 'visible' );

			// If the background contains media, load it
			if( background.hasAttribute( 'data-loaded' ) === false ) {
				background.setAttribute( 'data-loaded', 'true' );

				var backgroundImage = slide.getAttribute( 'data-background-image' ),
					backgroundVideo = slide.getAttribute( 'data-background-video' );

				// Images
				if( backgroundImage ) {
					background.style.backgroundImage = 'url(' + backgroundImage + ')';
				}
				// Videos
				else if ( backgroundVideo ) {
                    var video = background.querySelector( 'video' );
                    if( !video ) {
					    video = document.createElement( 'video' );
                    }
					// Support comma separated lists of video sources
					backgroundVideo.split( ',' ).forEach( function( source ) {
						video.innerHTML += '<source src="' + source + '">';
					} );

					background.appendChild( video );
				}
			}
		}

    }

    /**
	 * Called when the given slide is moved outside of the
	 * configured view distance.
	 */
	function hideSlide( slide ) {

		// Hide the slide element
		//slide.style.display = 'none';
        slide.classList.remove( 'visible' );

		// Hide the corresponding background element
		var indices = getIndices( slide );
		var background = getSlideBackground( indices.h, indices.v );
		if( background ) {
			//background.style.display = 'none';
            background.classList.remove( 'visible' );
		}

	}

	/**
     * Determine what available routes there are for navigation.
     *
     * @return {Object} containing four booleans: left/right/up/down
     */
    function availableRoutes() {

		var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ),
			verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

        var routes = {
            left: indexh > 0 || !!config.loop,
            right: indexh < horizontalSlides.length - 1 || !!config.loop,
            up: indexv > 0,
            down: indexv < verticalSlides.length - 1
        };

        // reverse horizontal controls for rtl
        if( config.rtl ) {
            var left = routes.left;
            routes.left = routes.right;
            routes.right = left;
        }

        return routes;

    }

    /**
     * Returns an object describing the available fragment
     * directions.
     *
     * @return {Object} two boolean properties: prev/next
     */
    function availableFragments() {

        if( currentSlide && config.fragments ) {
            var fragments = currentSlide.querySelectorAll( '.fragment.visible:not(.current-fragment)' );
            var hiddenFragments = currentSlide.querySelectorAll( '.fragment:not(.visible)' );

            return {
                prev: fragments.length > 0,
                next: hiddenFragments.length > 0
            };
        }
        else {
            return {
                prev: false,
                next: false
            };
        }

    }

    /**
	 * Enforces origin-specific format rules for embedded media.
	 */
	function formatEmbeddedContent() {

		// YouTube frames must include '?enablejsapi=1'
		toArray( dom.slides.querySelectorAll( 'iframe[src*="youtube.com/embed/"]' ) ).forEach( function( el ) {
			var src = el.getAttribute( 'src' );
			if( !/enablejsapi\=1/gi.test( src ) ) {
				el.setAttribute( 'src', src + ( !/\?/.test( src ) ? '?' : '&' ) + 'enablejsapi=1' );
			}
		});

		// Vimeo frames must include '?api=1'
		toArray( dom.slides.querySelectorAll( 'iframe[src*="player.vimeo.com/"]' ) ).forEach( function( el ) {
			var src = el.getAttribute( 'src' );
			if( !/api\=1/gi.test( src ) ) {
				el.setAttribute( 'src', src + ( !/\?/.test( src ) ? '?' : '&' ) + 'api=1' );
			}
		});

	}

	/**
     * Start playback of any embedded content inside of
     * the targeted slide.
     */
    function startEmbeddedContent( slide ) {

        if( slide && !isSpeakerNotes() ) {
            // HTML5 media elements
            toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
                if( el.hasAttribute( 'data-autoplay' ) ) {
                    el.play();
                }
            } );

            // iframe embeds
            toArray( slide.querySelectorAll( 'iframe' ) ).forEach( function( el ) {
                el.contentWindow.postMessage( 'slide:start', '*' );
            } );

            // YouTube embeds
            toArray( slide.querySelectorAll( 'iframe[src*="youtube.com/embed/"]' ) ).forEach( function( el ) {
                if( el.hasAttribute( 'data-autoplay' ) ) {
                    el.contentWindow.postMessage( '{"event":"command","func":"playVideo","args":""}', '*' );
				}
			} );

			// Vimeo embeds
			toArray( slide.querySelectorAll( 'iframe[src*="player.vimeo.com/"]' ) ).forEach( function( el ) {
				if( el.hasAttribute( 'data-autoplay' ) ) {
					el.contentWindow.postMessage( '{"method":"play"}', '*' );
                }
            } );
        }

    }

    /**
     * Stop playback of any embedded content inside of
     * the targeted slide.
     */
    function stopEmbeddedContent( slide ) {

		if( slide && slide.parentNode ) {
            // HTML5 media elements
            toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
                if( !el.hasAttribute( 'data-ignore' ) ) {
                    el.pause();
                }
            } );

            // iframe embeds
            toArray( slide.querySelectorAll( 'iframe' ) ).forEach( function( el ) {
                el.contentWindow.postMessage( 'slide:stop', '*' );
            } );

            // YouTube embeds
            toArray( slide.querySelectorAll( 'iframe[src*="youtube.com/embed/"]' ) ).forEach( function( el ) {
                if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
                    el.contentWindow.postMessage( '{"event":"command","func":"pauseVideo","args":""}', '*' );
				}
			} );

			// Vimeo embeds
			toArray( slide.querySelectorAll( 'iframe[src*="player.vimeo.com/"]' ) ).forEach( function( el ) {
				if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
					el.contentWindow.postMessage( '{"method":"pause"}', '*' );
                }
            } );
        }

    }

    /**
     * Returns a value ranging from 0-1 that represents
     * how far into the presentation we have navigated.
     */
    function getProgress() {

		var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

        // The number of past and total slides
		var totalCount = getTotalSlides();
        var pastCount = 0;

        // Step through all slides and count the past ones
        mainLoop: for( var i = 0; i < horizontalSlides.length; i++ ) {

            var horizontalSlide = horizontalSlides[i];
            var verticalSlides = toArray( horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) );

            for( var j = 0; j < verticalSlides.length; j++ ) {

                // Stop as soon as we arrive at the present
                if( verticalSlides[j].classList.contains( 'present' ) ) {
                    break mainLoop;
                }

                pastCount++;

            }

            // Stop as soon as we arrive at the present
            if( horizontalSlide.classList.contains( 'present' ) ) {
                break;
            }

            // Don't count the wrapping section for vertical slides
            if( horizontalSlide.classList.contains( 'stack' ) === false ) {
                pastCount++;
            }

        }

        var hasFragments = false;

        if( currentSlide ) {

            var allFragments = currentSlide.querySelectorAll( '.fragment' );

            // If there are fragments in the current slide those should be
            // accounted for in the progress.
            if( allFragments.length > 0 ) {
                var visibleFragments = currentSlide.querySelectorAll( '.fragment.visible' );

                // This value represents how big a portion of the slide progress
                // that is made up by its fragments (0-1)
                var fragmentWeight = (totalCount > 1 ? 0.9 : 1.0);

                // Add fragment progress to the past slide count
                pastCount += ( visibleFragments.length / allFragments.length ) * fragmentWeight;

                hasFragments = true;
            }

        }

        return totalCount > 1 ? pastCount / ( totalCount - 1 ) : hasFragments ? pastCount : 1;

    }

    /**
     * Checks if this presentation is running inside of the
     * speaker notes window.
     */
    function isSpeakerNotes() {

        return !!window.location.search.match( /receiver/gi );

    }

    /**
     * Reads the current URL (hash) and navigates accordingly.
     */
    function readURL() {

        var hash = window.location.hash;

        // Attempt to parse the hash as either an index or name
        var bits = hash.slice( 2 ).split( '/' ),
            name = hash.replace( /#|\//gi, '' );

        // If the first bit is invalid and there is a name we can
        // assume that this is a named link
        if( isNaN( parseInt( bits[0], 10 ) ) && name.length ) {
            var element;

			// Ensure the named link is a valid HTML ID attribute
			if( /^[a-zA-Z][\w:.-]*$/.test( name ) ) {
				// Find the slide with the specified ID
                element = document.querySelector( '#' + name );
            }

            if( element ) {
                // Find the position of the named slide and navigate to it
                var indices = getIndices( element );
                slide( indices.h, indices.v, indices.f );
            }
            // If the slide doesn't exist, navigate to the current slide
            else {
                slide( indexh || 0, indexv || 0 );
            }
        }
        else {
            // Read the index components of the hash
            var h = parseInt( bits[0], 10 ) || 0,
                v = parseInt( bits[1], 10 ) || 0;

            if( h !== indexh || v !== indexv ) {
                slide( h, v );
            }
        }

    }

    /**
     * Updates the page URL (hash) to reflect the current
     * state.
     *
     * @param {Number} delay The time in ms to wait before
     * writing the hash
     */
    function writeURL( delay ) {

        if( config.history ) {

            // Make sure there's never more than one timeout running
            clearTimeout( writeURLTimeout );
            writeURLTimeout = null;

            // If a delay is specified, timeout this call
            if( typeof delay === 'number' ) {
                writeURLTimeout = setTimeout( writeURL, delay );
            }
			else if( currentSlide ) {
                var url = '/';

                // Attempt to create a named link based on the slide's ID
                var id = currentSlide.getAttribute( 'id' );
                // If the current slide has an ID, use that as a named link.
                // Ensure the named link is a valid HTML ID attribute -- this check mirrors the one in #readURL().
                if( typeof id === 'string' && id.length && /^[a-zA-Z][\w:.-]*$/.test( id ) ) {
                    url = '/' + id;
                }
                // Otherwise use the /h/v index
                else {
                    if( indexh > 0 || indexv > 0 ) url += indexh;
                    if( indexv > 0 ) url += '/' + indexv;
                }

                window.location.hash = url;
            }
        }

    }

    /**
     * Retrieves the h/v location of the current, or specified,
     * slide.
     *
     * @param {HTMLElement} element If specified, the returned
     * index will be for the specified slide rather than the currently
     * active one. The `element` can be either the slide HTMLElement 
     * itself or a HTMLElement contained within a slide. 
     *
     * @return {Object} { h: <int>, v: <int>, f: <int> }
     * @return {Boolean} FALSE when the `element` argument is specified and it is not a slide, fragment or child element thereof.
     * @return {Boolean} FALSE when the `element` argument is null (not specified) and no slide is 'current' yet.
     */
    function getIndices( element ) {

        // By default, return the current indices
        var h = indexh,
            v = indexv,
            f = undefined,
            fragments;

        // Find out if this is a slide DOM node or a child node:
        // in the latter case, we need to find the parent fragment / slide.
        var slide = element;
        while (slide && !slide.nodeName.match( /^section$/i )) {
            if (slide.classList && slide.classList.contains('fragment')) {
                if( slide.hasAttribute( 'data-fragment-index' ) ) {
                    f = parseInt( slide.getAttribute( 'data-fragment-index' ), 10 ) || 0;
                }
            }
            slide = slide.parentNode;
        }
        // When the element was specified but proved not to be a slide or a child thereof, we return FALSE.
        if ( element && !slide ) {
            return false;
        }
        // When no element/slide was specified and we don't have a 'current' slide yet, we also return FALSE.
        if ( !slide && !currentSlide ) {
            return false;
        }

        // If a slide is specified, return the indices of that slide
        if( slide ) {
            var isVertical = isVerticalSlide( slide );
            var slideh = isVertical ? slide.parentNode : slide;

            // Select all horizontal slides
			var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

            // Now that we know which the horizontal slide is, get its index
            h = Math.max( horizontalSlides.indexOf( slideh ), 0 );

			// Assume we're not vertical
			v = undefined;

            // If this is a vertical slide, grab the vertical index
            if( isVertical ) {
                v = Math.max( toArray( slideh.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ).indexOf( slide ), 0 );
            }
        }

        if( config.fragments ) {
            if( !slide ) {
                var currentFragment = currentSlide.querySelector( '.fragment.visible.current-fragment' );
                if( currentFragment ) {
                    f = parseInt( currentFragment.getAttribute( 'data-fragment-index' ), 10 ) || 0;
                }
                else {
                    fragments = currentSlide.querySelectorAll( '.fragment' );
                    if( fragments.length ) {
                        // signal that we are not yet showing *any* of the fragments yet
                        f = -1;
                    }
                }
            }
            else {
                if ( f === undefined ) {
                    // We didn't get an element that's inside a fragment, so it's part of the entire slide.
                    // Nevertheless, we'ld like to know which fragments are visible, already.
                    fragments = slide.querySelectorAll( '.fragment' );
                    if ( fragments.length ) {
                        var visibleFragments = slide.querySelectorAll( '.fragment.visible' );
                        if ( visibleFragments.length === 0 ) {
                            // signal that we are not yet showing *any* of the fragments yet
                            f = -1;
                        }
                        else {
                            f = visibleFragments.length - 1;
                        }
                    }
                }
            }
        }

        return { h: h, v: v, f: f };

    }

    /**
     * Retrieves the total number of slides in this presentation.
     */
    function getTotalSlides() {

        // Count all slides, horizontal and vertical, but do NOT count the horizontal wrapper slides which contain vertical slides.
        //
        // The calculus is constructed this way because (a) SLIDES_SELECTOR is a compound selector and thus 
        //    SLIDES_SELECTOR + ':not(.stack)'
        // would not deliver, and (b) the above ':not(.stack)' fails anyway because *vertical* slides which have *fragments* are also
        // tagged with the `stack` class. 
		return dom.wrapper.querySelectorAll( SLIDES_SELECTOR ).length - dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.stack' ).length;

	}

	/**
	 * Returns the slide element matching the specified index.
     *                                                           
     * Note:
     *
     * When the `y` vertical index is invalid or non-existent as a slide, 
     * then the 'horizontal slide' as index `x` is produced instead.
	 */    
	function getSlide( x, y ) {

		var horizontalSlide = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) )[ x ];
        var verticalSlides = horizontalSlide && horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );

		if( verticalSlides && verticalSlides.length && typeof y === 'number' ) {
			var slide = verticalSlides[ y ];
            if( slide ) {
                return slide;
            }
		}

		return horizontalSlide;

	}

	/**
	 * Returns the background element for the given slide.
     *                                                           
     * Note:
     *
	 * All slides, even the ones with no background properties
	 * defined, have a background element so as long as the
	 * index is valid an element will be returned, once the backgrounds
     * have been created through the invocation of `createBackgrounds()`.
	 */
	function getSlideBackground( x, y ) {

        var slide = getSlide( x, y );

		// When printing to PDF the slide backgrounds are nested
		// inside of the slides
		if( isPrintingPDF() ) {
			if( slide ) {
				var background = slide.querySelector( ':scope > .slide-background' );
				if( background && background.parentNode === slide ) {
					return background;
				}
			}

			return undefined;
		}

		var horizontalBackground = toArray( dom.background.querySelectorAll( ':scope > .slide-background' ) )[ x ];
		var verticalBackgrounds = horizontalBackground && horizontalBackground.querySelectorAll( ':scope > .slide-background' );

		if( typeof y === 'number' && slide && isVerticalSlide( slide ) ) {
			return (verticalBackgrounds && verticalBackgrounds.length) ? verticalBackgrounds[ y ] : undefined;
		}

		return horizontalBackground;

    }

    /**
     * Retrieves the current state of the presentation as
     * an object. This state can then be restored at any
     * time.
     */
    function getState() {

        var indices = getIndices();

        return {
            indexh: indices.h,
            indexv: indices.v,
            indexf: indices.f,
            paused: isPaused(),
            overview: isOverview()
        };

    }

    /**
     * Restores the presentation to the given state.
     *
     * @param {Object} state As generated by getState()
     */
    function setState( state ) {

        if( typeof state === 'object' ) {
            slide( deserialize( state.indexh ), deserialize( state.indexv ), deserialize( state.indexf ) );

            var pausedFlag = deserialize( state.paused ),
                overviewFlag = deserialize( state.overview );

            if( typeof pausedFlag === 'boolean' && pausedFlag !== isPaused() ) {
                togglePause( pausedFlag );
            }

            if( typeof overviewFlag === 'boolean' && overviewFlag !== isOverview() ) {
                toggleOverview( overviewFlag );
            }
        }

    }

    /**
     * Return a sorted fragments list, ordered by an increasing
     * 'data-fragment-index' attribute.
     *
     * Fragments will be revealed in the order that they are returned by
     * this function, so you can use the index attributes to control the
     * order of fragment appearance.
     *
     * To maintain a sensible default fragment order, fragments are presumed
     * to be passed in document order. This function adds a 'fragment-index'
     * attribute to each node if such an attribute is not already present,
     * and sets that attribute to an integer value which is the position of
     * the fragment within the fragments list.
     */
    function sortFragments( fragments ) {

        fragments = toArray( fragments );

        var ordered = [],
            unordered = [],
            sorted = [];

        // Group ordered and unordered elements
        fragments.forEach( function( fragment, i ) {
            if( fragment.hasAttribute( 'data-fragment-index' ) ) {
                var index = parseInt( fragment.getAttribute( 'data-fragment-index' ), 10 ) || 0;

                if( !ordered[index] ) {
                    ordered[index] = [];
                }

                ordered[index].push( fragment );
            }
            else {
                unordered.push( [ fragment ] );
            }
        } );

        // Append fragments without explicit indices in their
        // DOM order
        ordered = ordered.concat( unordered );

        // Manually count the index up per group to ensure there
        // are no gaps
        var index = 0;

        // Push all fragments in their sorted order to an array,
        // this flattens the groups
        ordered.forEach( function( group ) {
            group.forEach( function( fragment ) {
                sorted.push( fragment );
                fragment.setAttribute( 'data-fragment-index', index );
            } );

            index ++;
        } );

        return sorted;

    }

    /**
     * Navigate to the specified slide fragment.
     *
     * @param {Number} index The index of the fragment that
     * should be shown, -1 means all are invisible
     * @param {Number} offset Integer offset to apply to the
     * fragment index
     *
     * @return {Boolean} true if a change was made in any
     * fragments visibility as part of this call
     */
    function navigateFragment( index, offset ) {

        if( currentSlide && config.fragments ) {

            var fragments = sortFragments( currentSlide.querySelectorAll( '.fragment' ) );
            if( fragments.length ) {

                // If no index is specified, find the current
                if( typeof index !== 'number' ) {
                    var lastVisibleFragment = sortFragments( currentSlide.querySelectorAll( '.fragment.visible' ) ).pop();

                    if( lastVisibleFragment ) {
                        assert(lastVisibleFragment.getAttribute( 'data-fragment-index' ) != null);
                        index = parseInt( lastVisibleFragment.getAttribute( 'data-fragment-index' ), 10 ) || 0;
                    }
                    else {
                        index = -1;
                    }
                }

                // If an offset is specified, apply it to the index
                if( typeof offset === 'number' ) {
                    index += offset;
                }

                // Clip the index to the allowed range: { -1 .. length-1 }
                // thus preventing the last fragment from becoming 'not-current': that
                // situation should be handled by the calling navigation code by moving
                // to the next slide.
                index = Math.max( -1, Math.min( index, fragments.length - 1 ) );

                var fragmentsShown = [],
                    fragmentsHidden = [];

                toArray( fragments ).forEach( function( element, i ) {

                    assert(element.getAttribute( 'data-fragment-index' ) != null);
                    if( element.hasAttribute( 'data-fragment-index' ) ) {
                        i = parseInt( element.getAttribute( 'data-fragment-index' ), 10 ) || 0;
                    }

                    // Visible fragments
                    if( i <= index ) {
                        if( !element.classList.contains( 'visible' ) ) {
                            fragmentsShown.push( element );
                        }
                        element.classList.add( 'visible' );
                        element.classList.remove( 'current-fragment' );

						// Announce the fragments one by one to the Screen Reader
						dom.statusDiv.innerHTML = element.textContent;

                        if( i === index ) {
                            element.classList.add( 'current-fragment' );
                        }
                    }
                    // Hidden fragments
                    else {
                        if( element.classList.contains( 'visible' ) ) {
                            fragmentsHidden.push( element );
                        }
                        element.classList.remove( 'visible' );
                        element.classList.remove( 'current-fragment' );
                    }

                } );

                if( fragmentsHidden.length ) {
                    dispatchEvent( 'fragmenthidden', { 
                        fragment: fragmentsHidden[0], 
                        fragments: fragmentsHidden,
                        currentFragmentIndex: index,
                        fragmentHiddenCount: fragmentsHidden.length
                    } );
                }

                if( fragmentsShown.length ) {
                    dispatchEvent( 'fragmentshown', { 
                        fragment: fragmentsShown[0], 
                        fragments: fragmentsShown,
                        currentFragmentIndex: index,
                        fragmentShownCount: fragmentsShown.length 
                    } );
                }

                updateControls();
                updateProgress();
                updateSlideNumber();

                return !!( fragmentsShown.length || fragmentsHidden.length );

            }

        }

        return false;

    }

    /**
     * Navigate to the next slide fragment.
     *
     * @return {Boolean} true if there was a next fragment,
     * false otherwise
     */
    function nextFragment() {

        return navigateFragment( null, 1 );

    }

    /**
     * Navigate to the previous slide fragment.
     *
     * @return {Boolean} true if there was a previous fragment,
     * false otherwise
     */
    function previousFragment() {

        return navigateFragment( null, -1 );

    }

    /**
     * Cues a new automated slide if enabled in the config.
     */
    function cueAutoSlide() {

        cancelAutoSlide();

        if( currentSlide ) {

            var currentFragment = currentSlide.querySelector( '.current-fragment' );

            var fragmentAutoSlide = currentFragment ? currentFragment.getAttribute( 'data-autoslide' ) : null;
            var parentAutoSlide = currentSlide.parentNode ? currentSlide.parentNode.getAttribute( 'data-autoslide' ) : null;
            var slideAutoSlide = currentSlide.getAttribute( 'data-autoslide' );

            // Pick value in the following priority order:
            // 1. Current fragment's data-autoslide
            // 2. Current slide's data-autoslide
            // 3. Parent slide's data-autoslide
            // 4. Global autoSlide setting
            if( fragmentAutoSlide ) {
                autoSlide = parseInt( fragmentAutoSlide, 10 );
            }
            else if( slideAutoSlide ) {
                autoSlide = parseInt( slideAutoSlide, 10 );
            }
            else if( parentAutoSlide ) {
                autoSlide = parseInt( parentAutoSlide, 10 );
            }
            else {
                autoSlide = config.autoSlide;
            }

            // If there are media elements with data-autoplay,
            // automatically set the autoSlide duration to the
            // length of that media
            toArray( currentSlide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
                if( el.hasAttribute( 'data-autoplay' ) ) {
                    if( autoSlide && el.duration * 1000 > autoSlide ) {
                        autoSlide = ( el.duration * 1000 ) + 1000;
                    }
                }
            } );

            // Cue the next auto-slide if:
            // - There is an autoSlide value
            // - Auto-sliding isn't paused by the user
            // - The presentation isn't paused
            // - The overview isn't active
            // - The presentation isn't over
            if( autoSlide && !autoSlidePaused && !isPaused() && !isOverview() && ( !Reveal.isLastSlide() || config.loop ) ) {
                autoSlideTimeout = setTimeout( navigateNext, autoSlide );
                autoSlideStartTime = Date.now();
            }

            if( autoSlidePlayer ) {
                autoSlidePlayer.setPlaying( autoSlideTimeout !== -1 );
            }

        }

    }

    /**
     * Cancels any ongoing request to auto-slide.
     */
    function cancelAutoSlide() {

        clearTimeout( autoSlideTimeout );
        autoSlideTimeout = -1;

    }

    function pauseAutoSlide() {

        if( autoSlide && !autoSlidePaused ) {
            autoSlidePaused = true;
            dispatchEvent( 'autoslidepaused' );
            clearTimeout( autoSlideTimeout );
            autoSlideTimeout = -1;

            if( autoSlidePlayer ) {
                autoSlidePlayer.setPlaying( false );
            }
        }

    }

    function resumeAutoSlide() {

        if( autoSlide && autoSlidePaused ) {
            autoSlidePaused = false;
            dispatchEvent( 'autoslideresumed' );
            cueAutoSlide();
        }

    }

    function navigateLeft() {

        // Reverse for RTL
        if( config.rtl ) {
            if( ( isOverview() || nextFragment() === false ) && availableRoutes().left ) {
                slide( indexh + 1 );
            }
        }
        // Normal navigation
        else if( ( isOverview() || previousFragment() === false ) && availableRoutes().left ) {
            slide( indexh - 1, null, Infinity );
        }

    }

    function navigateRight() {

        // Reverse for RTL
        if( config.rtl ) {
            if( ( isOverview() || previousFragment() === false ) && availableRoutes().right ) {
                slide( indexh - 1, null, Infinity );
            }
        }
        // Normal navigation
        else if( ( isOverview() || nextFragment() === false ) && availableRoutes().right ) {
            slide( indexh + 1 );
        }

    }

    function navigateUp() {

        // Prioritize hiding fragments
        if( ( isOverview() || previousFragment() === false ) && availableRoutes().up ) {
            assert( typeof indexv === 'number' && isFinite(indexv) && indexv >= 1 ); 
            slide( indexh, indexv - 1, Infinity );
        }

    }

    function navigateDown() {

        // Prioritize revealing fragments
        if( ( isOverview() || nextFragment() === false ) && availableRoutes().down ) {
            assert( typeof indexv === 'number' && isFinite(indexv) && indexv >= 0 ); 
            slide( indexh, indexv + 1 );
        }

    }

    /**
     * Navigates backwards, prioritized in the following order:
     * 1) Previous fragment
     * 2) Previous vertical slide
     * 3) Previous horizontal slide
     */
    function navigatePrev() {

        // Prioritize revealing fragments
        if( isOverview() || previousFragment() === false ) {
            if( availableRoutes().up ) {
                navigateUp();
            }
            else {
                navigateLeft();
            }
        }

    }

    /**
     * Same as #navigatePrev() but navigates forwards.
     */
    function navigateNext() {

        // Prioritize revealing fragments
        if( isOverview() || nextFragment() === false ) {
            if (availableRoutes().down) {
                navigateDown();
            }
            else {
                navigateRight();
            }
        }

    }


    // --------------------------------------------------------------------//
    // ----------------------------- EVENTS -------------------------------//
    // --------------------------------------------------------------------//

    /**
     * Called by all event handlers that are based on user
     * input.
     */
    function onUserInput( event ) {

        if( config.autoSlideStoppable ) {
            pauseAutoSlide();
        }

    }

    /**
	 * Handler for the document level 'keypress' event.
	 */
	function onDocumentKeyPress( event ) {

        // If there's a condition specified and it returns false,
        // ignore this event
        if( typeof config.keyboardCondition === 'function' && config.keyboardCondition( event ) === false ) {
            return true;
        }

        // Check if there's a focused element that could be using
        // the keyboard
        var activeElementIsCE = document.activeElement && document.activeElement.contentEditable !== 'inherit';
        var activeElementIsInput = document.activeElement && document.activeElement.tagName && /input|textarea/i.test( document.activeElement.tagName );
        var hasFocus = !!( document.activeElement && ( document.activeElement.type || document.activeElement.href || document.activeElement.contentEditable !== 'inherit' ) );

        console.log('onKeyPress: ', {
            hasFocus: hasFocus, 
            activeElement: document.activeElement, 
            activeElementIsCE: activeElementIsCE, 
            activeElementIsInput: activeElementIsInput, 
            nodeName: (document.activeElement && document.activeElement.nodeName), 
            nodeType: (document.activeElement && document.activeElement.type), 
            nodeHREF: (document.activeElement && document.activeElement.href), 
            nodeContentEditable: (document.activeElement && document.activeElement.contentEditable), 
            hidden: (document.activeElement ? document.activeElement.getAttribute('hidden') : '---'), 
            key_shift: event.shiftKey, 
            key_code: event.keyCode, 
            key_alt: event.altKey, 
            key_ctrl: event.ctrlKey, 
            key_meta: event.metaKey, 
            paused: isPaused()
        });

		// Check if the pressed key is question mark
		if( event.charCode === 63 ) {
			if( dom.overlay ) {
				closeOverlay();
			}
			else {
				showHelp( true );
			}
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
		}

	}

	/**
     * Handler for the document level 'keydown' event.
     *
     * @param {Object} event
     */
    function onDocumentKeyDown( event ) {

        // If there's a condition specified and it returns false,
        // ignore this event
        if( typeof config.keyboardCondition === 'function' && config.keyboardCondition( event ) === false ) {
            return true;
        }

        // Remember if auto-sliding was paused so we can toggle it
        var autoSlideWasPaused = autoSlidePaused;

        onUserInput( event );

        // Check if there's a focused element that could be using
        // the keyboard
		var activeElementIsCE = document.activeElement && document.activeElement.contentEditable !== 'inherit';
		var activeElementIsInput = document.activeElement && document.activeElement.tagName && /input|textarea/i.test( document.activeElement.tagName );
        var hasFocus = !!( document.activeElement && ( document.activeElement.type || document.activeElement.href || document.activeElement.contentEditable !== 'inherit' ) );

        // Disregard the event if the focused element is located in a hidden slide (a 'past' or 'future' slide)
        var tag = (document.activeElement && document.activeElement.nodeName);
        if (tag.match( /^section$/i ) && document.activeElement.classList &&
            (document.activeElement.classList.contains( 'past' ) || document.activeElement.classList.contains( 'future' )))
        {
            hasFocus = false;

            // http://stackoverflow.com/questions/6976486/is-there-any-way-in-javascript-to-focus-the-document-content-area

            // Give the document focus
            window.focus();

            // Remove focus from any focused element
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }

        // Disregard the event if there's a focused element or a
        // keyboard modifier key is present
        console.log('onKeyDown: ', {
            hasFocus: hasFocus, 
            activeElement: document.activeElement, 
            activeElementIsCE: activeElementIsCE, 
            activeElementIsInput: activeElementIsInput, 
            nodeName: (document.activeElement && document.activeElement.nodeName), 
            nodeType: (document.activeElement && document.activeElement.type), 
            nodeHREF: (document.activeElement && document.activeElement.href), 
            nodeContentEditable: (document.activeElement && document.activeElement.contentEditable), 
            hidden: (document.activeElement ? document.activeElement.getAttribute('hidden') : '---'), 
            key_shift: event.shiftKey, 
            key_code: event.keyCode, 
            key_alt: event.altKey, 
            key_ctrl: event.ctrlKey, 
            key_meta: event.metaKey, 
            paused: isPaused()
        });
		if( activeElementIsCE || activeElementIsInput || (event.shiftKey && event.keyCode !== 32) || event.altKey || event.ctrlKey || event.metaKey ) {
            return 0;
        }

		// While paused only allow 'unpausing' keyboard events ('b', '.' or any key specifically mapped to togglePause)
		var allowedKeys = [66,190,191].concat(Object.keys(toArray(config.keyboard)).map( function (key) {
			if( config.keyboard[key] === 'togglePause' ) {
				return parseInt(key, 10);
			}
		}));
		if( isPaused() && allowedKeys.indexOf( event.keyCode ) === -1 ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
            return false;
        }

        var triggered = false;

        // 1. User defined key bindings
        if( typeof config.keyboard === 'object' ) {

            for( var key in config.keyboard ) {

                // Check if this binding matches the pressed key
                if( parseInt( key, 10 ) === event.keyCode ) {

                    var value = config.keyboard[ key ];

                    // Callback function
                    if( typeof value === 'function' ) {
                        value.apply( null, [ event ] );
                    }
                    // String shortcuts to reveal.js API
                    else if( typeof value === 'string' && typeof Reveal[ value ] === 'function' ) {
                        Reveal[ value ].call();
                    }

                    triggered = true;

                }

            }

        }

        // 2. System defined key bindings
        if( triggered === false ) {

            // Assume true and try to prove false
            triggered = true;

            switch( event.keyCode ) {
                // p, page up
                case 80: case 33: navigatePrev(); break;
                // n, page down
                case 78: case 34: navigateNext(); break;
                // h, left
                case 72: case 37: navigateLeft(); break;
                // l, right
                case 76: case 39: navigateRight(); break;
                // k, up
                case 75: case 38: navigateUp(); break;
                // j, down
                case 74: case 40: navigateDown(); break;
                // home
                case 36: slide( 0, 0, 0 ); break;
                // end
                case 35: slide( Infinity, Infinity, Infinity ); break;
                // space
                case 32:
                    if (isOverview()) {
                        deactivateOverview();
                    }
                    else if (event.shiftKey) {
                        navigatePrev();
                    }
                    else {
                        navigateNext();
                    }
                    break;
                // return
                case 13:
                    if (isOverview()) {
                        deactivateOverview();
                    }
                    else {
                        triggered = false;
                    }
                    break;
                // two-spot, semicolon, b, period, Logitech presenter tools 'black screen' button
                case 58: case 59: case 66: case 190: case 191: togglePause(); break;
                // f
                case 70: enterFullscreen(); break;
                // a
                case 65:
                    if ( config.autoSlideStoppable ) {
                        toggleAutoSlide( autoSlideWasPaused );
                    }
                    break;
                // 0: toggle background image
                case 48:
                    if ( config.parallaxBackgroundImage ) {
                        config.__parallaxBackgroundImage_backup = config.parallaxBackgroundImage;
                        config.parallaxBackgroundImage = '';
                    } else if ( config.__parallaxBackgroundImage_backup ) {
                        config.parallaxBackgroundImage = config.__parallaxBackgroundImage_backup;
                        delete config.__parallaxBackgroundImage_backup;
                    }
                    sync();
                    break;

                // 7: overview shows all; 8: overview is restricted to configured distance limits
                case 55:
                    if (isOverview()) {
                        if ( config.__overviewViewDistance_backup == null ) {
                            config.__overviewViewDistance_backup = config.viewDistance;
                        }
                        // set a distance equivalent to 'infinity'
                        config.viewDistance = Infinity;
                        activateOverview();
                    }
                    break;

                // 8: reset overview to be restricted to configured distance limits
                case 56:
                    if (isOverview()) {
                        if ( config.__overviewViewDistance_backup == null ) {
                            config.__overviewViewDistance_backup = config.viewDistance;
                        }
                        config.viewDistance = config.__overviewViewDistance_backup;
                        activateOverview();
                    }
                    break;

                // ESC or O key
                case 27:
                case 79:
                    if( dom.overlay ) {
                        closeOverlay();
                    }
                    else {
                        toggleOverview();
                    }
                    break;

                default:
                    triggered = false;
                    break;
            }

        }

        // If the input resulted in a triggered action we should prevent
        // the browsers default behavior
        if( triggered ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
        }

        // If auto-sliding is enabled we need to cue up
        // another timeout
        cueAutoSlide();

        return +triggered;

    }

    /**
     * Handler for the 'touchstart' event, enables support for
     * swipe and pinch gestures.
     */
    function onTouchStart( event ) {

        touch.startX = event.touches[0].clientX;
        touch.startY = event.touches[0].clientY;
        touch.startCount = event.touches.length;

        // If there's two touches we need to memorize the distance
        // between those two points to detect pinching
        if( event.touches.length === 2 && config.overview ) {
            touch.startSpan = distanceBetween( {
                x: event.touches[1].clientX,
                y: event.touches[1].clientY
            }, {
                x: touch.startX,
                y: touch.startY
            } );
        }

    }

    /**
     * Handler for the 'touchmove' event.
     */
    function onTouchMove( event ) {

        // Each touch should only trigger one action
        if( !touch.captured ) {
            onUserInput( event );

            var currentX = event.touches[0].clientX;
            var currentY = event.touches[0].clientY;

            // If the touch started with two points and still has
            // two active touches; test for the pinch gesture
            if( event.touches.length === 2 && touch.startCount === 2 && config.overview ) {

                // The current distance in pixels between the two touch points
                var currentSpan = distanceBetween( {
                    x: event.touches[1].clientX,
                    y: event.touches[1].clientY
                }, {
                    x: touch.startX,
                    y: touch.startY
                } );

                // If the span is larger than the desired amount we've got
                // ourselves a pinch
                if( Math.abs( touch.startSpan - currentSpan ) > touch.threshold ) {
                    touch.captured = true;

                    if( currentSpan < touch.startSpan ) {
                        activateOverview();
                    }
                    else {
                        deactivateOverview();
                    }
                }

                event.preventDefault();

            }
            // There was only one touch point, look for a swipe
            else if( event.touches.length === 1 && touch.startCount !== 2 ) {

                var deltaX = currentX - touch.startX,
                    deltaY = currentY - touch.startY;

                if( deltaX > touch.threshold && Math.abs( deltaX ) > Math.abs( deltaY ) ) {
                    touch.captured = true;
                    navigateLeft();
                }
                else if( deltaX < -touch.threshold && Math.abs( deltaX ) > Math.abs( deltaY ) ) {
                    touch.captured = true;
                    navigateRight();
                }
                else if( deltaY > touch.threshold ) {
                    touch.captured = true;
                    navigateUp();
                }
                else if( deltaY < -touch.threshold ) {
                    touch.captured = true;
                    navigateDown();
                }

                // If we're embedded, only block touch events if they have
                // triggered an action
                if( config.embedded ) {
                    if( touch.captured || isVerticalSlide( currentSlide ) ) {
                        event.preventDefault();
                    }
                }
                // Not embedded? Block them all to avoid needless tossing
                // around of the viewport in iOS
                else {
                    event.preventDefault();
                }

            }
        }
        // There's a bug with swiping on some Android devices unless
        // the default action is always prevented
        else if( navigator.userAgent.match( /android/gi ) ) {
            event.preventDefault();
        }

    }

    /**
     * Handler for the 'touchend' event.
     */
    function onTouchEnd( event ) {

        touch.captured = false;

    }

    /**
     * Convert pointer down to touch start.
     */
    function onPointerDown( event ) {

        if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch' ) {
            event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
            onTouchStart( event );
        }

    }

    /**
     * Convert pointer move to touch move.
     */
    function onPointerMove( event ) {

        if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch' )  {
            event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
            onTouchMove( event );
        }

    }

    /**
     * Convert pointer up to touch end.
     */
    function onPointerUp( event ) {

        if( event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch' )  {
            event.touches = [{ clientX: event.clientX, clientY: event.clientY }];
            onTouchEnd( event );
        }

    }

    /**
     * Handles mouse wheel scrolling, throttled to avoid skipping
     * multiple slides.
     */
    function onDocumentMouseScroll( event ) {

        if( Date.now() - lastMouseWheelStep > 600 ) {

            lastMouseWheelStep = Date.now();

            var delta = event.detail || -event.wheelDelta;
            if( delta > 0 ) {
                navigateNext();
            }
            else {
                navigatePrev();
            }

        }

    }

    /**
     * Clicking on the progress bar results in a navigation to the
     * closest approximate slide. As the progressbar represents the
     * actual slide position (mixed horizontal and vertical) hence
     * it makes sense to translate the click event to a (h, v) slide
     * coordinate, i.e. reverse transformation.
     */
    function onProgressClicked( event ) {

        onUserInput( event );

        event.preventDefault();

        var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

        // The number of past and total slides
        var totalCount = getTotalSlides();
        // 'round' the click position back to slide index
        var slideIndex = Math.floor( 0.5 + ( event.clientX / window.innerWidth /* dom.wrapper.offsetWidth */ ) * (totalCount - 1) );
        var pastCount = 0;
        var h, v;

        // Step through all slides and count the past ones
        mainLoop: for( var i = 0; i < horizontalSlides.length; i++ ) {

            if (pastCount === slideIndex) {
                h = i;
                v = 0;
                break mainLoop;
            }

            var horizontalSlide = horizontalSlides[i];
            var verticalSlides = toArray( horizontalSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) );

            for( var j = 0; j < verticalSlides.length; j++ ) {
                if (pastCount === slideIndex) {
                    h = i;
                    v = j;
                    break mainLoop;
                }

                pastCount++;
            }

            // Don't count the wrapping section for vertical slides
            if( horizontalSlide.classList.contains( 'stack' ) === false ) {
                pastCount++;
            }
        }

        slide( h, v );

    }

    /**
     * Event handler for navigation control buttons.
     */
    function onNavigateLeftClicked( event ) { event.preventDefault(); onUserInput(); navigateLeft(); }
    function onNavigateRightClicked( event ) { event.preventDefault(); onUserInput(); navigateRight(); }
    function onNavigateUpClicked( event ) { event.preventDefault(); onUserInput(); navigateUp(); }
    function onNavigateDownClicked( event ) { event.preventDefault(); onUserInput(); navigateDown(); }
    function onNavigatePrevClicked( event ) { event.preventDefault(); onUserInput(); navigatePrev(); }
    function onNavigateNextClicked( event ) { event.preventDefault(); onUserInput(); navigateNext(); }

    /**
     * Handler for the window level 'hashchange' event.
     */
    function onWindowHashChange( event ) {

        readURL();

    }

    /**
     * Handler for the window level 'resize' event.
     */
    function onWindowResize( event ) {

        layout();

    }

    /**
     * Handle for the window level 'visibilitychange' event.
     */
    function onPageVisibilityChange( event ) {

        var isHidden =  document.webkitHidden ||
                        document.msHidden ||
                        document.hidden;

        // If, after clicking a link or similar and we're coming back,
        // focus the document.body to ensure we can use keyboard shortcuts
        if( isHidden === false && document.activeElement !== document.body ) {
            document.activeElement.blur();
            document.body.focus();
        }

    }

    /**
     * Invoked when a slide is clicked and we're in the overview.
     */
    function onOverviewSlideClicked( event ) {

        if( eventsAreBound && isOverview() ) {
            event.preventDefault();

            var element = event.target;

            while( element && !element.nodeName.match( /^section$/i ) ) {
                element = element.parentNode;
            }

            if( element && !element.classList.contains( 'disabled' ) ) {

                deactivateOverview();

                if( element.nodeName.match( /^section$/i ) ) {
                    var h = parseInt( element.getAttribute( 'data-index-h' ), 10 ),
                        v = parseInt( element.getAttribute( 'data-index-v' ), 10 );

                    slide( h, v );
                }

            }
        }

    }

    /**
     * Handles clicks on links that are set to preview in the
     * iframe overlay.
     */
    function onPreviewLinkClicked( event ) {

        var url = event.target.getAttribute( 'href' );
        if( url ) {
			showPreview( url );
            event.preventDefault();
        }

    }

    /**
     * Handles click on the auto-sliding controls element.
     */
    function onAutoSlidePlayerClick( event ) {

        // Replay
        if( Reveal.isLastSlide() && !config.loop ) {
            slide( 0, 0, 0 );
            resumeAutoSlide();
        }
        // Resume
        else if( autoSlidePaused ) {
            resumeAutoSlide();
        }
        // Pause
        else {
            pauseAutoSlide();
        }

    }


    // --------------------------------------------------------------------//
    // ------------------------ PLAYBACK COMPONENT ------------------------//
    // --------------------------------------------------------------------//


    /**
     * Constructor for the playback component, which displays
     * play/pause/progress controls.
     *
     * @param {HTMLElement} container The component will append
     * itself to this
     * @param {Function} progressCheck A method which will be
     * called frequently to get the current progress on a range
     * of 0-1
     */
    function Playback( container, progressCheck ) {

        // Cosmetics
        this.diameter = 50;
        this.thickness = 3;

        // Flags if we are currently playing
        this.playing = false;

        // Current progress on a 0-1 range
        this.progress = 0;

        // Used to loop the animation smoothly
        this.progressOffset = 1;

        this.container = container;
        this.progressCheck = progressCheck;

        this.canvas = document.createElement( 'canvas' );
        this.canvas.className = 'playback';
        this.canvas.width = this.diameter;
        this.canvas.height = this.diameter;
        this.context = this.canvas.getContext( '2d' );

        this.container.appendChild( this.canvas );

        this.render();

    }

    Playback.prototype.setPlaying = function( value ) {

        var wasPlaying = this.playing;

        this.playing = value;

        // Start repainting if we weren't already
        if( !wasPlaying && this.playing ) {
            this.animate();
        }
        else {
            this.render();
        }

    };

    Playback.prototype.animate = function() {

        var progressBefore = this.progress;

        this.progress = this.progressCheck();

        // When we loop, offset the progress so that it eases
        // smoothly rather than immediately resetting
        if( progressBefore > 0.8 && this.progress < 0.2 ) {
            this.progressOffset = this.progress;
        }

        this.render();

        if( this.playing ) {
            features.requestAnimationFrameMethod.call( window, this.animate.bind( this ) );
        }

    };

    /**
     * Renders the current progress and playback state.
     */
    Playback.prototype.render = function() {

        var progress = this.playing ? this.progress : 0,
            radius = ( this.diameter / 2 ) - this.thickness,
            x = this.diameter / 2,
            y = this.diameter / 2,
            iconSize = 14;

        // Ease towards 1
        this.progressOffset += ( 1 - this.progressOffset ) * 0.1;

        var endAngle = ( - Math.PI / 2 ) + ( progress * ( Math.PI * 2 ) );
        var startAngle = ( - Math.PI / 2 ) + ( this.progressOffset * ( Math.PI * 2 ) );

        this.context.save();
        this.context.clearRect( 0, 0, this.diameter, this.diameter );

        // Solid background color
        this.context.beginPath();
        this.context.arc( x, y, radius + 2, 0, Math.PI * 2, false );
        this.context.fillStyle = 'rgba( 0, 0, 0, 0.4 )';
        this.context.fill();

        // Draw progress track
        this.context.beginPath();
        this.context.arc( x, y, radius, 0, Math.PI * 2, false );
        this.context.lineWidth = this.thickness;
        this.context.strokeStyle = '#666';
        this.context.stroke();

        if( this.playing ) {
            // Draw progress on top of track
            this.context.beginPath();
            this.context.arc( x, y, radius, startAngle, endAngle, false );
            this.context.lineWidth = this.thickness;
            this.context.strokeStyle = '#fff';
            this.context.stroke();
        }

        this.context.translate( x - ( iconSize / 2 ), y - ( iconSize / 2 ) );

        // Draw play/pause icons
        if( this.playing ) {
            this.context.fillStyle = '#fff';
            this.context.fillRect( 0, 0, iconSize / 2 - 2, iconSize );
            this.context.fillRect( iconSize / 2 + 2, 0, iconSize / 2 - 2, iconSize );
        }
        else {
            this.context.beginPath();
            this.context.translate( 2, 0 );
            this.context.moveTo( 0, 0 );
            this.context.lineTo( iconSize - 2, iconSize / 2 );
            this.context.lineTo( 0, iconSize );
            this.context.fillStyle = '#fff';
            this.context.fill();
        }

        this.context.restore();

    };

    Playback.prototype.on = function( type, listener ) {
        this.canvas.addEventListener( type, listener, false );
    };

    Playback.prototype.off = function( type, listener ) {
        this.canvas.removeEventListener( type, listener, false );
    };

    Playback.prototype.destroy = function() {

        this.playing = false;

        if( this.canvas.parentNode ) {
            this.container.removeChild( this.canvas );
        }

    };


    // --------------------------------------------------------------------//
    // ------------------------------- API --------------------------------//
    // --------------------------------------------------------------------//


    Reveal = {
        initialize: initialize,
        configure: configure,
        sync: sync,
        restart: restart,

        generateKickstarter: generateKickstarter,

        // Navigation methods
        slide: slide,
        left: navigateLeft,
        right: navigateRight,
        up: navigateUp,
        down: navigateDown,
        prev: navigatePrev,
        next: navigateNext,

        // Fragment methods
        navigateFragment: navigateFragment,
        prevFragment: previousFragment,
        nextFragment: nextFragment,

        // Deprecated aliases
        navigateTo: slide,
        navigateLeft: navigateLeft,
        navigateRight: navigateRight,
        navigateUp: navigateUp,
        navigateDown: navigateDown,
        navigatePrev: navigatePrev,
        navigateNext: navigateNext,

        // Forces an update in slide layout
        layout: layout,

        // Returns an object with the available routes as booleans (left/right/top/bottom)
        availableRoutes: availableRoutes,

        // Returns an object with the available fragments as booleans (prev/next)
        availableFragments: availableFragments,

        // Toggles the overview mode on/off
        toggleOverview: toggleOverview,

        // Toggles the 'black screen' mode on/off
        togglePause: togglePause,

        // Toggles the auto slide mode on/off
        toggleAutoSlide: toggleAutoSlide,

        // State checks
        isOverview: isOverview,
        isPaused: isPaused,
        isAutoSliding: isAutoSliding,

        // Adds or removes all internal event listeners (such as keyboard)
        addEventListeners: addEventListeners,
        removeEventListeners: removeEventListeners,

        // Facility for persisting and restoring the presentation state
        getState: getState,
        setState: setState,

        // Presentation progress on range of 0-1
        getProgress: getProgress,

        // Returns the indices of the current, or specified, slide
        getIndices: getIndices,

        getTotalSlides: getTotalSlides,

		// Returns the slide element at the specified index
		getSlide: getSlide,

		// Returns the slide background element at the specified index
		getSlideBackground: getSlideBackground,

        // Returns the previous slide element, may be null
        getPreviousSlide: function() {
            return previousSlide;
        },

        // Returns the current slide element
        getCurrentSlide: function() {
            return currentSlide;
        },

        getComputedSlideSizeInfo: getComputedSlideSize,

        getViewPortSizeInfo: getViewportAndSlideDimensionsInfo,

        getElementStyle: getStyle,

        // Returns the current scale of the presentation content
        getScale: function() {
            return scale;
        },

        // Returns the current configuration object
        getConfig: function() {
            return config;
        },

        // Helper method, retrieves query string as a key/value hash
        getQueryHash: function() {
            var query = {};

            window.location.search.replace( /[A-Z0-9]+?=([\w\.%-]*)/gi, function(a) {
                query[ a.split( '=' ).shift() ] = a.split( '=' ).pop();
            } );

            // Basic deserialization
            for( var i in query ) {
                var value = query[ i ];

                query[ i ] = deserialize( unescape( value ) );
            }

            return query;
        },

        // Returns true if we're currently on the first slide
        isFirstSlide: function() {
			return ( indexh === 0 && indexv === 0 );
        },

        // Returns true if we're currently on the last slide
        isLastSlide: function() {
            if( currentSlide ) {
                // Does this slide have a next sibling?
                if( currentSlide.nextElementSibling ) return false;

                // If it's vertical, does its parent have a next sibling?
                if( isVerticalSlide( currentSlide ) && currentSlide.parentNode.nextElementSibling ) return false;

                return true;
            }

            return false;
        },

        // Checks if reveal.js has been loaded and is ready for use
        isReady: function() {
            return loaded;
        },

        // Forward event binding to the reveal DOM element
        addEventListener: function( type, listener, useCapture ) {
            if( 'addEventListener' in window ) {
                // queue registration if dom.wrapper is not yet set up
                if( !dom.wrapper ) {
                    queuedEventListenerRegistrations.push({
                        type: type,
                        listener: listener,
                        useCapture: useCapture,
                        add: true
                    });
                }
                else {
                    dom.wrapper.addEventListener( type, listener, useCapture );
                }
            }
        },
        removeEventListener: function( type, listener, useCapture ) {
            if( 'addEventListener' in window ) {
                // queue registration if dom.wrapper is not yet set up
                if( !dom.wrapper ) {
                    queuedEventListenerRegistrations.push({
                        type: type,
                        listener: listener,
                        useCapture: useCapture,
                        add: false
                    });
                }
                else {
                    dom.wrapper.removeEventListener( type, listener, useCapture );
                }
            }
        },
        
		// Programatically triggers a keyboard event
        //
        // `keyCode` may be a numeric keyCode (suitable for the keyDown event) or a complete (keyboard) Event object.
		triggerKey: function( keyCode ) {         
            
            if( typeof keyCode === 'object' && keyCode !== null ) {
                keyCode = {
                    keyCode: +keyCode
                };
            }

            keyCode = extend({
                shiftKey: false, 
                keyCode: false,
                altKey: false,
                ctrlKey: false,
                metaKey: false,
                preventDefault: function () {}, 
                stopPropagation: function () {}, 
                stopImmediatePropagation: function () {}, 
                // and mark this 'event' object as a fake for the connaisseurs:
                fakeSource: this
            }, keyCode);

			onDocumentKeyDown( keyCode );

            return keyCode;

        },

        // helper function: extend destination object with the properties of the source object.
        // When there's a collision, the source property wins.
        extend: extend,

        // the subspace where all plugins go...
        AddOn: {
        }
    };
    return Reveal;

}));


/*!
 * reveal.js
 * http://lab.hakim.se/reveal-js
 * MIT licensed
 *
 * Copyright (C) 2016 Hakim El Hattab, http://hakim.se
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
            return factory( w, w.document, require('assert'), require('verge') );
        };
    } else {
        if ( typeof define === 'function' && define.amd ) {
            // AMD. Register as a named module.
            define( ['assert', 'verge'], function ( assert, verge ) {
                return factory( window, document, assert, verge );
            });
        } else {
            // Browser globals.
            window.Reveal = factory( window, document, assert, verge );
        }
    }

// Pass this, window may not be defined yet
}(this, function ( window, document, assert, verge, undefined ) {

    'use strict';

    // these *_SELECTOR defines are all `dom.wrapper` based, which explains why they won't have the `.reveal` root/wrapper DIV class in them:
	// The reveal.js version
	var VERSION = '3.3.0';

    var SLIDES_SELECTOR = '.slides > section, .slides > section > section',
        HORIZONTAL_SLIDES_SELECTOR = '.slides > section',
        VERTICAL_SLIDES_SELECTOR = '.slides > section.present > section',
        HOME_SLIDE_SELECTOR = '.slides > section:first-of-type',
        FRAGMENTS_SELECTOR = '.slides > section .fragment',
        LINKS_SELECTOR = '.slides a:not(.image)',
        ROLLING_LINKS_SELECTOR = '.slides a.roll';
    // this *_SELECTOR define is (horizontal) slide `section` selection based:
    var SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR = ':scope > section',
        SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR = ':scope > section',
        SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR = ':scope > section, :scope > section > section',
		UA = navigator.userAgent,
        SLIDE_NO_DISPLAY_DISTANCE = 1;

    var nil_function = function () {};

    var Reveal = null,

        // Configuration defaults, can be overridden at initialization time
        config = {

            // The "normal" size of the presentation, aspect ratio will be preserved
            // when the presentation is scaled to fit different resolutions
            width: '100%', //960,
            height: '100%', //700,

            // Dimensions of the content when produced onto printed media
            printWidth: 2974,           // landscape A4
            printHeight: 2159,

            // Factor of the display size that should remain empty around the content
            margin: 0.05,

            // Factor of the display size that should remain empty around the content.
            // Reveal uses 5% spacing between slides in the overview display.
            overviewGutter: 0.05,

            // Factor of the display size that should remain empty around the content
            slideGutter: 0.05,  // 0.5

            // Factor of the print page size that should remain empty around the content (e.g. because your printer cannot print edge-to-edge)
            printMargin: 50 / 2159,

            // Bounds for smallest/largest possible scale to apply to content (fundamentalScale)
            minScale: 0.05,
            maxScale: 1.5,

            // Bounds for smallest/largest possible scale to apply to content (per-slide scale correction)
            minSlideScale: 0.05,
            maxSlideScale: 1.0,

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

            // {boolean} Provide a simplified slide overview mode (when overview mode has been enabled)
            simplifiedOverview: false,

            // {boolean} Vertical centering of slides
            center: true,

            // {boolean} Enables touch navigation on devices with touch input
            touch: true,

            // {boolean} Loop the presentation
            loop: false,

            // {boolean} Change the presentation direction to be RTL
            rtl: false,

			// Randomizes the order of slides each time the presentation loads
			shuffle: false,

            // {boolean} Turns fragments on and off globally
            fragments: true,

            // {boolean} Flags if the presentation is running in an embedded mode,
            // i.e. contained within a limited portion of the screen
            embedded: false,

            // Flags if we should show a help overlay when the '?' questionmark
            // key is pressed
            help: true,

            // Flags if it should be possible to pause the presentation (blackout)
            pause: true,

			// Flags if speaker notes should be visible to all viewers
			showNotes: false,

            // Number of milliseconds between automatically proceeding to the
            // next slide, disabled when set to 0, this value can be overwritten
            // by using a data-autoslide attribute on your slides
            autoSlide: 0,

            // {boolean} Stop auto-sliding after user input
            autoSlideStoppable: true,

			// Use this method for navigation when auto-sliding (defaults to navigateNext)
			autoSlideMethod: null,

            // {boolean} Enable slide navigation via mouse wheel
            mouseWheel: false,

            // {boolean} Apply a 3D roll to links on hover
            rollingLinks: true,

            // {boolean} Hides the address bar on mobile devices
            hideAddressBar: true,

            // {boolean} Opens links in an iframe preview overlay
            previewLinks: true,

            // {boolean} Exposes the reveal.js API through window.postMessage
            postMessage: true,

            // {boolean} Dispatches all reveal.js events to the parent window through postMessage
            postMessageEvents: true,

            // {boolean} Focuses body when page changes visibility to ensure keyboard shortcuts work
            focusBodyOnPageVisibilityChange: true,

            // Theme (see /css/theme)
            theme: null,

            // Transition style
            transition: 'default', // default/cube/page/slide/concave/convex/zoom/linear/fade/none

            // Overview Transition style: the transition applied to changes when browsing the slides in overview mode
            overviewTransition: 'default', // default/cube/page/slide/concave/convex/zoom/linear/fade/none

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

            // Amount of pixels to move the parallax background per slide step
            parallaxBackgroundHorizontal: null,
            parallaxBackgroundVertical: null,

            // Number of slides away from the current that are visible in overview mode
            viewDistance: 6,

            // When not NULL, this decides whether we use CSS style:zoom (TRUE) or CSS3 transform:scale(); 
            // the latter is GPU accelerated, but can produce cruddy output when the slides are scaled up.
            // 
            // The default (NULL) lets the machine decide (CSS3:scale for mobile devices, CSS:zoom for desktops)
            useCSSZoom: false,

            // When set, all slides will have the same scaling factor applied (Smallest Common Scale) for a unified look of both empty and busy slides
            oneScaleForAll: false,

            // Maximum number of layout iterations to run per slide when we attempt to produce a good 'fit' / fill ratio for the slide.
            // Note: higher numbers eat more CPU power as each round performs a full slide DOM reflow / layout due to calls to HTMLelement.offsetWidth, etc.
            // via #getComputedSlideSize()
            maxLayoutIterations: 10,

            // Script dependencies to load
            dependencies: []

        },

        // Flags if reveal.js is loaded (has dispatched the 'ready' event)
        loaded = false,

        // Flags if the overview mode is currently active
        overview = false,

		// Holds the dimensions of our overview slides, including margins
		overviewSlideWidth = null,
		overviewSlideHeight = null,

        // The horizontal and vertical index of the currently active slide
        indexh /* = undefined */,
        indexv /* = undefined */,

        // the index to the currently displayed fragment of the currently active slide 
        currentFragmentIndex = null, 

        // The previous and current slide HTML elements
        previousSlide = null,
        currentSlide = null,
        currentParentSlide = null,

        previousBackground,

        // the previously shown slide/fragment/state:
        previousSlideIndexH = null, 
        previousSlideIndexV = null, 
        previousFragmentIndex = null, 
        currentMode = null,
        previousMode = null,

        // Slides may hold a data-state attribute which we pick up and apply
        // as a class to the body. This list contains the combined state of
        // all current slides.
        state = [],

        // NULL when a single slide is shown; in overview mode this contains the overview info (number of H/V slides, ...)
        overview_slides_info = null,

        // The current scale of the presentation (see width/height config)
        scale = 1,

        // The current z position of the presentation container
        z = 0,

        // CSS transform that is currently applied to the slides container,
        // split into two groups
        slidesTransform = { layout: '', overview: '' },

        // Cached references to DOM elements
        dom = {},

        // Features supported by the browser, see #checkCapabilities()
        features = {},

        // Client is a mobile device, see #checkCapabilities()
        isMobileDevice,

		// Client is a desktop Chrome, see #checkCapabilities()
		isChrome,

        // Use Zoom fallback, see #checkCapabilities()
        useZoomFallback,

        // queue for event registrations which arrive while Reveal has not yet completely initialized:
        queuedEventListenerRegistrations = [],

        // Throttles mouse wheel navigation
        lastMouseWheelStep = 0,

        // Delays updates to the URL due to a Chrome thumbnailer bug
        writeURLTimeout = 0,

        // Debounce timer handle for the window resize event.
        resizeDebounceTimer = null,

        // Registers what the viewDistance settings are for the present overview
        currentOverviewInfo = null,

        // {setTimeout handler} A delay used during (de)activation of the overview mode
        activateOverviewTimeout = null,

        // A delay used to deactivate the overview mode
        deactivateOverviewTimeout = 0,

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
            'N  ,  SPACE':          'Next slide',
            'P':                    'Previous slide',
            '&#8592;  ,  H':        'Navigate left',
            '&#8594;  ,  L':        'Navigate right',
            '&#8593;  ,  K':        'Navigate up',
            '&#8595;  ,  J':        'Navigate down',
            'Home':                 'First slide',
            'End':                  'Last slide',
            'B  ,  .':              'Pause',
            'F':                    'Fullscreen',
            'ESC, O':               'Slide overview'
        };


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

        // Since JS won't be running any further, we load all lazy
        // loading elements upfront
        var images = toArray( document.getElementsByTagName( 'img' ) ),
            iframes = toArray( document.getElementsByTagName( 'iframe' ) );

        var lazyLoadable = images.concat( iframes );

        for( var i = 0, len = lazyLoadable.length; i < len; i++ ) {
            var element = lazyLoadable[i];
            if( element.getAttribute( 'data-src' ) ) {
                element.setAttribute( 'src', element.getAttribute( 'data-src' ) );
                element.removeAttribute( 'data-src' );
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

        // Copy options specified in the URI query and/or hash parts over to our config object
        extend( config, query, function( fieldname ) {
            // filter 1: only accept query parameters which do already exist in our `config` object.
            //
            // filter 2: only accept query parameters which do not contain executable JavaScript code.
            return typeof config[fieldname] !== 'undefined' && typeof config[fieldname] !== 'function';
        } );
        // Copy options over to our config object
        extend( config, options );

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

		isMobileDevice = /(iphone|ipod|ipad|android)/gi.test( UA );
		isChrome = /chrome/i.test( UA ) && !/edge/i.test( UA );

		var testElement = document.body;     // testElement = document.createElement( 'div' );

		features.transforms3d = 'WebkitPerspective' in testElement.style ||
								'MozPerspective' in testElement.style ||
								'msPerspective' in testElement.style ||
								'OPerspective' in testElement.style ||
								'perspective' in testElement.style;

		features.transforms2d = 'WebkitTransform' in testElement.style ||
								'MozTransform' in testElement.style ||
								'msTransform' in testElement.style ||
								'OTransform' in testElement.style ||
								'transform' in testElement.style;

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

        isMobileDevice = UA.match( /(iphone|ipod|ipad|android)/gi );

        if ( config.useCSSZoom != null && ( config.useCSSZoom ? typeof document.createElement( 'div' ).style.zoom !== 'undefined' : true ) ) {
            useZoomFallback = config.useCSSZoom;
        }
        else {
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
            useZoomFallback = !isMobileDevice && isChrome && typeof document.createElement( 'div' ).style.zoom !== 'undefined';
        }
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

		// Prevent the slides from being scrolled out of view
		setupScrollPrevention();

        // Resets all vertical slides so that only the first is visible
        resetVerticalSlides();

        // set vertical slide stacks to their initial position (= top vertical slide)
        resetSlideStacks();

        // Prep the slide hierarchy so getTotalSlides(), etc. will work as expected
        prepSlideHierarchy();

        // Generate the Overview DOM tree
        createOverview();

        // Updates the presentation to match the current configuration values
        configure( config );

        // Read the initial hash
        readURL();

        // Update all backgrounds
        updateBackground();

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
                return false;
            }
        }

        // Notify listeners that the presentation is ready but use a 1ms
        // timeout to ensure it's not fired synchronously after #initialize()
        setTimeout( function() {
            // Nuke the slide layout cache: it can contain data that's calculated based on incomplete page loads
            nukeSlideLayoutCache();

            // And trigger browser layout:
            layout();
            // /* @void */ dom.wrapper.offsetHeight;

            // Enable transitions now that we're loaded
            dom.wrapper.classList.remove( 'no-transition' );

            loaded = true;

            dispatchEvent( 'ready', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide,
                currentParentSlide: currentParentSlide,
                restarting: restarting
            } );
        }, 1 );

        // Special setup and config is required when printing to PDF
        if( isPrintingPDF() ) {
            removeEventListeners();

            // The document needs to have loaded for the PDF layout
            // measurements to be accurate
            if( document.readyState === 'complete' ) {
                setupPDF();
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
        currentSlide = null;
        currentParentSlide = null;

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

        if ( !dom.wrapper || !dom.slides ) return false;

        dom.wrapper.setAttribute( 'role', 'application' );

        // Prevent transitions while we're loading
        dom.wrapper.classList.add( 'no-transition' );

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

        if ( config.simplifiedOverview && config.overview ) {
            dom.slides_overview_outer = createSingletonNode( dom.wrapper, 'div', 'slides-overview-wrapper', null );

            // set width/height or zoom/scale won't work:
            dom.slides_overview_outer.style.width = '100%';
            dom.slides_overview_outer.style.height = '100%';

            dom.slides_overview_inner = createSingletonNode( dom.slides_overview_outer, 'div', 'slides-overview', null );
        }

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
            '<button class="navigate-left" aria-label="previous slide"></button>' +
            '<button class="navigate-right" aria-label="next slide"></button>' +
            '<button class="navigate-up" aria-label="above slide"></button>' +
            '<button class="navigate-down" aria-label="below slide"></button>' );
        if (dom.arrow_controls) {
            // inspired by http://www.quirksmode.org/dom/events/blurfocus.html when mixing reveal with contenteditable areas and 100% keyboard control:
            // this should make sure that TAB should end up at a node which we recognize as presentation control area and hence process the keys pressed.
            var controls = toArray( dom.arrow_controls.querySelectorAll('button') );
            var tabindex = 9999 - controls.length;
            controls.forEach( function (control) {
                control.setAttribute( 'tabindex', tabindex++ );
            }); 
        }

        // Slide number
        dom.slideNumber = createSingletonNode( dom.wrapper, 'div', 'slide-number', null );

		// Element containing notes that are visible to the audience
		dom.speakerNotes = createSingletonNode( dom.wrapper, 'div', 'speaker-notes', null );
		dom.speakerNotes.setAttribute( 'data-prevent-swipe', '' );

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

        var targetInfo = getViewportDimensionsInfo();
        if ( targetInfo === false ) {
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




        // mark the current context as print rather than screen display
        document.body.classList.add( 'print-pdf' );

        document.body.style.width = targetInfo.rawAvailableWidth + 'px';
        document.body.style.height = targetInfo.rawAvailableHeight + 'px';

		// Add each slide's index as attributes on itself, we need these
		// indices to generate slide numbers below
		toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( hslide, h ) {
			hslide.setAttribute( 'data-index-h', h );

			if( hslide.classList.contains( 'stack' ) ) {
				toArray( hslide.querySelectorAll( 'section' ) ).forEach( function( vslide, v ) {
					vslide.setAttribute( 'data-index-h', h );
					vslide.setAttribute( 'data-index-v', v );
				} );
			}
		} );

        // Slide and slide background layout
        toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ) ).forEach( function( slide ) {

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

				// Inject notes if `showNotes` is enabled
				if( config.showNotes ) {
					var notes = getSlideNotes( slide );
					if( notes ) {
						var notesSpacing = 8;
						var notesElement = document.createElement( 'div' );
						notesElement.classList.add( 'speaker-notes' );
						notesElement.classList.add( 'speaker-notes-pdf' );
						notesElement.innerHTML = notes;
						notesElement.style.left = ( notesSpacing - left ) + 'px';
						notesElement.style.bottom = ( notesSpacing - top ) + 'px';
						notesElement.style.width = ( pageWidth - notesSpacing*2 ) + 'px';
						slide.appendChild( notesElement );
					}
				}

				// Inject slide numbers if `slideNumbers` are enabled
				if( config.slideNumber ) {
					var slideNumberH = parseInt( slide.getAttribute( 'data-index-h' ), 10 ) + 1,
						slideNumberV = parseInt( slide.getAttribute( 'data-index-v' ), 10 ) + 1;

					var numberElement = document.createElement( 'div' );
					numberElement.classList.add( 'slide-number' );
					numberElement.classList.add( 'slide-number-pdf' );
					numberElement.innerHTML = formatSlideNumber( slideNumberH, '.', slideNumberV );
					background.appendChild( numberElement );
				}
            }

        } );

        // Show all fragments
        toArray( dom.slides.querySelectorAll( '.fragment' ) ).forEach( function( fragment ) {
            fragment.classList.add( 'visible' );
        } );

        return true;
    }

    /**
	 * This is an unfortunate necessity. Some actions – such as
	 * an input field being focused in an iframe or using the
	 * keyboard to expand text selection beyond the bounds of
	 * a slide – can trigger our content to be pushed out of view.
	 * This scrolling can not be prevented by hiding overflow in
	 * CSS (we already do) so we have to resort to repeatedly
	 * checking if the slides have been offset :(
     */
	function setupScrollPrevention() {

		setInterval( function() {
			if( dom.wrapper.scrollTop !== 0 || dom.wrapper.scrollLeft !== 0 ) {
				dom.wrapper.scrollTop = 0;
				dom.wrapper.scrollLeft = 0;
			}
		}, 1000 );

    }

    /**
     * Creates an HTML element and returns a reference to it.
     * If the element already exists the existing instance will
     * be returned.
     */
    function createSingletonNode( container, tagname, classname, innerHTML ) {

        // Find the one which is a direct child of the specified container
        var testNode = container.querySelector( ':scope > ' + tagname + '.' + classname );

        if( testNode ) {
            return testNode;
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
        toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( slideh, x ) {

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
            backgroundIframe: slide.getAttribute( 'data-background-iframe' ),
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
        if( data.background || data.backgroundColor || data.backgroundImage || data.backgroundVideo || data.backgroundIframe ) {
            element.setAttribute( 'data-background-hash', 
                data.background + ':' + 
                data.backgroundSize + ':' +
                data.backgroundImage + ':' +
                data.backgroundVideo + ':' +
                data.backgroundIframe + ':' +
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
        
        // If backgrounds are being recreated, clear old classes
        slide.classList.remove( 'has-dark-background' );
        slide.classList.remove( 'has-light-background' );
        
        // If this slide has a background color, add a class that
        // signals if it is light or dark. If the slide has no background
        // color, no class will be set
        var computedBackgroundColor = window.getComputedStyle( element ).backgroundColor;
        if( computedBackgroundColor ) {
            var rgb = colorToRgb( computedBackgroundColor );

            // Ignore fully transparent backgrounds. Some browsers return
            // rgba(0,0,0,0) when reading the computed background color of
            // an element with no background
            if( rgb && rgb.a !== 0 ) {
                if( colorBrightness( computedBackgroundColor ) < 128 ) {
                    slide.classList.add( 'has-dark-background' );
                }
                else {
                    slide.classList.add( 'has-light-background' );
                }
            }
        }

        return element;

    }


    /**
     * Creates the slides' overview representative elements and appends them
     * to the overview container.
     */
    function createOverview() {

        if ( config.simplifiedOverview && config.overview ) {

            dom.slides_overview_inner.innerHTML = '';

            // Iterate over all horizontal slides
            toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) ).forEach( function( slideh, x ) {

                var stackElement = createSlideOverviewRepresentative( slideh, dom.slides_overview_inner, x, false, slideh.classList.contains( 'stack' ) );

                // Iterate over all vertical slides
                toArray( slideh.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ).forEach( function( slidev, y ) {

                    createSlideOverviewRepresentative( slidev, stackElement, x, y, false );

                    stackElement.classList.add( 'stack' );

                } );

            } );

        }

    }

    /**
     * Creates a overview representative for the given slide.
     *
     * The representative is a clone containing a short title/description of the slide,
     * using (in order of decreasing selection precedence):
     * - the content of the slide HEADER or other DOM element with class `reveal-overview-info`,
     * - the content of the slide `data-overview-info` Attribute (placed into a H1),
     * - the content of the slide's first H1..H6 DOM element (H1 has precedence over H2, and so on)
     * - the slide's first line of raw text (as obtained through the `innerText` property)
     * 
     * @param {HTMLElement} slide
     * @param {HTMLElement} container The element that the overview representative
     * should be appended to
     */
    function createSlideOverviewRepresentative( slide, container, x, y, isStack ) {

        var section = document.createElement( 'section' );

        if ( isStack ) {
            section.classList.add( 'stack' );
        }
        else {
            var contentSourceText;
            var contentSource = slide.querySelector( '.reveal-overview-info' );
            if ( !contentSource ) {
                contentSourceText = ( slide.getAttribute( 'data-overview-info' ) || '' ).trim();
                if ( contentSourceText === '' ) {
                    for ( var h_number = 1; h_number <= 6 && !contentSource; h_number++ ) {
                        contentSource = slide.querySelector( 'h' + h_number );
                    }
                    if ( !contentSource ) {
                        contentSourceText = '???';
                        slide.innerText.split('\n').some( function ( line ) {
                            line = line.trim();
                            if ( line !== '' ) {
                                contentSourceText = line;
                                return true;
                            }
                        } );
                    }
                }
            }

            // When `contentSource` is set we need to clone its subtree:
            var node;

            if ( contentSource ) {
                node = contentSource.cloneNode( true );
                // Remove all #IDs in the clone as they will be illegal duplicates:
                var id_dups = toArray( node.querySelectorAll( '[id]') );
                for ( var i = 0, len = id_dups.length; i < len; i++ ) {
                    id_dups[i].removeAttribute( 'id' );
                }
            }
            else {
                node = document.createElement( 'h1' );
                node.innerText = contentSourceText;
            }

            section.appendChild( node );
        }
        
        container.appendChild( section );

        return section;

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
        extend( config, options );

        // Force linear transition based on browser capabilities
        if( features.transforms3d === false ) {
            config.transition = 'linear';
            config.backgroundTransition = 'linear';
            config.overviewTransition = 'linear';
        }

        if( !dom.wrapper ) {
            return false;
        }

        var numberOfSlides = getTotalSlides();

        dom.wrapper.classList.add( config.transition );

        dom.wrapper.setAttribute( 'data-transition-speed', config.transitionSpeed );
        dom.wrapper.setAttribute( 'data-background-transition', config.backgroundTransition );

        if( dom.controls ) {
            dom.controls.style.display = config.controls ? 'block' : 'none';
        }

        if( dom.progress ) {
            dom.progress.style.display = config.progress ? 'block' : 'none';
        }

        if( dom.slideNumber ) {
		dom.slideNumber.style.display = config.slideNumber && !isPrintingPDF() ? 'block' : 'none';
        }

        if( dom.timeRemaining ) {
            dom.timeRemaining.style.display = config.timeRemaining ? 'block' : 'none';
        }

		if( config.shuffle ) {
			shuffle();
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

        // Exit the paused mode if it was configured off
        if( config.pause === false ) {
            resume();
        }

		if( config.showNotes ) {
			dom.speakerNotes.classList.add( 'visible' );
		}
		else {
			dom.speakerNotes.classList.remove( 'visible' );
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
        if( !config.fragments && dom.slides ) {
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
            if( UA.match( /android/gi ) ) {
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
                    if ( b.hasOwnProperty(i) ) {
                        a[ i ] = b[ i ];
                    }
                }
            } 
            else {
                for( var i in b ) {
                    if ( b.hasOwnProperty(i) && filter( i ) ) {
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
     * Checks if a floating point value is zero 'for all practical intents and purposes':
     * as machine floating point is inaccurate we check whether the value is within the
     * 'epsilon' range of zero.
     *
     * See also: 
     * http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
     * http://developer.download.nvidia.com/assets/cuda/files/NVIDIA-CUDA-Floating-Point.pdf
     * http://floating-point-gui.de/
     */
    function is0( value ) {
        // epsilon is assumed to be 1.0e-5, which is fine for checking zoom factors, etc.
        return ( value > -1.0e-5 && value < 1.0e-5 );
    }  

    /**
     * Generate a CSS translate transform expression
     */
    function translate( direction, distance, unit ) {
        if ( !is0( distance ) ) {
            return ' translate' + direction + '(' + distance + unit + ') ';
        }
        return '';
    }

    /**
     * Resets all CSS transforms on the target element.
     */
    function resetElementTransform( element ) {

        // reset the scale and related attributes:
        element.style.left = null;
        element.style.top = null;
        element.style.bottom = null;
        element.style.right = null;
        element.style.zoom = null;

        element.style.WebkitTransform = null;
        element.style.MozTransform = null;
        element.style.msTransform = null;
        element.style.OTransform = null;
        element.style.transform = null;

    }

    /**
     * Applies a CSS transform to the target element.
     */
    function transformElement( element, transform ) {

        assert( transform != null );

        /*
         * **WARNING**: when you code this update action like this: 
         *
         * ```
         * element.style.WebkitTransform += transform;
         * element.style.MozTransform += transform;
         * element.style.msTransform += transform;
         * element.style.OTransform += transform;
         * element.style.transform += transform;
         * ```
         *
         * you will end with all transforms showing up **twice** in the element
         * as this code attempts to it for all browsers and some, such as latest Chrome,
         * support *both* their own (`WebkitTransform`) and the standard entry (`transform`),
         * resulting in that last line causing the duplication of the transform.
         *
         * So the way out is to first sample all transforms, then add the new transform 
         * and only then write them all back.
         */ 
        var wk = element.style.WebkitTransform;
        var ff = element.style.MozTransform;
        var ms = element.style.msTransform;
        var op = element.style.OTransform;
        var w3 = element.style.transform;
        element.style.WebkitTransform = wk + transform;
        element.style.MozTransform = ff + transform;
        element.style.msTransform = ms + transform;
        element.style.OTransform = op + transform;
        element.style.transform = w3 + transform;

    }

    /**
     * Applies the given scale to the target element.
     */
    function scaleElement( element, scale, targetInfo ) {

        assert( scale != null );

        element.style.left = 0;
        element.style.top = 0;
        element.style.bottom = 0;
        element.style.right = 0;

        /* TBD / TODO  hakim original */
        if (0) {
            // Use zoom to scale up in desktop Chrome so that content
            // remains crisp. We don't use zoom to scale down since that
            // can lead to shifts in text layout/line breaks.
            if( scale > 1 && !isMobileDevice && isChrome && typeof dom.slides.style.zoom !== 'undefined' ) {
                dom.slides.style.zoom = scale;
                dom.slides.style.left = '';
                dom.slides.style.top = '';
                dom.slides.style.bottom = '';
                dom.slides.style.right = '';
                transformSlides( { layout: '' } );
            }
            // Apply scale transform as a fallback
            else {
                dom.slides.style.zoom = '';
                dom.slides.style.left = '50%';
                dom.slides.style.top = '50%';
                dom.slides.style.bottom = 'auto';
                dom.slides.style.right = 'auto';
                transformSlides( { layout: 'translate(-50%, -50%) scale('+ scale +')' } );
            }
        }
        /* TBD / TODO  hakim original */
        
        // if scale is within epsilon range of 1.0, then we don't apply the scale: the CSS default is scale=1 anyway.
        if ( is0( scale - 1.0 ) ) {
            // nothing to do... means: RESET the scale.
            //
            // This is an important optimization as *nesting* the scales in Chrome produces very blocky render results,
            // i.e. applying a CSS transform:scale to both a parent and child node will cause the child to render
            // very 'roughly'.
            element.style.zoom = null;
        }
        else if ( useZoomFallback ) {
            element.style.zoom = scale;
        }
        // Apply scale transform
        else {
            var post_translation = '';
            if ( targetInfo ) {
                // compensation: -0.5 * delta_of_origin / scale
                var scale_inv = 0.5 * ( 1 - 1 / scale );
                var delta_h = targetInfo.slideHeight * scale_inv;
                var delta_w = targetInfo.slideWidth * scale_inv;
                post_translation = translate( 'X', Math.round(delta_w), 'px' ) + translate( 'Y', Math.round(delta_h), 'px' );
            } else {
                transformElement( element, post_translation + ' scale(' + scale + ') ' );
            }
        }
    }


    /**
     * Applies the given width/height dimensions to the target element.
     */
    function dimensionElement( element, width, height, targetInfo ) {
        element.style.width = width;
        element.style.height = height;
    }

    /**
     * Adds the specified class to the class list of the target element.
     */
    function addClass( element, className ) {
        element.classList.add( className );
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
     * Converts various color input formats to an {r:0,g:0,b:0} object.
     *
     * @param {String} color The string representation of a color,
     * the following formats are supported:
     * - #000
     * - #000000
     * - rgb(0,0,0)
     */
    function colorToRgb( color ) {

        var hex3 = color.match( /^#([0-9a-f]{3})$/i );
        if( hex3 && hex3[1] ) {
            hex3 = hex3[1];
            return {
                r: parseInt( hex3.charAt( 0 ), 16 ) * 0x11,
                g: parseInt( hex3.charAt( 1 ), 16 ) * 0x11,
                b: parseInt( hex3.charAt( 2 ), 16 ) * 0x11
            };
        }

        var hex6 = color.match( /^#([0-9a-f]{6})$/i );
        if( hex6 && hex6[1] ) {
            hex6 = hex6[1];
            return {
                r: parseInt( hex6.substr( 0, 2 ), 16 ),
                g: parseInt( hex6.substr( 2, 2 ), 16 ),
                b: parseInt( hex6.substr( 4, 2 ), 16 )
            };
        }

        var rgb = color.match( /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i );
        if( rgb ) {
            return {
                r: parseInt( rgb[1], 10 ),
                g: parseInt( rgb[2], 10 ),
                b: parseInt( rgb[3], 10 )
            };
        }

        var rgba = color.match( /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i );
        if( rgba ) {
            return {
                r: parseInt( rgba[1], 10 ),
                g: parseInt( rgba[2], 10 ),
                b: parseInt( rgba[3], 10 ),
                a: parseFloat( rgba[4] )
            };
        }

        return null;

    }

    /**
     * Calculates brightness on a scale of 0-255.
     *
     * @param color See colorStringToRgb for supported formats.
     */
    function colorBrightness( color ) {

        if( typeof color === 'string' ) color = colorToRgb( color );

        if( color ) {
            return ( color.r * 299 + color.g * 587 + color.b * 114 ) / 1000;
        }

        return null;

    }

    /**
     * Retrieves the height & width of the given element by looking
     * at the position and height/width of its immediate children.
     * 
     * Note: be aware that getComputedSlideSize *can* return fractional 
     * width / height values. 
     */
    function getComputedSlideSize( element, fractional_okay, compensate_for_scale ) {

        var height = 0;
        var width = 0;

        if( element ) {

            // Account for padding/margins around children by inspecting the node itself too.
            //
            // See also: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
            //
            // Note that element.getBoundingClientRect() *does* incorporate the transform:scale() in the 
            // numbers produced, hence we must compensate for this behaviour as the `.offsetXYZ` properties do not.
            // 
            // Also note that element.getBoundingClientRect() *does not* incorporate the style:zoom() scale in the 
            // numbers produced, so it does matter a lot which scaling method we employ! 
            height = Math.max( element.offsetTop + element.offsetHeight, element.scrollHeight );
            width = Math.max( element.offsetLeft + element.offsetWidth, element.scrollWidth );
            if ( compensate_for_scale ) {
                var bbox = element.getBoundingClientRect();
                var h = bbox.bottom - bbox.top;
                var w = bbox.right - bbox.left;
                
                if ( !useZoomFallback ) {
                    // transform:scale()d sizes produce the *scaled* size; this contrasts with classic style:zoom based
                    // scaling, so we adjust the width/height by the specified scale factor to match both modes up:
                    w /= compensate_for_scale;
                    h /= compensate_for_scale;
                }

                height = Math.max( h, height );
                width = Math.max( w, width );
            }

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

            // Compensate for some minimal clipping occurring at large zoom scale factors when using CSS:zoom:
            if ( useZoomFallback ) {
                if ( compensate_for_scale > 1 ) {
                    height += 1;
                }
            }

            if ( !fractional_okay ) {
                height = Math.ceil( height );
                width = Math.ceil( width );
            }
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
        var slides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) );
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
     */
    function layout() {

        var targetInfo = getViewportDimensionsInfo();

        __layout( dom.slides_wrapper, dom.slides, targetInfo );
        if ( config.simplifiedOverview && config.overview ) {
            __layout( dom.slides_overview_outer, dom.slides_overview_inner, targetInfo );
        }

    }

    function __layout( dom_slides_outer, dom_slides_inner, targetInfo ) {

        var i, j, len, hlen, vlen;
        var commonScale = Infinity;
        var enforceCommonScale = false;
        var wantCommonScale = config.oneScaleForAll && !isOverview();   // we don't care about 'common scale' in overview mode: there we want everything to be as large as possible for optimal readability.
        var mode = getDeckMode();

        var oldStylesBackup = [];
        var renderQueue = [];

        // Backup the set of styles and classes for the target element
        // *which are subject to CSS transition/animation.
        function backupCurrentStyles(slide) {
            oldStylesBackup.push(slide);
            oldStylesBackup.push({
                marginTop: slide.style.marginTop,
                marginRight: slide.style.marginRight,
                marginBottom: slide.style.marginBottom,
                marginLeft: slide.style.marginLeft,
                paddingTop: slide.style.paddingTop,
                paddingRight: slide.style.paddingRight,
                paddingBottom: slide.style.paddingBottom,
                paddingLeft: slide.style.paddingLeft,
                top: slide.style.top,
                right: slide.style.right,
                bottom: slide.style.bottom,
                left: slide.style.left,
                height: slide.style.height,
                width: slide.style.width,
                zoom: slide.style.zoom,
                WebkitTransform: slide.style.WebkitTransform,
                MozTransform: slide.style.MozTransform,
                msTransform: slide.style.msTransform,
                OTransform: slide.style.OTransform,
                transform: slide.style.transform,
                className: slide.className
            });
        }

        function restoreAllCurrentStyles() {
            for ( var i = 0, len = oldStylesBackup.length; i < len; i += 2 ) {
                var slide = oldStylesBackup[i];
                var data = oldStylesBackup[i + 1];

                slide.style.marginTop = data.marginTop;
                slide.style.marginRight = data.marginRight;
                slide.style.marginBottom = data.marginBottom;
                slide.style.marginLeft = data.marginLeft;
                slide.style.paddingTop = data.paddingTop;
                slide.style.paddingRight = data.paddingRight;
                slide.style.paddingBottom = data.paddingBottom;
                slide.style.paddingLeft = data.paddingLeft;
                slide.style.top = data.top;
                slide.style.right = data.right;
                slide.style.bottom = data.bottom;
                slide.style.left = data.left;
                slide.style.height = data.height;
                slide.style.width = data.width;
                slide.style.zoom = data.zoom;
                slide.style.WebkitTransform = data.WebkitTransform;
                slide.style.MozTransform = data.MozTransform;
                slide.style.msTransform = data.msTransform;
                slide.style.OTransform = data.OTransform;
                slide.style.transform = data.transform;
                slide.className = data.className;
            }
        }

        function queueReset( slide ) {
            // Only queue/exec action when we have the *final* scale set up for this particular slide!
            if ( !wantCommonScale || enforceCommonScale ) {
                renderQueue.push(function () {
                    resetElementTransform( slide );
                });            
            }
        }

        function queueDimensions( slide, width, height ) {
            // Only queue/exec action when we have the *final* scale set up for this particular slide!
            if ( !wantCommonScale || enforceCommonScale ) {
                renderQueue.push(function () {
                    dimensionElement( slide, width, height, targetInfo );
                });            
            }
        }

        function queueScale( slide, realScale ) {
            assert( realScale != null );
            // Only queue/exec action when we have the *final* scale set up for this particular slide!
            if ( !wantCommonScale || enforceCommonScale ) {
                renderQueue.push(function () {
                    scaleElement( slide, realScale, targetInfo );
                });            
            }
        }

        function queueTransform( slide, transform ) {
            assert( transform != null );
            assert( transform.indexOf('NaN') === -1 );
            // Only queue/exec action when we have the *final* scale set up for this particular slide!
            if ( !wantCommonScale || enforceCommonScale ) {
                renderQueue.push(function () {
                    transformElement( slide, transform );
                });
            }
        }

        function queueAddClass( slide, className ) {
            // Only queue/exec action when we have the *final* scale set up for this particular slide!
            if ( !wantCommonScale || enforceCommonScale ) {
                renderQueue.push(function () {
                    addClass( slide, className );
                });
            }
        }

        function runQueue() {
            for ( var i = 0, len = renderQueue.length; i < len; i++ ) {
                renderQueue[i]();
            }
            renderQueue = [];
        }

        function layoutSingleSlide( slide, parentSlide, x, y ) {

            targetInfo = getAvailableSlideDimensionsInfo( slide, targetInfo );

            // Check if this slide comes with a dimensions/scale cache.
            var cache = slide.getAttribute( 'data-reveal-dim-cache' ) || '';
            var cache_entry = false;
    
            // Make sure we're dealing with JSON, if there's any cache.
            if ( !cache.length ) {
                cache = false;
            }
            else {
                try {
                    cache = JSON.parse( cache ) || false; 

                    cache_entry = cache[mode];
                } 
                catch (e) {
                    cache = false;
                }
            }

            var realScale;
            var targetSlideHeight;
            var targetSlideWidth;
            var slideDimensions;
            var isScrollable;

            if ( cache_entry ) {
                realScale = cache_entry.scale;
                assert( realScale != null );
                slideDimensions = {
                    height: cache_entry.height,
                    width: cache_entry.width
                };
                isScrollable = cache_entry.scrolling;
            }
            else {
                // Resets all transforms before we measure the slide:
                resetElementTransform( slide );

                slide.classList.remove( 'past-1' );
                slide.classList.remove( 'past' );
                slide.classList.add( 'present' );
                slide.classList.add( 'slide-measurement' );
                slide.classList.remove( 'future' );
                slide.classList.remove( 'future-1' );

                if ( parentSlide ) {
                    resetElementTransform( parentSlide );

                    parentSlide.classList.remove( 'past-1' );
                    parentSlide.classList.remove( 'past' );
                    parentSlide.classList.add( 'present' );
                    parentSlide.classList.add( 'slide-measurement' );
                    parentSlide.classList.remove( 'future' );
                    parentSlide.classList.remove( 'future-1' );
                }
                
                if (0 === 0) {
                    dom_slides_outer.classList.add( 'slide-measurement' );
                    dom_slides_inner.classList.add( 'slide-measurement' );
                }

                // Remove the previous height/size pinning.
                slide.style.height = null;
                slide.style.width = null;
        
                slide.style.marginTop = null;
                slide.style.marginBottom = null;
                slide.style.marginLeft = null;
                slide.style.marginRight = null;
                slide.style.paddingTop = null;
                slide.style.paddingBottom = null;
                slide.style.paddingLeft = null;
                slide.style.paddingRight = null;
                slide.style.top = null;
                slide.style.left = null;

                // Make sure the slide is visible in the DOM for otherwise we cannot obtain measurements.
                // Later on in the layout process we'll invoke updateSlidesVisibility() to ensure all
                // slides that *must* be visible, will be, and those that must not, aren't.
                if ( parentSlide ) {
                    showSlide( parentSlide );
                }
                showSlide( slide );

                // Layout the contents of the slide.

                // Setting a fixed width helps to produce a consistent layout and slide dimensions measurement.
                dom_slides_inner.style.height = null;
                dom_slides_inner.style.width = targetInfo.slideWidth + 'px';

                if ( parentSlide ) {
                    parentSlide.style.height = null;
                    parentSlide.style.width = targetInfo.slideWidth + 'px';
                }

                // When the current slide is a 'scrollable slide' we need to make some special preparations.
                isScrollable = isScrollableSlide( slide );
                if ( isScrollable ) {
                    dom_slides_outer.classList.add( 'scrollable-slide' );
                    slide.classList.add( 'scrollable-slide' );

                    // let the browser reflow the scrollable content so we can decide what to do next:
                    dom_slides_inner.style.width = targetInfo.slideWidth + 'px';
                    dom_slides_inner.style.height = targetInfo.slideHeight + 'px';

                    if ( parentSlide ) {
                        parentSlide.style.width = targetInfo.slideWidth + 'px';
                        parentSlide.style.height = targetInfo.slideHeight + 'px';
                    }
                }
                else {
                    dom_slides_outer.classList.remove( 'scrollable-slide' );
                }
                //slide.style.width = targetInfo.slideWidth + 'px';

                // Calculate the amount of vertical padding required to *center* the slide.
                // That is, IFF we want the slide to be centered at all?

                // Handle sizing of elements with the 'stretch' class
                toArray( slide.querySelectorAll( ':scope > .stretch' ) ).forEach( function( element ) {
                    layoutSlideContents( element, targetInfo.slideWidth, ( isScrollable ? Infinity : targetInfo.slideHeight ) );
                });

                if ( enforceCommonScale ) {
                    realScale = commonScale;
                    assert( realScale != null );

                    // Respect max/min scale settings, but not in overview mode, where we want the slide to fit the maximum available (yet very small) part of our viewport real estate
                    if ( !isOverview() ) {
                        realScale = Math.max( realScale, config.minSlideScale );
                        realScale = Math.min( realScale, config.maxSlideScale );
                    }

                    assert( realScale );
                    targetSlideHeight = Math.round(targetInfo.slideHeight / realScale);
                    targetSlideWidth = Math.round(targetInfo.slideWidth / realScale);

                    // Fake slideDimensions; we will compute the real slide dimensions further below
                    slideDimensions = {
                        width: targetSlideWidth,
                        height: targetSlideHeight
                    };
                }
                else {
                    // Calculate the dimensions of the slide
                    slideDimensions = getComputedSlideSize( slide, false );

                    // Determine scale of content to fit within available space
                    realScale = 1.0;
                    if ( slideDimensions && !isScrollable ) {
                        // Protect the scaling calculation against zero-sized slides: make those produce a sensible scale, e.g.: 1.0
                        realScale = Math.min( targetInfo.slideWidth / ( slideDimensions.width || targetInfo.slideWidth ), targetInfo.slideHeight / ( slideDimensions.height || targetInfo.slideHeight ) );
                    }

                    // Respect max/min scale settings, but not in overview mode, where we want the slide to fit the maximum available (yet very small) part of our viewport real estate
                    if ( !isOverview() ) {
                        realScale = Math.max( realScale, config.minSlideScale );
                        realScale = Math.min( realScale, config.maxSlideScale );
                    }
                    assert( realScale );

                    // We need to compensate for the scale factor, which is applied to the entire slide,
                    // hence for centering properly *and* covering the entire intended slide area, we need
                    // to scale the target size accordingly and use this scaled up/down version: 
                    targetSlideHeight = Math.round(targetInfo.slideHeight / realScale);
                    targetSlideWidth = Math.round(targetInfo.slideWidth / realScale);
                    // Allow user code to modify the slide layout and/or dimensions during the layout phase:
                    var eventData = {
                        x: x,
                        y: y,
                        slide: slide,
                        slideDimensions: {
                            width: slideDimensions.width,
                            height: slideDimensions.height
                        },
                        slideScale: realScale,
                        scaledTargetSlideHeight: targetSlideHeight,
                        scaledTargetSlideWidth: targetSlideWidth,
                        inOverviewMode: isOverview(),
                        inPrintingMode: isPrintingPDF(),
                        isScrollableSlide: isScrollable,
                        targetInfo: targetInfo,
                        slidesMatrixInfo: getSlidesOverviewInfo()
                    }; 
                    dispatchEvent( 'layout:before', eventData );

                    // The user code executed in the event above may have tweaked the scale while *not* adjusting the slide dimensions:
                    // we want to keep that manual compensation intact during our fill iterative process below.
                    if (    targetSlideHeight !== eventData.scaledTargetSlideHeight ||
                            targetSlideWidth !== eventData.scaledTargetSlideWidth ||
                            realScale !== eventData.slideScale ||
                            !eventData.slideDimensions ||
                            slideDimensions.width !== eventData.slideDimensions.width ||
                            slideDimensions.height !== eventData.slideDimensions.height 
                    ) {
                        // Pick up the changes user code *may* have made to the eventData.
                        targetSlideHeight = eventData.scaledTargetSlideHeight;
                        targetSlideWidth = eventData.scaledTargetSlideWidth;
                        realScale = eventData.slideScale;
                        assert( realScale );

                        slideDimensions = getComputedSlideSize( slide, false, realScale );

                        if ( !realScale || !eventData.slideDimensions || !eventData.slideDimensions.width || !eventData.slideDimensions.height ) { 
                            realScale = Math.min( targetInfo.slideWidth / slideDimensions.width, targetInfo.slideHeight / slideDimensions.height );

                            // Respect max/min scale settings, but not in overview mode, where we want the slide to fit the maximum available (yet very small) part of our viewport real estate
                            if ( !isOverview() ) {
                                realScale = Math.max( realScale, config.minSlideScale );
                                realScale = Math.min( realScale, config.maxSlideScale );
                            }

                            assert( realScale );
                            targetSlideHeight = Math.round(targetInfo.slideHeight / realScale);
                            targetSlideWidth = Math.round(targetInfo.slideWidth / realScale);
                        }
                    }
                } 
                assert( realScale != null );

                // Complication: when we use CSS:zoom to scale a slide, it won't be an 'exact' scaling: the dimensions of individual
                // elements will change depending on choices made by the browser, so for best results we should re-calculate 
                // the slide dimensions after applying the scale; theoretically this will produce another layout, hence yet another
                // dimension set, so theoretically we would have to iterate until the slide 'fits' within a certain epsilon tolerance.
                //
                // As this layout action is very costly, we restrict ourselves to N extra rounds only. And we don't involve the user
                // code again: the slide will have render as-is without further tweaks.
                //
                // Additionally this process attempts to produce a 'nicer' layout by attempting to coerce slides, which turn up to be 
                // very wide and thin, towards the current preferred slide ratio.
                var preferredRatio = targetInfo.slideWidth / targetInfo.slideHeight;

                // Note: it's no use trying to improve the layout when we already are a smaller slide (thus with a larger scale) 
                // while the user config prescribes one scale for all.
                if ( slideDimensions && !isScrollable && ( !wantCommonScale || commonScale > realScale || enforceCommonScale ) ) {
                    // For 'optimum fill layout' we go & hunt for the nearest approximation of our preferred slide h/w ratio:
                    var optimum = {
                        scale: NaN,
                        width: NaN,
                        height: NaN,
                        surfaceArea: Infinity,
                        slideRatio: 1E12,
                    };
                    // Keep track of which scales we tested so we don't go around in circles when there's not much options to layout a slide differently
                    var processed_scales = [];

                    assert(config.maxLayoutIterations > 0);
                    for ( var iter_rounds = config.maxLayoutIterations; /* useZoomFallback */; iter_rounds-- ) {
                        // Reset scale, apply the new scale and recheck:
                        resetElementTransform( slide );
                        scaleElement( slide, realScale );
                        slide.style.left = null;
                        slide.style.top = null;
                        slide.style.bottom = null;
                        slide.style.right = null;

                        // As CSS:zoom does affect the computed size, we *must* obtain the actual dimensions after having applied the scale,
                        // in order to gt precise numbers from the start.
                        slideDimensions = getComputedSlideSize( slide, false, realScale );

                        // When the measurements fail utterly this slide is probably contained inside an invisible container and we don't care
                        // what happens then: we'll go with the default scale of 1 then:
                        if (slideDimensions.width === 0 && slideDimensions.height === 0) {
                            console.warn("slide is not visible or at least has no width or height. slide: ", x, y);
                            optimum = null;
                            break;
                        }
                        assert(slideDimensions.width > 0 && slideDimensions.height > 0);

                        // Fixup scale of content to fit within available space in case we have a zoom goof due to CSS:zoom altering the BBox.
                        realScale = Math.min( realScale, targetInfo.slideWidth / slideDimensions.width, targetInfo.slideHeight / slideDimensions.height );

                        // Respect max/min scale settings, but not in overview mode, where we want the slide to fit the maximum available (yet very small) part of our viewport real estate
                        if ( !isOverview() ) {
                            realScale = Math.max( realScale, config.minSlideScale );
                            realScale = Math.min( realScale, config.maxSlideScale );
                        }

                        assert( realScale );
                        var newAttempt = {
                            scale: realScale,
                            width: slideDimensions.width,
                            height: slideDimensions.height,
                            surfaceArea: slideDimensions.width * slideDimensions.height,
                            slideRatio: slideDimensions.width / slideDimensions.height,
                        };

                        var opti_ratio = optimum.slideRatio;
                        if ( opti_ratio < 1 ) {
                            opti_ratio = 1 / opti_ratio;
                        }
                        var new_ratio = newAttempt.slideRatio;
                        if ( new_ratio < 1 ) {
                            new_ratio = 1 / new_ratio;
                        }
                        if (new_ratio < opti_ratio) {
                            optimum = newAttempt;
                        }

                        if ( iter_rounds <= 0 || enforceCommonScale ) {
                            assert( optimum.scale );
                            break;
                        }
                        if ( processed_scales.indexOf( Math.round( newAttempt.scale * 1000 ) ) !== -1 ) {
                            console.log('ITER: exit @ ', iter_rounds, ' because scale has been tested before --> cycle!');
                            assert( optimum.scale );
                            break;
                        }
                        processed_scales.push( Math.round( newAttempt.scale * 1000 ) );

                        // shape the slide in an attempt to coerce the slide towards a more filling & pleasing layout:
                        var surfaceArea = slideDimensions.width * slideDimensions.height;
                        var adjustedWidth = Math.sqrt( surfaceArea / preferredRatio ) * preferredRatio;

                        // Note: the user can force/manipulate the slide layout by specifying style `min-width` for every slide: modern browsers
                        // ensure that that style will win over any smaller widths set up in here!
                        slideDimensions.width = Math.ceil( adjustedWidth );
                        // Estimate the slide dimensions (calculating the height before scaling is expensive not always accurate either anyway...)
                        var newHeight = Math.ceil( Math.sqrt( surfaceArea / preferredRatio ) );
                        slideDimensions.height = Math.max( slideDimensions.height, newHeight );
                        slide.style.width = slideDimensions.width + 'px';

                        if (0) {
                            // Calculate the dimensions of the slide
                            slideDimensions = getComputedSlideSize( slide, false, realScale );
                        }

                        // Determine scale of content to fit within available space
                        // Protect the scaling calculation against zero-sized slides: make those produce a sensible scale, e.g.: 1.0
                        realScale = Math.min( targetInfo.slideWidth / slideDimensions.width, targetInfo.slideHeight / slideDimensions.height );

                        // Respect max/min scale settings, but not in overview mode, where we want the slide to fit the maximum available (yet very small) part of our viewport real estate
                        if ( !isOverview() ) {
                            realScale = Math.max( realScale, config.minSlideScale );
                            realScale = Math.min( realScale, config.maxSlideScale );
                        }
                        assert( realScale );
                    }

                    if (optimum) {
                        if (0 /* this section is only useful when debugging */) {
                            // Reset & apply the optimum layout (it may not have to be the last one we tried above!)
                            resetElementTransform( slide );
                            scaleElement( slide, optimum.scale );
                            slide.style.width = optimum.width + 'px';
                            slide.style.height = optimum.height + 'px';
                        }

                        realScale = optimum.scale;
                        assert( realScale );
                        
                        // Because CSS:zoom will alter the layout when the width changes, we do NOT apply the scale-corrected target width / height 
                        // after having obtained the slide dimensions one last time.
                        slideDimensions.width = optimum.width;
                        slideDimensions.height = optimum.height;
                    }
                    else {
                        assert( realScale );
                    }
                }
                else if ( slideDimensions && isScrollable /* && !isOverview() */ ) {
                    assert( realScale );
                    slideDimensions.width = targetSlideWidth * realScale;
                    slideDimensions.height = targetSlideHeight * realScale;
                }
                assert( realScale );

                // only write a cache entry when there's a decent chance it's gonna be a reasonable entry:
                if (slideDimensions.width > 0 && slideDimensions.height > 0) {
                    // We should update the cache now that we have calculated the scale, etc. for the current slide & mode.
                    // However, we should only update the cache once we have the *final* data.
                    if ( !wantCommonScale || enforceCommonScale ) {
            
                        if ( !cache ) {
                            cache = {};
                        }

                        cache[mode] = {
                            scale: realScale,
                            height: slideDimensions.height,
                            width: slideDimensions.width,
                            scrolling: isScrollable
                        };

                        slide.setAttribute( 'data-reveal-dim-cache', JSON.stringify( cache ) );
                    }
                }
            }

            // We need to compensate for the scale factor, which is applied to the entire slide,
            // hence for centering properly *and* covering the entire intended slide area, we need
            // to scale the target size accordingly and use this scaled up/down version: 
            assert( realScale );
            targetSlideHeight = Math.round(targetInfo.slideHeight / realScale);
            targetSlideWidth = Math.round(targetInfo.slideWidth / realScale);

            // Pin the height of every slide as otherwise the overview rendering will be botched
            // and so will the regular view, when the slide is 'scrollable'.
            //
            // WARNING: it also means the user cannot set a hardwired style="height: YYY px;" style
            // or some such for any SECTION and expect to live...
            slide.style.height = slideDimensions.height + 'px';
            slide.style.width = slideDimensions.width + 'px';

            slide.style.top = 0;
            slide.style.left = 0;

            var center_pad_v = Math.max(0, targetSlideHeight - slideDimensions.height);
            var center_pad_h = Math.max(0, targetSlideWidth - slideDimensions.width);

            // Erase *all* padding before we apply the new calculated slide padding: we need to do
            // this as 'regular' view mode and 'overview' mode may apply different scales and have
            // different content showing, which can result in different axes maxing out, e.g. 
            // vertical axis in 'regular' mode, while the horizontal axis may max out when the slide
            // is displayed in 'overview' mode.
            slide.style.marginTop = null;
            slide.style.marginBottom = null;
            slide.style.marginLeft = null;
            slide.style.marginRight = null;
            slide.style.paddingTop = null;
            slide.style.paddingBottom = null;
            slide.style.paddingLeft = null;
            slide.style.paddingRight = null;

            // Do not apply the center padding if the user didn't ask for it via configuration, either globally or for this particular slide
            if ( config.center || slide.classList.contains( 'center' ) ) {
                if (center_pad_v > 0) {
                    slide.style.paddingTop = Math.floor( center_pad_v / 2 ) + 'px';
                    slide.style.paddingBottom = Math.ceil( center_pad_v / 2 ) + 'px';
                }
                if (center_pad_h > 0) {
                    slide.style.paddingLeft = Math.floor( center_pad_h / 2 ) + 'px';
                    slide.style.paddingRight = Math.ceil( center_pad_h / 2 ) + 'px';
                }
            }
            else if ( isOverview() ) {
                // Make sure all slides have the same size no matter what!
                //
                // Assume left/top alignment now.
                if (center_pad_v > 0) {
                    slide.style.paddingTop = center_pad_v + 'px';
                    slide.style.paddingBottom = 0;
                }
                if (center_pad_h > 0) {
                    slide.style.paddingLeft = center_pad_h + 'px';
                    slide.style.paddingRight = 0;
                }
            }

            // Set the slide height/width where appropriate, keeping the slide scale in mind:
            // it is applied to the individual slide, hence its dimensions will differ from those
            // of its wrapper.
            var parentWidth, parentHeight;

            if ( slideDimensions && isScrollable && !isOverview() ) {
                // when the scrollable content is wider/higher than the slide area, we better kill the fixed height. Same for the width...
                if ( slideDimensions && slideDimensions.width > targetInfo.slideWidth ) {
                    parentWidth = null;
                } else {
                    parentWidth = targetInfo.slideWidth + 'px';
                }
                if ( slideDimensions && slideDimensions.height > targetInfo.slideHeight ) {
                    parentHeight = null;
                } else {
                    parentHeight = targetInfo.slideHeight + 'px';
                }
            } else {
                parentWidth = targetInfo.slideWidth + 'px';
                parentHeight = targetInfo.slideHeight + 'px';
            }

            queueDimensions( dom_slides_inner, parentWidth, parentHeight );
            if ( parentSlide ) {
                queueDimensions( parentSlide, parentWidth, parentHeight );
            }

            commonScale = Math.min( commonScale, realScale );
            assert( commonScale );
            assert( commonScale > 0 );

            queueScale( slide, realScale );

            if ( isScrollable ) {
                queueAddClass( slide, 'scrollable-slide' );
            }

            // Hide the slide again; it'll be shown if necessary at the end of the layout process

            slide.classList.remove( 'past-1' );
            slide.classList.remove( 'past' );
            slide.classList.remove( 'present' );
            slide.classList.remove( 'slide-measurement' );
            slide.classList.remove( 'future' );
            slide.classList.remove( 'future-1' );

            if ( parentSlide ) {
                resetElementTransform( parentSlide );

                parentSlide.classList.remove( 'past-1' );
                parentSlide.classList.remove( 'past' );
                parentSlide.classList.remove( 'present' );
                parentSlide.classList.remove( 'slide-measurement' );
                parentSlide.classList.remove( 'future' );
                parentSlide.classList.remove( 'future-1' );

                hideSlide( parentSlide );
            }

            dom_slides_outer.classList.remove( 'slide-measurement' );
            dom_slides_inner.classList.remove( 'slide-measurement' );

            hideSlide( slide );

        }


        targetInfo = getAvailableSlideDimensionsInfo( null, targetInfo );

        if ( targetInfo && dom_slides_inner ) {

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

            // Backup all styles, etc. which will be changed in here, but are otherwise subject to CSS transitions (animation).
            backupCurrentStyles( dom.viewport );
            backupCurrentStyles( dom.wrapper );
            backupCurrentStyles( dom_slides_outer );
            backupCurrentStyles( dom_slides_inner );
            var slides = toArray( dom_slides_inner.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ) );
            slides.forEach( function( slide ) {
                // Remember the current styles, at least temporarily, so that we can restore them
                // at the end and ensure the proper transitions always take place, despite us
                // performing some DOM-render-triggering measurements in here next (getComputedSlideSize()).
                backupCurrentStyles( slide );
                var indices = getIndices( slide );
                assert( indices );
                var background = getSlideBackground( indices.h, indices.v );
                if ( background ) {
                    backupCurrentStyles( background );
                }
            } );
            // The backup is done!

            var fundamentalScale = 1.0;

            // Prevent transitions while we're layout-ing
            dom.wrapper.classList.add( 'no-transition' );

            // Before recalculating the slide height(s), position, etc., we must nuke 
            // the previously patched in padding/top/etc. to get a correct measurement.

            // Reset wrapper scale for both single sheet view / overview modes:
            resetElementTransform( dom_slides_inner );
            scaleElement( dom_slides_inner, fundamentalScale );

            dom_slides_inner.style.width = null;
            dom_slides_inner.style.height = null;
            // Setting a fixed width helps to produce a consistent layout and slide dimensions measurement.
            dom_slides_inner.style.width = targetInfo.slideWidth + 'px';

            // Calculate the fundamental scale for each slide to ensure it will fit the viewport.
            // This scale factor assumes all slides to be equal in dimensions; 'scrollable slides'
            // will therefor most probably end up with a scrollbar (as per CSS styling) and 
            // all slides will be be made to fit this 'one size fits all' by scaling them individually 
            // as the need arises.
            //
            // We assume a 'fundamental scale factor' of 1.0 when we're rendering an Overview layout.

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

                var totalSlidesWidth = targetInfo.slideWidth * hcount * ( 1 + config.overviewGutter ); 
                var totalSlidesHeight = targetInfo.slideHeight * vcount * ( 1 + config.overviewGutter );

                // Determine scale of content to fit within RAW available space: the entire viewport (at least the part that's reserved for *us*)
                fundamentalScale = Math.min( targetInfo.rawAvailableWidth / totalSlidesWidth, targetInfo.rawAvailableHeight / totalSlidesHeight );

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

            // Before we start, hide *all* slides; when we layout each slide in the next loop, we will
            // (temporarily) unhide it, so that we have the minimum amount of active DOM nodes to reflow
            // on every iteration. 
            slides.forEach( function( slide ) {
                hideSlide( slide );
            } );

            var horizontalSlides = dom_slides_inner.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR );
            var info = getSlidesOverviewInfo();

            for ( var rerun = 0; rerun <= +wantCommonScale; rerun++ ) {
                enforceCommonScale = (rerun === 1);

                // Note: keep in mind that transformElement() and scaleElement() are *additive* so we always need to
                // *reset* the transform for each element when we start the layout positioning/scaling process!
                //
                // Also note that we first position the slide for the overlay and only then do we layout the slide itself,
                // as that part will apply a slide-specific scaling.
                var percentage = 100 * ( 1 + ( isOverview() ? config.overviewGutter : config.slideGutter ) );
                for ( var i = 0, hlen = horizontalSlides.length; i < hlen; i++ ) {
                    var hslide = horizontalSlides[i],
                        hoffset = config.rtl ? -percentage : percentage,
                        voffset = percentage;

                    // reset transform: the stack is at (0,0,0) in regular view mode and overview mode performs its own positioning at the end in this loop
                    queueReset( hslide );

                    if( hslide.classList.contains( 'stack' ) ) {

                        // Apply CSS transform to position the slide for the overview. Use the same for the regular view.
                        queueTransform( hslide, translate( 'X', ( i - ( indexh || 0 ) ) * hoffset, '%' ) );

                        var verticalSlides = hslide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );

                        var verticalIndex = ( i === indexh ? ( indexv || 0 ) : getPreviousVerticalIndex( hslide ) );

                        for ( var j = 0, vlen = verticalSlides.length; j < vlen; j++ ) {
                            var vslide = verticalSlides[j];

                            // reset transform
                            queueReset( vslide );

                            layoutSingleSlide( vslide, hslide, i, j );

                            // Apply CSS transform
                            queueTransform( vslide, translate( 'Y', ( j - verticalIndex ) * voffset, '%' ) );
                        }

                    }
                    else {

                        layoutSingleSlide( hslide, null, i, 0 );

                        // Apply CSS transform to position the slide for the overview.
                        queueTransform( hslide, translate( 'X', ( i - ( indexh || 0 ) ) * hoffset, '%' ) );

                    }

                }
            }

            if ( currentSlide && isScrollableSlide( currentSlide ) ) {
                queueAddClass( dom_slides_outer, 'scrollable-slide' );
            }

            // Now that we have done all layout work re positioning, scaling, etc., we are
            // going to restore all elements' styles & classes as they were before this call.
            restoreAllCurrentStyles();            

            // // Fixup jumping behaviour when transitioning *to* the overview mode:
            // if ( currentMode !== previousMode && isOverview() ) {
            //     resetElementTransform( dom_slides_inner );
            //     scaleElement( dom_slides_inner, 1.0 );
            // }
            
            // After which we tickle the DOM into re-rendering once again: this will be 
            // our departure point for all the queued transformations, which the browser will
            // thus observe as *changes* and execute all the programmed CSS transitions:
            /* @void */ dom_slides_outer.offsetHeight;

            // Now continue and turn the slides visible/invisible according to the new layout.
            //            
            // Ensure only the current slide is visible when in regular display mode; 
            // the previous and next siblings will be visible for a while though too to facilitate
            // smooth fore- and background transitions.
            //
            // When in Overview mode, here is where we limit the visibility of the 
            // viewDistance-restricted set of slides.
            updateSlidesVisibility();

            // And register all the transforms, etc. which were produced by the layout process above.
            runQueue();

            resetElementTransform( dom_slides_inner );
            scaleElement( dom_slides_inner, fundamentalScale * ( isOverview() ? 1 : 1.0 ) );


            // set the scale for the slide(s) is the last thing we do, so it gets CSS3 animation applied:
            console.log("layout: ", {
                targetInfo: targetInfo,
                overview_slides_info: getSlidesOverviewInfo(),
                indices: getIndices(),
                scale: fundamentalScale
            });

            updateProgress();
            updateParallax();

        }

    }

    /**
     * Destroy the slides' scaling & dimensions cache for the target slide. When no slide is specified,
     * the cache for *all slides* will be destroyed.
     *
     * This will force Reveal to recalculate each slide's layout on the next invocation of #layout(), which
     * can be called directly or indirectly, e.g. via the navigate functions or the #(de)activateOverview()
     * functions.
     *
     * Returns an array of slides (HTMLElement DOM nodes) which have had their cache flushed. 
     */
    function nukeSlideLayoutCache( slide ) {

        var slides;

        // Using the #getIndices() + #getSlide() sequence, we can be sure that whatever was passed in as `slide`,
        // we will always land on the slide HTMLElement itself.
        var slideCoords = slide && getIndices( slide );
        if ( slideCoords ) {
            slide = getSlide( slideCoords.h, slideCoords.v );
            assert( slide );
            slides = [ slide ];
        }
        else {
            // Select all slides
            slides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ) );
        }

        slides.forEach( function( slide ) {
            // Note: we nuke all cache entries, i.e. all *modes*, for this slide.
            slide.removeAttribute( 'data-reveal-dim-cache' );
        } );

        return slides;

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
     * Calculates the computed pixel size of our viewport.
     *
     * Returns the viewport display sizes in pixels.
     */
    function getViewportDimensionsInfo() {

        if ( !dom.wrapper || !dom.slides ) return false;

        var rawAvailableWidth, rawAvailableHeight, availableWidth, availableHeight;
        var viewportInfo, documentInfo;

        // When the document does not readily occupy the entire viewport, then we make sure it does:
        viewportInfo = verge.viewport();
        var htmlNode = document.querySelector( 'html' );
        documentInfo = verge.rectangle( htmlNode );

        var remeasureWidth = ( documentInfo.width < viewportInfo.width );
        var remeasureHeight = ( documentInfo.height < viewportInfo.height );
        if ( remeasureWidth ) {
            htmlNode.style.width = '100%';
        }
        if ( remeasureHeight ) {
            htmlNode.style.height = '100%';
        }

        // Available space to scale within
        rawAvailableWidth = dom.wrapper.offsetWidth;
        rawAvailableHeight = dom.wrapper.offsetHeight;
 
        if ( remeasureWidth ) {
            htmlNode.style.width = null;
        }
        if ( remeasureHeight ) {
            htmlNode.style.height = null;
        }

        var rawAvailablePrintWidth, rawAvailablePrintHeight, availablePrintWidth, availablePrintHeight;

        // Dimensions of the page surface
        rawAvailablePrintWidth = config.printWidth;
        rawAvailablePrintHeight = config.printHeight;

        var shrinkage = 1 - config.printMargin;
        assert(shrinkage > 0.5);
        assert(shrinkage <= 1.0);
        
        availablePrintWidth = Math.floor(rawAvailablePrintWidth * shrinkage); // ... and round down to whole pixels
        availablePrintHeight = Math.floor(rawAvailablePrintHeight * shrinkage);

        console.log("getViewportDimensionsInfo: ", 
            dom.wrapper.offsetWidth,
            dom.wrapper.offsetHeight,
            dom.slides_wrapper.offsetWidth,
            dom.slides_wrapper.offsetHeight,
            dom.slides.offsetWidth,
            dom.slides.offsetHeight,
            dom.wrapper.style.width,
            dom.wrapper.style.height,
            dom.slides_wrapper.style.width,
            dom.slides_wrapper.style.height,
            dom.slides.style.width,
            dom.slides.style.height,
            rawAvailableWidth,
            rawAvailableHeight
        );

        return {
            rawAvailableWidth: rawAvailableWidth,
            rawAvailableHeight: rawAvailableHeight,

            // available space reduced by margin
            availableWidth: -1,             // i.e. not determined yet
            availableHeight: -1,

            rawAvailablePrintWidth: rawAvailablePrintWidth,
            rawAvailablePrintHeight: rawAvailablePrintHeight,

            // available space reduced by (print) margin
            availablePrintWidth: availablePrintWidth,
            availablePrintHeight: availablePrintHeight,

            // (Target) Dimensions of the content
            slideWidth: -1,                     // i.e. not determined yet
            slideHeight: -1,

            slideMarginWidth: -1,
            slideMarginHeight: -1
        };

    }

    /**
     * Get the width / height margins specified for this slide in pixels 
     * (slides may override the configured default perunage).
     */
    function getSlideMargin( slideElement, rawAvailableWidth, rawAvailableHeight ) {

        // Reduce available space by margin
        var margin = config.margin;
        var marginXdata, marginYdata, margindata;
        var marginX, marginY;
        var marginWidth, marginHeight;

        assert(margin < 0.5);
        assert(margin >= 0.0);

        var slide = produceSlideElement( slideElement );
        if ( !slide ) {
            // Slide margin is a perunage
            marginWidth = margin * rawAvailableWidth;
            marginHeight = margin * rawAvailableHeight;
        }
        else {
            margindata = slide.getAttribute( 'data-slide-margin' ); // percentage or pixels

            // TODO: check if margindata is a JSON object listing top/right/bottom/left margins....
            
            // marginXdata = slide.getAttribute( 'data-slide-margin-width' ) || margindata; // percentage or pixels
            // marginYdata = slide.getAttribute( 'data-slide-margin-height' ) || margindata; // percentage or pixels

            if ( typeof marginXdata === 'string' && /%$/.test( marginXdata ) ) {
                // Slide margin width is a percentage of available width
                marginX = ( parseInt( marginXdata, 10 ) || 0 ) / 100;
                marginWidth = marginX * rawAvailableWidth;
            }
            else {
                // Slide margin width is a fixed number in pixels
                marginWidth = ( parseInt( marginXdata, 10 ) || 0 );
            }

            if ( typeof marginYdata === 'string' && /%$/.test( marginYdata ) ) {
                // Slide margin height is a percentage of available height
                marginY = ( parseInt( marginYdata, 10 ) || 0 ) / 100;
                marginHeight = marginY * rawAvailableHeight;
            }
            else {
                // Slide margin width is a fixed number in pixels
                marginHeight = ( parseInt( marginYdata, 10 ) || 0 );
            }

            assert(marginWidth < 0.5 * rawAvailableWidth);
            assert(marginWidth >= 0.0);
            assert(marginHeight < 0.5 * rawAvailableHeight);
            assert(marginHeight >= 0.0);
        }

        return {
            width: Math.floor(marginWidth / 2), // ... and round down to whole pixels
            height: Math.floor(marginHeight / 2)
        };

    }

    /**
     * Calculates the computed pixel size of the real estate available for our slide. These
     * values are based on the width and height configuration
     * options and the input produced by the #getViewportDimensionsInfo() API.
     *
     * Returns the viewport and slide display sizes in pixels
     * (percentage-based slide width and height are converted to pixels).
     */
    function getAvailableSlideDimensionsInfo( slide, targetInfo ) {

        slide = produceSlideElement( slide );

        if ( !dom.wrapper || !dom.slides || !targetInfo ) return false;

        var viewportInfo, documentInfo;

        // Reduce available space by margin
        var margin = getSlideMargin( slide, targetInfo.rawAvailableWidth, targetInfo.rawAvailableHeight );

        var availableWidth = targetInfo.rawAvailableWidth - margin.width * 2;
        var availableHeight = targetInfo.rawAvailableHeight - margin.height * 2;

        // Dimensions of the content
        var slideWidth = config.width,
            slideHeight = config.height;

        // Slide width may be a percentage of available width
        if( typeof slideWidth === 'string' && /%$/.test( slideWidth ) ) {
            slideWidth = parseInt( slideWidth, 10 ) / 100 * availableWidth;
        }

        // Slide height may be a percentage of available height
        if( typeof slideHeight === 'string' && /%$/.test( slideHeight ) ) {
            slideHeight = parseInt( slideHeight, 10 ) / 100 * availableHeight;
        }

        // available space reduced by margin
        targetInfo.availableWidth = availableWidth;             // a.k.a. presentationWidth
        targetInfo.availableHeight = availableHeight;

        // (Target) Dimensions of the content
        targetInfo.slideWidth = slideWidth;                     // a.k.a. width ~ slide width
        targetInfo.slideHeight = slideHeight;

        targetInfo.slideMarginWidth = margin.width;
        targetInfo.slideMarginHeight = margin.height;

        return targetInfo;

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

        assert( stack && stack.classList.contains( 'stack' ) );
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
                currentParentSlide: currentParentSlide,
                slidesMatrixInfo: getSlidesOverviewInfo()
            } );

            // Don't auto-slide while in overview mode
            cancelAutoSlide();

            // Set the depth of the presentation. This determines how far we
            // zoom out and varies based on display size. It gets applied at
            // the layout step.
            //var depth = window.innerWidth < 400 ? 1000 : 2500;

            dom.wrapper.classList.add( 'overview' );
            dom.wrapper.classList.remove( 'overview-deactivating' );

            // TODO: Move the backgrounds element into the slide container to
            // that the same scaling is applied
            //dom.slides.appendChild( dom.background );

            dom.wrapper.classList.remove( config.transition );
            dom.wrapper.classList.add( config.overviewTransition );

            clearTimeout( activateOverviewTimeout );

            // Temporarily add a class so that transitions can do different things
            // depending on whether they are exiting/entering overview, or just
            // moving from slide to slide
            dom.wrapper.classList.add( 'overview-activating' );

            activateOverviewTimeout = setTimeout( function () {
                activateOverviewTimeout = null;
                dom.wrapper.classList.remove( 'overview-activating' );
            }, 50 );

            console.log('Feed the slides matrix to LAYOUT so we can determine properly how far to zoom/transform: ', overview_slides_info);

            // Select all slides
            toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ) ).forEach( function( slide ) {
                slide.addEventListener( 'click', onOverviewSlideClicked, true );
            } );

            // Register that we switch modes now:
            var mode = getDeckMode();
            assert( mode !== currentMode );
            previousMode = currentMode;
            currentMode = mode;

            layout();

            // Notify observers of the overview showing
            dispatchEvent( 'overviewshown', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide,
                currentParentSlide: currentParentSlide,
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

        if( dom.wrapper ) {

            // overview_slides_info = null;

            // Notify observers of the overview hiding
            dispatchEvent( 'overviewhidden:before', {
                indexh: indexh,
                indexv: indexv,
                currentSlide: currentSlide
            } );

            dom.wrapper.classList.remove( 'overview' );
            dom.wrapper.classList.remove( 'overview-activating' );

            // TODO: Move the background element back out
            //dom.wrapper.appendChild( dom.background );

            dom.wrapper.classList.remove( config.overviewTransition );
            dom.wrapper.classList.add( config.transition );

            clearTimeout( activateOverviewTimeout );

            // Temporarily add a class so that transitions can do different things
            // depending on whether they are exiting/entering overview, or just
            // moving from slide to slide
            dom.wrapper.classList.add( 'overview-deactivating' );

            activateOverviewTimeout = setTimeout( function () {
                activateOverviewTimeout = null;
                dom.wrapper.classList.remove( 'overview-deactivating' );
            }, 50 );

            // Clean up changes made to slides
            toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ) ).forEach( function( slide ) {
                slide.removeEventListener( 'click', onOverviewSlideClicked, true );
            } );

            // TODO: Clean up changes made to backgrounds
            //toArray( dom.background.querySelectorAll( '.slide-background' ) ).forEach( function( background ) {
            //  resetElementTransform( background );
            //} );

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
            if ( override ) {
                activateOverview();
            } else {
                deactivateOverview();
            }
        }
        else {
            if ( isOverview() ) {
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
     * (Internal Use Only) Return a number {0..3} identifying the current 'presentation mode' of the slide deck.
     *
     * @returns 0: regular, 1: overview, 2: regular slide in print, 3: overview in print
     */
    function getDeckMode() {

        return 1 * !!isOverview() + 2 * !!isPrintingPDF();

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

        var horizontalSlides = dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR );
        var hlen = horizontalSlides.length;
        overview_slides_info = {
            horizontal_count: hlen,
            vertical_count: 1
        };

        for( var i = 0; i < hlen; i++ ) {
            var hslide = horizontalSlides[i];

            hslide.setAttribute( 'data-index-h', i );

            // this assumes we have invoked prepSlideHierarchy() at the appropriate time.
            if( hslide.classList.contains( 'stack' ) ) {

                var verticalSlides = hslide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );
                var vlen = verticalSlides.length;
                overview_slides_info.vertical_count = Math.max( overview_slides_info.vertical_count, vlen );

                for( var j = 0; j < vlen; j++ ) {
                    var vslide = verticalSlides[j];

                    vslide.setAttribute( 'data-index-h', i );
                    vslide.setAttribute( 'data-index-v', j );
                }
            }
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
     * Checks if the current or specified slide is a 'scrollable' slide, 
     * i.e. a slide which is expected to be longer than the viewport and
     * thus require scrolling to read the content.
     */
    function isScrollableSlide( slide ) {

        // Prefer slide argument, otherwise use current slide
        slide = slide ? slide : currentSlide;

        return deserialize( slide.getAttribute( 'data-scrollable' ) ) || false;

    }

    /**
     * Produces the slide HTMLElement parent of the specified element or
     * NULL when the given element is not part of a slide.
     *
     * Invoke the optional callback for both the element itself and 
     * every parent we inspect while traveling up the DOM tree while
     * trying to find the section HTML node itself. 
     */
    function produceSlideElement( element, callback ) {

        if ( !element || !element.nodeName ) {
            return null;
        }

        callback = (typeof callback === 'function' ? callback : function () {} );

        while ( element && element.nodeName ) {
            callback( element );
            if ( element.nodeName.match( /^section$/i ) ) {
                var parentElement = element.parentNode;
                var granpaElement = ( parentElement && parentElement.parentNode );

                if ( parentElement && ( 
                    // Is this a 'horizontal slide'?
                    dom.slides === parentElement || 
                    // Or is this is 'horizontal slide' overview clone?
                    (config.simplifiedOverview && dom.slides_overview_inner === parentElement) ||
                    // Or is this some kind of 'vertical slide'?
                    (   granpaElement &&
                        parentElement.nodeName &&
                        parentElement.nodeName.match( /^section$/i ) &&
                        ( 
                            // Is this a 'vertical slide'?
                            dom.slides === granpaElement || 
                            // Or is this is 'vertical slide' overview clone?
                            (config.simplifiedOverview && dom.slides_overview_inner === granpaElement)
                        )
                    )
                ) ) {
                    break;
                }
            }

            element = element.parentNode;
        }

        return element || null;

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

        if( dom.wrapper && config.pause ) {
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

        var indexhBefore = indexh || 0,
            indexvBefore = indexv || 0;

        // Remember the state before this slide
        var stateBefore = state.concat();

        // Reset the state array
        state.length = 0;

        // Query all horizontal slides in the deck
        var horizontalSlides = dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR );

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
            currentVerticalSlides = false;
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

        // mode: 0: regular, 1: overview, 2: regular slide in print, 3: overview in print
        var mode = getDeckMode();

        // Do we change to another the slide or not?
        var slideChanged = ( h !== indexhBefore || v !== indexvBefore || !oldSlide );
        var fragmentChanged = (!slideChanged ? f != null ? f !== previousFragmentIndex : false : false);
        var modeChanged = (mode !== currentMode);

        if ( !slideChanged && !fragmentChanged && !modeChanged ) {
            // do not layout the same slide+fragment again when nothing really changed; this can only corrupt CSS transitions, etc.
            return false;
        }

        if ( slideChanged ) {
            // Ensure that the previous slide is never the same as the current
            previousSlide = oldSlide;
            previousSlideIndexV = indexvBefore;
            previousSlideIndexH = indexhBefore;
        }
        if ( slideChanged || fragmentChanged ) {
            previousFragmentIndex = currentFragmentIndex;
            currentFragmentIndex = null;
        }
        previousMode = currentMode;
        currentMode = mode;

        // Store reference to the current slide
        currentSlide = currentVerticalSlide;
        assert( currentSlide );
        currentParentSlide = ( currentVerticalSlide !== currentHorizontalSlide ? currentHorizontalSlide : null );

        // Activate and transition to the new slide
        indexh = updateSlides( HORIZONTAL_SLIDES_SELECTOR, h );
        indexv = updateSlides( VERTICAL_SLIDES_SELECTOR, v );
        assert( indexh === h );
        assert( indexv === v );

        // If we were on a vertical stack, remember what vertical index
        // it was on so we can resume at the same position when returning.
        if ( currentVerticalSlides !== false ) {
            setPreviousVerticalIndex( currentVerticalSlide.parentNode, indexv );
        }


        // Apply the new state
        for( var i = 0, len = state.length; i < len; i++ ) {
            // Check if this state existed on the previous slide. If it
            // did, we will avoid adding it repeatedly
            var j = stateBefore.indexOf( state[i] );
            if ( j !== -1 ) {
                stateBefore.splice( j, 1 );
            }
            else {
                document.documentElement.classList.add( state[i] );

                // Dispatch custom event matching the state's name
                dispatchEvent( state[i] );
            }
        }

        // Clean up the remains of the previous state
        while( stateBefore.length ) {
            var sb = stateBefore.pop();

            // Dispatch custom event matching the state's name
            dispatchEvent( sb + ':removed' );

            document.documentElement.classList.remove( sb );
        }

        // - Update the visibility of slides now that the indices have changed.
        // - If the overview is active, update positions.
        layout();

        // Show fragment, if specified
        fragmentChanged = navigateFragment( f );

        // Dispatch an event if the slide changed
        if( slideChanged ) {
            dispatchEvent( 'slidechanged', {
                indexh: indexh,
                indexv: indexv,
                indexf: currentFragmentIndex,
                previousSlide: previousSlide,
                currentSlide: currentSlide,
                currentParentSlide: currentParentSlide,
                origin: o
            } );
        }

        if ( indexh === 0 && indexv === 0 && slideChanged && !isOverview() ) {
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
        dom.statusDiv.textContent = ( currentSlide ? currentSlide.textContent.trim() : '' );

        updateControls();
        updateProgress();
        updateBackground();
        updateParallax();
        updateSlideNumber();
		updateNotes();

        // Update the URL hash
        writeURL();

        cueAutoSlide();

        return slideChanged || fragmentChanged || modeChanged;

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

        // Generate the Overview DOM tree
        createOverview();

        // Force a layout to make sure the current config is accounted for
        nukeSlideLayoutCache();
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
		updateNotes();

        formatEmbeddedContent();
        startEmbeddedContent( currentSlide );

        if( isOverview() ) {
            layoutOverview();
        }
    }

    /**
     * Resets all vertical slides so that only the first
     * is visible.
     */
    function resetVerticalSlides() {

        var horizontalSlides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) );
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

        var slides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR + '.stack') );
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

        var horizontalSlides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) );
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
	 * Randomly shuffles all slides in the deck.
	 */
	function shuffle() {

		var slides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

		slides.forEach( function( slide ) {

			// Insert this slide next to another random slide. This may
			// cause the slide to insert before itself but that's fine.
			dom.slides.insertBefore( slide, slides[ Math.floor( Math.random() * slides.length ) ] );

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

                var reverse = config.rtl && !isVerticalSlide( element );

                element.classList.remove( 'past-1' );
                element.classList.remove( 'past' );
                element.classList.remove( 'present' );
                element.classList.remove( 'future' );
                element.classList.remove( 'future-1' );

                // http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
                element.setAttribute( 'hidden', '' );
                element.setAttribute( 'aria-hidden', 'true' );

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
     *
     * Return the set of slides which will become visible, and the set of slides which will disappear (hide) now.
     */
    function updateSlidesVisibility() {

        __updateSlidesVisibility( dom.slides );
        if ( config.simplifiedOverview && config.overview ) {
            __updateSlidesVisibility( dom.slides_overview_inner );
        }

    }

    function __updateSlidesVisibility( dom_base ) {

        // The list of slides which must be made invisible after the transitions are completed.
        var slides_to_clear = [];

        // And this is the function that will take care of that once the delay expires.
        function delayedHideSiblingSlides() {
            for ( var i = 0, len = slides_to_clear.length; i < len; i++ ) {
                hideSlide( slides_to_clear[i] );
            }
            transitionMaxDurationTimeout = null;
        }

        // Reset the kill timer, as we don't care about old transitions: those will
        // be handled immediately by the code below. We are only interested in *delayed hiding*
        // of the new prev/next siblings!
        clearTimeout( transitionMaxDurationTimeout );
        transitionMaxDurationTimeout = setTimeout( delayedHideSiblingSlides, Math.max( config.transitionMaxDuration, 1 ) );

        // Select all slides and convert the NodeList result to
        // an array
        var horizontalSlides = toArray( dom_base.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) ),
            horizontalSlidesLength = horizontalSlides.length,
            distanceX,
            distanceY;

        if( horizontalSlidesLength ) {

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
                    assert( !isOverview() ? distanceX <= 1 : true );
                    showSlide( horizontalSlide );
                    if ( distanceX !== 0 && !isOverview() ) {
                        slides_to_clear.push( horizontalSlide );
                    }
                }
                else {
                    hideSlide( horizontalSlide );
                }

                if( verticalSlidesLength ) {

                    var oy = getPreviousVerticalIndex( horizontalSlide );

                    for( var y = 0; y < verticalSlidesLength; y++ ) {
                        var verticalSlide = verticalSlides[y];

                        distanceY = ( x === ( indexh || 0 ) ? Math.abs( ( indexv || 0 ) - y ) : Math.abs( y - oy ) );

                        if( distanceX + distanceY <= viewDistance ) {
                            assert( !isOverview() ? distanceX + distanceY <= 1 : true );
                            showSlide( verticalSlide );
                            if ( distanceX + distanceY !== 0 && !isOverview() ) {
                                slides_to_clear.push( verticalSlide );
                            }
                        }
                        else {
                            hideSlide( verticalSlide );
                        }
                    }

                }
            }

        }

    }

    /**
	 * Pick up notes from the current slide and display tham
	 * to the viewer.
	 *
	 * @see `showNotes` config value
	 */
	function updateNotes() {

		if( config.showNotes && dom.speakerNotes && currentSlide && !isPrintingPDF() ) {

			dom.speakerNotes.innerHTML = getSlideNotes() || '';

		}

	}

	/**
     * Updates the progress bar to reflect the current slide.
     */
    function updateProgress() {

        // Update progress if enabled
        if( config.progress && dom.progressbar ) {

            dom.progressbar.style.width = getProgress() * dom.wrapper.offsetWidth + 'px';

        }
    }

    /**
     * Updates the slide number div to reflect the current slide.
     *
	 * The following slide number formats are available:
	 *  "h.v": 	horizontal . vertical slide number (default)
	 *  "h/v": 	horizontal / vertical slide number
	 *    "c": 	flattened slide number
	 *  "c/t": 	flattened slide number / total slides
     */
    function updateSlideNumber() {

        // Update slide number if enabled
        if( config.slideNumber && dom.slideNumber) {

			var value = [];
			var format = 'h.v';

			// Check if a custom number format is available
			if( typeof config.slideNumber === 'string' ) {
				format = config.slideNumber;
			}

			switch( format ) {
				case 'c':
					value.push( getSlidePastCount() + 1 );
					break;
				case 'c/t':
					value.push( getSlidePastCount() + 1, '/', getTotalSlides() );
					break;
				case 'h/v':
					value.push( indexh + 1 );
					if( isVerticalSlide() ) value.push( '/', indexv + 1 );
					break;
				default:
					value.push( indexh + 1 );
					if( isVerticalSlide() ) value.push( '.', indexv + 1 );
					break;
			}

			dom.slideNumber.innerHTML = formatSlideNumber( value[0], value[1], value[2] );

 // old code:
 if (0) {
            var v = false;
            if( indexv > 0 ) {
                v = indexv;
            }

            var f = false;
            if( config.fragments ) {
                if( currentSlide ) {
                    var currentFragment = currentSlide.querySelector( '.fragment.visible.current-fragment' );
                    if( currentFragment ) {
                        f = (parseInt( currentFragment.getAttribute( 'data-fragment-index' ), 10 ) + 1) || 0;
                    }
                    else {
                        var allFragments = currentSlide.querySelectorAll( '.fragment' );
                        // when the current slide has fragments but none of them is 'current' then we are at the start of the slide
                        // which we represent by fragment number zero(0):
                        if( allFragments.length > 0 ) {
                            f = 0;
                        }
                    }
                }
            }

            dom.slideNumber.innerHTML = format.replace( /h/g, indexh )
                                                .replace( /v/g, (indexv === false ? '-' : indexv ))
                                                .replace( /f/g, (f === false ? '-' : f ))
                                                .replace( /c/g, getSlidePastCount() + 1 )
                                                .replace( /t/g, getTotalSlides() );
}

		}

	}

	/**
	 * Applies HTML formatting to a slide number before it's
	 * written to the DOM.
	 */
	function formatSlideNumber( a, delimiter, b ) {

		if( typeof b === 'number' && !isNaN( b ) ) {
			return  '<span class="slide-number-a">'+ a +'</span>' +
					'<span class="slide-number-delimiter">'+ delimiter +'</span>' +
					'<span class="slide-number-b">'+ b +'</span>';
		}
		else {
			return '<span class="slide-number-a">'+ a +'</span>';
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
        var reverse = config.rtl;

        // Update the classes of all backgrounds to match the
        // states of their slides (past/present/future)
        toArray( dom.background.childNodes ).forEach( function( backgroundh, h ) {

            backgroundh.classList.remove( 'past-1' );
            backgroundh.classList.remove( 'past' );
            backgroundh.classList.remove( 'present' );
            backgroundh.classList.remove( 'future' );
            backgroundh.classList.remove( 'future-1' );

            if( h < indexh ) {
                backgroundh.classList.add( reverse ? 'future' : 'past' );
                if ( h + 1 === indexh ) {
                    backgroundh.classList.add( reverse ? 'future-1' : 'past-1' );
                }
            }
            else if ( h > indexh ) {
                backgroundh.classList.add( reverse ? 'past' : 'future' );
                if ( h - 1 === indexh ) {
                    backgroundh.classList.add( reverse ? 'past-1' : 'future-1' );
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
                    backgroundv.classList.add( reverse ? 'future' : 'past' );
                    if ( h + 1 === indexh ) {
                        backgroundv.classList.add( reverse ? 'future-1' : 'past-1' );
                    }
                }
                else if ( h > indexh ) {
                    backgroundv.classList.add( reverse ? 'past' : 'future' );
                    if ( h - 1 === indexh ) {
                        backgroundv.classList.add( reverse ? 'past-1' : 'future-1' );
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
            if( currentVideo ) {

				var startVideo = function() {
					currentVideo.currentTime = 0;
					currentVideo.play();
					currentVideo.removeEventListener( 'loadeddata', startVideo );
				};

				if( currentVideo.readyState > 1 ) {
					startVideo();
				}
				else {
					currentVideo.addEventListener( 'loadeddata', startVideo );
				}

            }

            var backgroundImageURL = currentBackground.style.backgroundImage || '';

            // Restart GIFs (doesn't work in Firefox)
            if( /\.gif/i.test( backgroundImageURL ) ) {
                currentBackground.style.backgroundImage = '';
                window.getComputedStyle( currentBackground ).opacity;
                currentBackground.style.backgroundImage = backgroundImageURL;
            }

            // Don't transition between identical backgrounds. This
            // prevents unwanted flicker.
            var previousBackgroundHash = previousBackground ? previousBackground.getAttribute( 'data-background-hash' ) : null;
            var currentBackgroundHash = currentBackground.getAttribute( 'data-background-hash' );
            if( currentBackgroundHash && currentBackgroundHash === previousBackgroundHash && currentBackground !== previousBackground ) {
                dom.background.classList.add( 'no-transition' );
            }

            previousBackground = currentBackground;

        }

        // If there's a background brightness flag for this slide,
        // bubble it to the .reveal container
        if( currentSlide ) {
            [ 'has-light-background', 'has-dark-background' ].forEach( function( classToBubble ) {
                if( currentSlide.classList.contains( classToBubble ) ) {
                    dom.wrapper.classList.add( classToBubble );
                }
                else {
                    dom.wrapper.classList.remove( classToBubble );
                }
            } );
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

                var horizontalSlides = dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ),
                    verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

                var backgroundWidth = parseInt( bgimg.width, 10 ),
                    backgroundHeight = parseInt( bgimg.height, 10 );

                var slideWidth = dom.background.offsetWidth;
                var horizontalSlideCount = horizontalSlides.length;
                var horizontalOffset = horizontalSlideCount > 1 ? -( backgroundWidth - slideWidth ) / ( horizontalSlideCount - 1 ) * indexh : 0;

                var slideHeight = dom.background.offsetHeight;
                var verticalSlideCount = verticalSlides.length;
                var verticalOffset = verticalSlideCount > 1 ? -( backgroundHeight - slideHeight ) / ( verticalSlideCount - 1 ) * indexv : 0;

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
        toArray( slide.querySelectorAll( 'img[data-src], video[data-src], audio[data-src]' ) ).forEach( function( element ) {
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
                    backgroundVideo = slide.getAttribute( 'data-background-video' ),
                    backgroundVideoLoop = slide.hasAttribute( 'data-background-video-loop' ),
					backgroundVideoMuted = slide.hasAttribute( 'data-background-video-muted' ),
                    backgroundIframe = slide.getAttribute( 'data-background-iframe' );

                // Images
                if( backgroundImage ) {
                    background.style.backgroundImage = 'url(' + backgroundImage + ')';
                }
                // Videos
                else if ( backgroundVideo && !isSpeakerNotes() ) {
                    var video = background.querySelector( 'video' );
                    if( !video ) {
                        video = document.createElement( 'video' );

                        if( backgroundVideoLoop ) {
                            video.setAttribute( 'loop', '' );
                        }

					if( backgroundVideoMuted ) {
						video.muted = true;
					}
                    }
                    // Support comma separated lists of video sources
                    backgroundVideo.split( ',' ).forEach( function( source ) {
                        video.innerHTML += '<source src="' + source + '">';
                    } );

                    background.appendChild( video );
                }
                // Iframes
                else if ( backgroundIframe ) {
                    var iframe = document.createElement( 'iframe' );
                        iframe.setAttribute( 'src', backgroundIframe );
                        iframe.style.width  = '100%';
                        iframe.style.height = '100%';
                        iframe.style.maxHeight = '100%';
                        iframe.style.maxWidth = '100%';

                    background.appendChild( iframe );
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

        var horizontalSlides = dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ),
            verticalSlides = currentParentSlide && currentParentSlide.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR );

        var routes = {
            left: indexh > 0 || !!config.loop,
            right: indexh < horizontalSlides.length - 1 || !!config.loop,
            up: indexv > 0,
            down: verticalSlides && indexv < verticalSlides.length - 1
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

        var _appendParamToIframeSource = function( sourceAttribute, sourceURL, param ) {
            toArray( dom.slides.querySelectorAll( 'iframe['+ sourceAttribute +'*="'+ sourceURL +'"]' ) ).forEach( function( el ) {
                var src = el.getAttribute( sourceAttribute );
                if( src && src.indexOf( param ) === -1 ) {
                    el.setAttribute( sourceAttribute, src + ( !/\?/.test( src ) ? '?' : '&' ) + param );
                }
            });
        };

        // YouTube frames must include "?enablejsapi=1"
        _appendParamToIframeSource( 'src', 'youtube.com/embed/', 'enablejsapi=1' );
        _appendParamToIframeSource( 'data-src', 'youtube.com/embed/', 'enablejsapi=1' );

        // Vimeo frames must include "?api=1"
        _appendParamToIframeSource( 'src', 'player.vimeo.com/', 'api=1' );
        _appendParamToIframeSource( 'data-src', 'player.vimeo.com/', 'api=1' );

    }

    /**
     * Start playback of any embedded content inside of
     * the targeted slide.
     */
    function startEmbeddedContent( slide ) {

        if( slide && !isSpeakerNotes() ) {
            // Restart GIFs
            toArray( slide.querySelectorAll( 'img[src$=".gif"]' ) ).forEach( function( el ) {
                // Setting the same unchanged source like this was confirmed
                // to work in Chrome, FF & Safari
                el.setAttribute( 'src', el.getAttribute( 'src' ) );
            } );

            // HTML5 media elements
            toArray( slide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
                if( el.hasAttribute( 'data-autoplay' ) && typeof el.play === 'function' ) {
                    el.play();
                }
            } );

            // Normal iframes
            toArray( slide.querySelectorAll( 'iframe[src]' ) ).forEach( function( el ) {
                startEmbeddedIframe( { target: el } );
            });

            // Lazy loading iframes
            toArray( slide.querySelectorAll( 'iframe[data-src]' ) ).forEach( function( el ) {
                if( el.getAttribute( 'src' ) !== el.getAttribute( 'data-src' ) ) {
                    el.removeEventListener( 'load', startEmbeddedIframe ); // remove first to avoid dupes
                    el.addEventListener( 'load', startEmbeddedIframe );
                    el.setAttribute( 'src', el.getAttribute( 'data-src' ) );
                }
            });

            // Asciinema embeds
            toArray( slide.querySelectorAll( 'iframe[src*="asciinema.org/api/asciicasts/"]' ) ).forEach( function( el ) {
                if( el.hasAttribute( 'data-autoplay' ) ) {
                    el.contentWindow.postMessage( '["asciicast:play"]', '*' );
                }
            });
        }

    }

    /**
     * "Starts" the content of an embedded iframe using the
     * postmessage API.
     */
    function startEmbeddedIframe( event ) {

        var iframe = event.target;

        // YouTube postMessage API
        if( /youtube\.com\/embed\//.test( iframe.getAttribute( 'src' ) ) && iframe.hasAttribute( 'data-autoplay' ) ) {
            iframe.contentWindow.postMessage( '{"event":"command","func":"playVideo","args":""}', '*' );
        }
        // Vimeo postMessage API
        else if( /player\.vimeo\.com\//.test( iframe.getAttribute( 'src' ) ) && iframe.hasAttribute( 'data-autoplay' ) ) {
            iframe.contentWindow.postMessage( '{"method":"play"}', '*' );
        }
        // Generic postMessage API
        else {
            iframe.contentWindow.postMessage( 'slide:start', '*' );
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
                if( !el.hasAttribute( 'data-ignore' ) && typeof el.pause === 'function' ) {
                    el.pause();
                }
            } );

            // Generic postMessage API for non-lazy loaded iframes
            toArray( slide.querySelectorAll( 'iframe' ) ).forEach( function( el ) {
                el.contentWindow.postMessage( 'slide:stop', '*' );
                el.removeEventListener( 'load', startEmbeddedIframe );
            } );

            // YouTube postMessage API
            toArray( slide.querySelectorAll( 'iframe[src*="youtube.com/embed/"]' ) ).forEach( function( el ) {
                if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
                    el.contentWindow.postMessage( '{"event":"command","func":"pauseVideo","args":""}', '*' );
                }
            });

            // Vimeo postMessage API
            toArray( slide.querySelectorAll( 'iframe[src*="player.vimeo.com/"]' ) ).forEach( function( el ) {
                if( !el.hasAttribute( 'data-ignore' ) && typeof el.contentWindow.postMessage === 'function' ) {
                    el.contentWindow.postMessage( '{"method":"pause"}', '*' );
                }
            } );

            // Lazy loading iframes
            toArray( slide.querySelectorAll( 'iframe[data-src]' ) ).forEach( function( el ) {
                // Only removing the src doesn't actually unload the frame
                // in all browsers (Firefox) so we set it to blank first
                el.setAttribute( 'src', 'about:blank' );
                el.removeAttribute( 'src' );
            } );
        }

    }

    /**
     * Returns the number of past slides. This can be used as a global
     * flattened index for slides.
     */
    function getSlidePastCount() {

        var horizontalSlides = toArray( dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ) );

        // The number of past slides
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

        return pastCount;

    }

    /**
     * Returns a value ranging from 0-1 that represents
     * how far into the presentation we have navigated.
     */
    function getProgress() {

        // The number of past and total slides
        var totalCount = getTotalSlides();
        var pastCount = getSlidePastCount();

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

        var hash = URIparameters().hash.route || '';

        // Attempt to parse the hash as either an index or name
        var bits = hash.split( '/' ),
            name = bits[1] || '';

        // If the first bit is invalid and there is a name we can 
        // assume that this is a named link.
        //
        // However: ensure the named link is a valid HTML ID attribute:
        if( isNaN( parseInt( name, 10 ) ) && name.length && /^[a-zA-Z][\w:.-]*$/.test( name ) ) {
            var element;

            // As the route (slide ID/name) has been converted to lowercase by `writeURL()` before,
            // we must seek the matching slide, rather than simply locate it with a single 
            // DOM query: `document.getElementById(name)` won't fly!
            
            // Find the slide with the specified ID
            var a = toArray( dom.slides.querySelectorAll( SLIDES_SELECTOR ) ).filter( function( element ) {

                // Process the ID, if any, exactly the same way as `writeURL()` did 
                // before we match it against the given route.
                // 
                // Note: This is a non-reversible operation so both `readURL()` and `writeURL()` functions 
                // have to perform the same filter operation here.
                var id = element.getAttribute( 'id' ) || '';
                assert(typeof id === 'string');
				//id = id.toLowerCase();
				id = id.replace( /[^\w:.-]/g, '' );
                
                return id === name;
            });
            
            if( a.length ) {
                assert( a.length === 1 );    // This assertion will fire when you have a set of slides with duplicate IDs -- be reminded that we look at the *case-insensitive* IDs here!
                element = a[0];
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
            var h = parseInt( bits[1], 10 ) || 0,
                v = parseInt( bits[2], 10 ) || 0;

            slide( h, v );
        }

    }

    /**
     * Updates the page URL (hash) to reflect the current
     * state.
     *
     * @param {Number} delay The time in ms to wait before
     * writing the hash
     *
     * Notes from impress.js:
     *
     * > `#/step-id` is used instead of `#step-id` to prevent default browser
     * > scrolling to element in hash.
     * >
     * > And it has to be set after animation finishes, because in Chrome it
     * > makes transition laggy.
     * >
     * > BUG: http://code.google.com/p/chromium/issues/detail?id=62820
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

                // Attempt to create a named link based on the slide's ID.
                // 
                // Note: this action mirrors the one in #readURL(). 
                // This is a non-reversible operation so both `readURL()` and `writeURL()` functions 
                // have to perform the same filter operation here.
                var id = currentSlide.getAttribute( 'id' ) || '';
                assert(typeof id === 'string');
				//id = id.toLowerCase();
				id = id.replace( /[^\w:.-]/g, '' );
                
                // If the current slide has a usable ID, use that as a named link.
                //
                // Ensure the named link is a valid HTML ID attribute -- this check mirrors the one in #readURL().
                if( id.length && /^[a-zA-Z][\w:.-]*$/.test( id ) ) {
                    url += id;
                }
                // Otherwise use the /h/v index
                else {
                    if( indexh > 0 || indexv > 0 ) url += indexh;
                    if( indexv > 0 ) url += '/' + indexv;
                }

                URIparameters().updateHash({ 
                    route: url
                });                
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
        var slideElement = produceSlideElement( element, function ( node ) {
            if ( node.classList && node.classList.contains( 'fragment' ) ) {
                if( node.hasAttribute( 'data-fragment-index' ) ) {
                    f = parseInt( node.getAttribute( 'data-fragment-index' ), 10 ) || 0;
                }
            }
        } );

        // When the element was specified but proved not to be a slide or a child thereof, we return FALSE.
        if ( element && !slideElement ) {
            return false;
        }
        // When no element/slide was specified and we don't have a 'current' slide yet, we also return FALSE.
        if ( !slideElement && !currentSlide ) {
            return false;
        }

        // If a slide is specified, return the indices of that slide
        if( slideElement ) {
            var isVertical = isVerticalSlide( slideElement );
            var slideh = isVertical ? slideElement.parentNode : slideElement;

            // Select all horizontal slides
            var horizontalSlides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) );

            // Now that we know which the horizontal slide is, get its index
            h = Math.max( horizontalSlides.indexOf( slideh ), 0 );

            // Assume we're not vertical
            v = undefined;

            // If this is a vertical slide, grab the vertical index
            if( isVertical ) {
                v = Math.max( toArray( slideh.querySelectorAll( SCOPED_FROM_HSLIDE_VERTICAL_SLIDES_SELECTOR ) ).indexOf( slideElement ), 0 );
            }
        }

        if( config.fragments ) {
            if( !slideElement ) {
                var currentFragment = currentSlide.querySelector( '.fragment.visible.current-fragment' );
                if( currentFragment && currentFragment.hasAttribute( 'data-fragment-index' ) ) {
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
                    fragments = slideElement.querySelectorAll( '.fragment' );
                    if ( fragments.length ) {
                        var visibleFragments = slideElement.querySelectorAll( '.fragment.visible' );
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
        return dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_ALL_SLIDES_SELECTOR ).length - dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR + '.stack' ).length;

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

        var horizontalSlide = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) )[ x ];
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
	 * Retrieves the speaker notes from a slide. Notes can be
	 * defined in two ways:
	 * 1. As a data-notes attribute on the slide <section>
	 * 2. As an <aside class="notes"> inside of the slide
	 */
	function getSlideNotes( slide ) {

		// Default to the current slide
		slide = slide || currentSlide;

		// Notes can be specified via the data-notes attribute...
		if( slide.hasAttribute( 'data-notes' ) ) {
			return slide.getAttribute( 'data-notes' );
		}

		// ... or using an <aside class="notes"> element
		var notesElement = slide.querySelector( 'aside.notes' );
		if( notesElement ) {
			return notesElement.innerHTML;
		}

		return null;

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
						dom.statusDiv.textContent = element.textContent.trim();

                        if( i === index ) {
                            element.classList.add( 'current-fragment' );

                            handleCSSFragments(element, false);
                        }
                        else {
                            element.classList.remove( 'current-fragment' );

                            handleCSSFragments(element, true);
                        }
                    }
                    // Hidden fragments
                    else {
                        if( element.classList.contains( 'visible' ) ) {
                            fragmentsHidden.push( element );
                        }
                        element.classList.remove( 'visible' );
                        element.classList.remove( 'current-fragment' );
                        handleCSSFragments(element, true);
                    }

                } );

                currentFragmentIndex = index;

                if( fragmentsHidden.length ) {
                    dispatchEvent( 'fragmenthidden', { 
                        indexh: indexh,
                        indexv: indexv,
                        indexf: currentFragmentIndex,
                        fragment: fragmentsHidden[0], 
                        fragments: fragmentsHidden,
                        fragmentHiddenCount: fragmentsHidden.length
                    } );
                }

                if( fragmentsShown.length ) {
                    dispatchEvent( 'fragmentshown', { 
                        indexh: indexh,
                        indexv: indexv,
                        indexf: currentFragmentIndex,
                        fragment: fragmentsShown[0], 
                        fragments: fragmentsShown,
                        fragmentShownCount: fragmentsShown.length 
                    } );
                }

                var changed = ( fragmentsShown.length !== 0 || fragmentsHidden.length !== 0 );

                if ( changed ) {
                    updateControls();
                    updateProgress();
                    updateSlideNumber();
                }

                return changed;

            }

        }

        return false;

    }

    /**
     * Handles addition or removal of CSS classes when using CSS fragments.
     *
     * @param {HTMLElement} The element with the "fragment" class that has been made
     * visible and is now checked for CSS fragments.
     * @param {boolean} If the CSS fragment operation should be applied in reverse order
     * (when the fragment is being removed instead of shown), this flag needs to be set to
     * true.
     *
     * @return {void}
     */
    function handleCSSFragments(element, reverse) {

        if( !element.classList.contains('css-fragment') ) {
            return;
        }

        var addClass = element.getAttribute('data-add-class');
        var removeClass = element.getAttribute('data-remove-class');
        var target = element.getAttribute('data-target');

        if( reverse ) {
            var temp = addClass;
            addClass = removeClass;
            removeClass = temp;
        }

        document.querySelectorAll( target )[0].classList.add( addClass );
        document.querySelectorAll( target )[0].classList.remove( removeClass );

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
            // length of that media. Not applicable if the slide
            // is divided up into fragments.
            if( currentSlide.querySelectorAll( '.fragment' ).length === 0 ) {
                toArray( currentSlide.querySelectorAll( 'video, audio' ) ).forEach( function( el ) {
                    if( el.hasAttribute( 'data-autoplay' ) ) {
                        if( autoSlide && el.duration * 1000 > autoSlide ) {
                            autoSlide = ( el.duration * 1000 ) + 1000;
                        }
                    }
                } );
            }

            // Cue the next auto-slide if:
            // - There is an autoSlide value
            // - Auto-sliding isn't paused by the user
            // - The presentation isn't paused
            // - The overview isn't active
            // - The presentation isn't over
            if( autoSlide && !autoSlidePaused && !isPaused() && !isOverview() && ( !Reveal.isLastSlide() || availableFragments().next || config.loop ) ) {
				autoSlideTimeout = setTimeout( function() {
					typeof config.autoSlideMethod === 'function' ? config.autoSlideMethod() : navigateNext();
					cueAutoSlide();
				}, autoSlide );
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
     * The reverse of #navigatePrev().
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

	/**
	 * Checks if the target element prevents the triggering of
	 * swipe navigation.
	 */
	function isSwipePrevented( target ) {

		while( target && typeof target.hasAttribute === 'function' ) {
			if( target.hasAttribute( 'data-prevent-swipe' ) ) return true;
			target = target.parentNode;
		}

		return false;

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
            console.log( 'EVENT keypress: ', {
                keyCode: event.keyCode,
                overlay: dom.overlay,
                event: event,
            });
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
        var slideElement = produceSlideElement( document.activeElement );
        if ( slideElement && ( slideElement.classList.contains( 'past' ) || slideElement.classList.contains( 'future' ) ) ) {
            hasFocus = false;

            // http://stackoverflow.com/questions/6976486/is-there-any-way-in-javascript-to-focus-the-document-content-area

            // Give the document focus
            window.focus();

            // Remove focus from any focused element
            if (document.activeElement) {
                document.activeElement.blur();
            }
            activeElementIsCE = document.activeElement;
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

        // While paused only allow 'resuming' keyboard events:
        // 'b', 'w', '.' or any key specifically mapped to togglePause.
        var resumeKeyCodes = [66, 87, 190, 191];
        var key;

        // Custom key bindings for togglePause should be able to resume
        if( typeof config.keyboard === 'object' ) {
            for( key in config.keyboard ) {
                if( config.keyboard[key] === 'togglePause' ) {
                    resumeKeyCodes.push( parseInt( key, 10 ) );
                }
            }
        }

        if( isPaused() && resumeKeyCodes.indexOf( event.keyCode ) === -1 ) {
            event.preventDefault && event.preventDefault();
            event.stopPropagation && event.stopPropagation();
            return false;
        }

        var triggered = false;

        // 1. User defined key bindings
        if( typeof config.keyboard === 'object' ) {

            for( key in config.keyboard ) {

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
            case 80: 
            case 33: 
                navigatePrev(); break;
                // n, page down
            case 78: 
            case 34: 
                navigateNext(); break;
                // h, left
            case 72: 
            case 37: 
                navigateLeft(); break;
                // l, right
            case 76: 
            case 39: 
                navigateRight(); break;
                // k, up
            case 75: 
            case 38: 
                navigateUp(); break;
                // j, down
            case 74: 
            case 40: 
                navigateDown(); break;
                // home
            case 36: 
                slide( 0, 0, 0 ); break;
                // end
            case 35: 
                slide( Infinity, Infinity, Infinity ); break;
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
            // two-spot, semicolon, b, w, period, Logitech presenter tools 'black screen' button
            case 58: 
            case 59: 
            case 66: 
            case 87:
            case 190: 
            case 191: 
                togglePause(); break;
                // f
            case 70: 
                enterFullscreen(); break;
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

            // 9: nuke the layout cache and re-render.
            case 57:
                // Nuke the slide layout cache: it can contain data that's calculated based on incomplete page loads
                nukeSlideLayoutCache();

                layout();
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
            console.log( 'EVENT keydown: ', {
                keyCode: event.keyCode,
                event: event,
            });
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

		if( isSwipePrevented( event.target ) ) return true;

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

		if( isSwipePrevented( event.target ) ) return true;

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
		else if( UA.match( /android/gi ) ) {
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

        var horizontalSlides = toArray( dom.slides.querySelectorAll( SCOPED_FROM_WRAPPER_HORIZONTAL_SLIDES_SELECTOR ) );

        // The number of past and total slides
        var totalCount = getTotalSlides();
        // 'round' the click position back to slide index
        var slideIndex = Math.floor( 0.5 + ( event.clientX / window.innerWidth /* dom.wrapper.offsetWidth */ ) * (totalCount - 1) );
        if( config.rtl ) {
            slideIndex = totalCount - slideIndex;
        }

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
    function onNavigateLeftClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigateLeft(); 
    }
    function onNavigateRightClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigateRight(); 
    }
    function onNavigateUpClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigateUp(); 
    }
    function onNavigateDownClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigateDown(); 
    }
    function onNavigatePrevClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigatePrev(); 
    }
    function onNavigateNextClicked( event ) { 
        event.preventDefault(); 
        onUserInput( event ); 
        navigateNext(); 
    }

    /**
     * Handler for the window level 'hashchange' event.
     */
    function onWindowHashChange( event ) {

        readURL();

    }

    /**
     * Debounced handler for the window level 'resize' event.
     */
    function onDebouncedWindowResize( event ) {

        resizeDebounceTimer = null;

        nukeSlideLayoutCache();

        layout();

    }

    /**
     * Debouncing handler for the window level 'resize' event.
     */
    function onWindowResize( event ) {

        // 'debounce' the resize event: it can be fired many times while the user resizes her viewport.
        clearTimeout( resizeDebounceTimer );
        resizeDebounceTimer = setTimeout( onDebouncedWindowResize, 100 );

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
            // Not all elements support .blur() - SVGs among them.
            if( typeof document.activeElement.blur === 'function' ) {
                document.activeElement.blur();
            }
            document.body.focus();
        }

    }

    /**
     * Invoked when a slide is clicked and we're in the overview.
     */
    function onOverviewSlideClicked( event ) {

        if( eventsAreBound && isOverview() ) {
            event.preventDefault();

            var element = produceSlideElement( event.target );

            if( element && !element.classList.contains( 'disabled' ) ) {

                deactivateOverview();

                var h = parseInt( element.getAttribute( 'data-index-h' ), 10 ),
                    v = parseInt( element.getAttribute( 'data-index-v' ), 10 );

                slide( h, v );

            }
        }

    }

    /**
     * Handles clicks on links that are set to preview in the
     * iframe overlay.
     */
    function onPreviewLinkClicked( event ) {

        if( event.currentTarget && event.currentTarget.hasAttribute( 'href' ) ) {
            var url = event.currentTarget.getAttribute( 'href' );
            if( url ) {
                showPreview( url );
                event.preventDefault();
            }
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
		this.diameter = 100;
		this.diameter2 = this.diameter / 2;
		this.thickness = 6;

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
		this.canvas.style.width = this.diameter2 + 'px';
		this.canvas.style.height = this.diameter2 + 'px';
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
			radius = ( this.diameter2 ) - this.thickness,
			x = this.diameter2,
			y = this.diameter2,
			iconSize = 28;

        // Ease towards 1
        this.progressOffset += ( 1 - this.progressOffset ) * 0.1;

        var endAngle = ( - Math.PI / 2 ) + ( progress * ( Math.PI * 2 ) );
        var startAngle = ( - Math.PI / 2 ) + ( this.progressOffset * ( Math.PI * 2 ) );

        this.context.save();
        this.context.clearRect( 0, 0, this.diameter, this.diameter );

        // Solid background color
        this.context.beginPath();
		this.context.arc( x, y, radius + 4, 0, Math.PI * 2, false );
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
			this.context.fillRect( 0, 0, iconSize / 2 - 4, iconSize );
			this.context.fillRect( iconSize / 2 + 4, 0, iconSize / 2 - 4, iconSize );
        }
        else {
            this.context.beginPath();
			this.context.translate( 4, 0 );
            this.context.moveTo( 0, 0 );
			this.context.lineTo( iconSize - 4, iconSize / 2 );
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
		VERSION: VERSION,

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

		// Randomizes the order of slides
		shuffle: shuffle,

        // Destroys the layout cache, i.e. causes the slide to layout when it's layout next
        nukeSlideLayoutCache: nukeSlideLayoutCache,

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

		// Returns the speaker notes string for a slide, or null
		getSlideNotes: getSlideNotes,

        // Returns the previous slide element, may be null
        getPreviousSlide: function() {
            return previousSlide;
        },

        // Returns the current slide element
        getCurrentSlide: function() {
            return currentSlide;
        },

        // Returns the current parent slide element (it only delivers when the current slide is a *vertical slide*)
        getCurrentParentSlide: function() {
            return currentParentSlide;
        },

        getComputedSlideSizeInfo: getComputedSlideSize,

        getViewPortSizeInfo: getViewportDimensionsInfo,

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

                query[ i ] = deserialize( decodeURIComponent( value ) );
            }

            return query;
        },

        // Returns true if we're currently on the first slide
        isFirstSlide: function() {
            //var rv = document.querySelector( SLIDES_SELECTOR + '.past' );
            //return !rv;
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

		// Registers a new shortcut to include in the help overlay
		registerKeyboardShortcut: function( key, value ) {
			keyboardShortcuts[key] = value;
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


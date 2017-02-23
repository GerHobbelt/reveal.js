var RequireBaseURL;             // string: path
var RevealConfiguration;        // object or function-returning-an-object

// normalizeDirectory(): function, defined in reveal-global-utilities.js

(function () {
    var libdir = RequireBaseURL || 'lib/_/';

    var d = normalizeDirectory;

    function jslib(path) {
        return d('../js/' + path);
    }
    function plugin(path) {
        return d('../plugins/' + path);
    }

    require.config({
        baseUrl: libdir,
        paths: {
            reveal: d('../../js/reveal'),

            assert: d('../../js/reveal-assert'),

            // libraries required by the plugins:
            zoom: jslib('zoom.js/js/zoom'),
            classList: jslib('classList/classList'),
            verge: jslib('verge/verge'),
            mathjax: jslib('MathJax/MathJax'),

            hilitor: plugin('hilitor/hilitor'),
            highlight: plugin('highlight/dist/highlight-umd'),
            marked: plugin('marked/lib/marked'),
        },
        onCompleteLoadOne: function (e) {
            console.log("RequireJS onCompleteLoadOne: ", e.defQueue, document.readyState, arguments);

            if (NProgress.isStarted()) {
                NProgress.inc();
            }
        },
        // RequireJS BUG?: `callback` is not firing when ALL dependencies have loaded; it is already firing after the first one!
        callback: function() {
            console.log("RequireJS callback: all loaded: ", document.readyState, arguments);
        }
    });


    require(['zoom', 'highlight', 'marked', 'classList', 'verge', 'reveal'],
                function (zoom, highlight, marked, classList, verge, Reveal) {
        // Full list of configuration options available here:
        // https://github.com/hakimel/reveal.js#configuration
        var ourConfig = {
            // width: 960,
            // height: 700,
            controls: true,
            progress: true,
            history: true,
            center: true,
            slideNumber: true,
            timeRemaining: 15,

            theme: Reveal.getQueryHash().theme || 'night', // available themes are in /css/theme
            transition: Reveal.getQueryHash().transition || 'zoom', // default/cube/page/concave/zoom/linear/fade/none

            // Parallax scrolling
            //parallaxBackgroundImage: require.toUrl('assets/reveal-parallax-1.jpg'), // 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
            //parallaxBackgroundSize: '2100px 900px', [parallaxBackgroundSize is OBSOLETED]

            // Optional libraries used to extend on reveal.js
            //
            // More info https://github.com/hakimel/reveal.js#dependencies
            dependencies: [
                // { src: require.toUrl('../js/classList/classList.js'), condition: function() {
                //     return !document.body.classList;
                // } },
                { src: '../../plugin/markdown/marked.js', condition: function() {
                    return !!document.querySelector( '[data-markdown]' );
                } },
                { src: '../../plugin/markdown/markdown.js', condition: function() {
                    return !!document.querySelector( '[data-markdown]' );
                } },
                { src: '../../plugin/highlight/highlight.js', async: true, condition: function() {
                    return !!document.querySelector( 'pre code' );
                }, callback: function() {
                    console.log('highlight plugin callback arguments: ', arguments);
                } },
                { src: '../../plugin/zoom-js/zoom.js', async: true, condition: true },
                { src: '../../plugin/notes/notes.js', async: true, condition: true },
                // { src: '../../plugin/leap/leap.js', async: true },
                { src: '../../plugin/search/search.js', async: true, condition: true }
                // { src: '../../plugin/remotes/remotes.js', async: true }
            ]
        };

        Reveal.initialize(typeof RevealConfiguration === 'function' ?
            RevealConfiguration(ourConfig, Reveal, zoom, highlight, marked, classList, verge) :
            Reveal.extend(ourConfig, RevealConfiguration)
        );

        Reveal.addEventListener( 'ready', function ( info ) {
            console.log("Reveal is READY: ", info, arguments);

            NProgress.done(false, "Done. Ready when you are!");
        } );
    });
})();


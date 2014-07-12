var RequireBaseURL;
var RevealConfiguration;

(function () {
    var libdir = RequireBaseURL || 'lib/_/';

    function d(path) {
        path = /* libdir + */ path;
        console.log('normalizing path: ', path);
        var a = path.split('/');
        for (var i = 1; i < a.length - 1; i++) {
            if (a[i] === '.') {
                a.splice(i, 1);
                i--;
            }
            if (a[i] === '..') {
                for (var j = i - 1; j >= 0; j--) {
                    if (a[j] !== '..') {
                        a.splice(i, 1);
                        a.splice(j, 1);
                        i -= 2;
                        break;
                    }
                }
            }
        }
        // make sure path is still good as 'local' for requireJS:
        // local paths start with `./` or `../`
        if (a[0][0] !== '.') {
            a.unshift('.');
        }
        path = a.join('/');
        console.log('normal path: ', path);
        return path;
    }
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

            // libraries required by the plugins:
            zoom: plugin('zoom/js/zoom'),
            hilitor: plugin('hilitor/hilitor'),
            highlight: plugin('highlight/dist/highlight-umd'),
            marked: plugin('marked/lib/marked'),
            classList: jslib('classList/classList'),

            verge: jslib('verge/verge')
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
})();


require(['zoom', 'highlight', 'marked', 'classList', 'verge', 'reveal'],
            function (zoom, highlight, marked, classList, verge, Reveal) {
    // Full list of configuration options available here:
    // https://github.com/hakimel/reveal.js#configuration
    Reveal.initialize(Reveal.extend({
        // width: 960,
        // height: 700,
        controls: true,
        progress: true,
        history: true,
        center: true,
        slideNumber: true,
        timeRemaining: 15,

        theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
        transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

        // Parallax scrolling
        //parallaxBackgroundImage: 'assets/reveal-parallax-1.jpg', // 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
        //parallaxBackgroundSize: '2100px 900px', [parallaxBackgroundSize is OBSOLETED]

        // Optional libraries used to extend on reveal.js
        dependencies: [
            { src: require.toUrl('../js/classList/classList.js'), condition: function() { 
                return !document.body.classList; 
            } },
            { src: require.toUrl('../../plugin/markdown/markdown.js'), condition: function() { 
                return !!document.querySelector( '[data-markdown]' ); 
            } },
            { src: require.toUrl('../../plugin/highlight/highlight.js'), async: true, condition: function() { 
                return !!document.querySelector( 'pre code' ); 
            }, callback: function() { 
                console.log('highlight plugin callback arguments: ', arguments); 
            } },
            { src: require.toUrl('../../plugin/zoom-js/zoom.js'), async: true, condition: true },
            { src: require.toUrl('../../plugin/notes/notes.js'), async: true, condition: true },
            // { src: require.toUrl('../../plugin/leap/leap.js'), async: true },
            { src: require.toUrl('../../plugin/search/search.js'), async: true, condition: true }
            // { src: require.toUrl('../../plugin/remotes/remotes.js'), async: true }
        ]
    }, RevealConfiguration));

    Reveal.addEventListener( 'ready', function ( info ) {
        console.log("Reveal is READY: ", info, arguments);

        NProgress.done(false, "Done. Ready when you are!");
    } );
});

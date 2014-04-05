
require.config({
    baseUrl: '../../lib/_/',
    paths: {
        reveal: '../../js/reveal',

        // libraries required by the plugins:
        zoom: "../plugins/zoom/js/zoom",
        highlight: "../plugins/highlight/dist/highlight-umd",
        marked: "../plugins/marked/lib/marked",
        classList: '../js/classList/classList',

        verge: '../js/verge/verge'
    }
});


require(['zoom', 'highlight', 'marked', 'classList', 'verge', 'reveal'],
            function (zoom, highlight, marked, classList, verge, Reveal) {
    // Full list of configuration options available here:
    // https://github.com/hakimel/reveal.js#configuration
    Reveal.initialize({
        // width: 960,
        // height: 700,
        controls: true,
        progress: true,
        history: true,
        center: true,
        slideNumber: true,

        theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
        transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

        // Parallax scrolling
        parallaxBackgroundImage: '../../assets/reveal-parallax-1.jpg', // 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
        //parallaxBackgroundSize: '2100px 900px', [parallaxBackgroundSize is OBSOLETED]

        // Optional libraries used to extend on reveal.js
        dependencies: [
            //{ src: '../../lib/js/classList/classList.js', condition: function() { return !document.body.classList; } },
            { src: '../../plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
            { src: '../../plugin/highlight/highlight.js', async: true, callback: function() { if (typeof highlight !== 'undefined') { highlight.initHighlightingOnLoad(); } } },
            { src: '../../plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
            { src: '../../plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } },
            // { src: '../../plugin/leap/leap.js', async: true },
            { src: '../../plugin/search/search.js', async: true, condition: function() { return !!document.body.classList; } }
            // { src: '../../plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } }
        ]
    });
});

var RequireBaseURL;             // string: path
var RevealConfiguration;        // object or function-returning-an-object

var normalizeDirectory;         // function

// local scope for code:
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

    // publish this function so require-reveal-init.js can use it too
    normalizeDirectory = d;

    function rootdir(path) {
        return d('../../' + path);
    }

    //
    // -------------------------------------------------------------------------------
    //

    // ## Printing the page?
    //
    // If the query includes 'print-pdf', include the PDF print sheet

    // media="print"; alternative is 'css/print/paper.css'
    var link = document.createElement( 'link' );
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if( window.location.search.match( /print-pdf/gi ) ) {
        link.href = rootdir('css/print/pdf.css');
        // no media type specified for this one: it applies to both screen and print...
    }
    else {
        link.href = rootdir('css/print/paper.css');
        link.media = 'print';
    }
    document.getElementsByTagName( 'head' )[0].appendChild( link );

    //
    // -------------------------------------------------------------------------------
    //

    // ## Loading the page?
    //
    // The Start/Init Driver: this one assumes only NProgress has been loaded and starts the NProgress-based load animation

    // make the web page (body) visible now that we're showing the NProgress loader: 
    var body = document.getElementsByTagName('body')[0];
    body.style.display = 'block'; // $('body').show();

    var version_el = body.getElementsByClassName('version');
    for (var i = version_el.length; i-- > 0; ) {
      version_el[i].innerHTML = NProgress.version; // $('.version').text(NProgress.version);
    }

    // show the NProgress loader...    
    NProgress.start("Loading the presentation...");

    // invoke this when the load phase is completed (`NProgress.done()`)
    NProgress.settings.onDoneBegin = slow_fade_all_ends_all;

    var timerh = null;

    function tick() {
      // NProgress.inc() will never arrive at 'done' all by itself as it won't push the .status beyond the 0.994 mark.
      //
      // Note: we call 'done' when Reveal has loaded itself and all its plugins, see `js/require-reveal-init.js`
      if (NProgress.isStarted()) {
        NProgress.inc();
        timerh = setTimeout(tick, 200);
      }
    }
    tick();

    function slow_fade_all_ends_all() {
      clearTimeout(timerh);
      timerh = null;

      function slow_fade_one(el, i) {
        setTimeout(function() {
          NProgress.Internals.removeClass(el, 'out');
        }, i * 500);
      }
      var fade_el = body.getElementsByClassName('fade');
      for (var i = fade_el.length; i-- > 0; ) {
        slow_fade_one(fade_el[i], i);
      }
    }
})();


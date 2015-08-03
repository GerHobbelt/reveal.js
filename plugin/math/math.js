/**
 * A plugin which enables rendering of math equations inside
 * of reveal.js slides. Essentially a thin wrapper for MathJax.
 *
 * @author Hakim El Hattab
 */

// Custom reveal.js integration
(function ( window, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    // Expose a factory as module.exports in loaders that implement the Node
    // module pattern (including browserify).
    // This accentuates the need for a real window in the environment
    // e.g. var jQuery = require("jquery")(window);
    module.exports = function( w ) {
      w = w || window;
      if ( !w.document ) {
        throw new Error("Reveal plugin requires a window with a document");
      }
      return factory( w, w.document, require( "reveal" ), require( "mathjax" ) );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define( [ "reveal", "mathjax" ], function(Reveal, MathJax) {
        return factory(window, document, Reveal, MathJax);
      });
    } else {
        // Browser globals
        window.Reveal = factory(window, document, Reveal, MathJax);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, document, Reveal, MathJax, undefined ) {

//TBD

var RevealMath = window.RevealMath || (function(){

    var options = Reveal.getConfig().math || {};
	options.mathjax = options.mathjax || 'https://cdn.mathjax.org/mathjax/latest/MathJax.js';
    options.config = options.config || 'TeX-AMS_HTML-full';

    loadScript( options.mathjax + '?config=' + options.config, function() {

        MathJax.Hub.Config({
            messageStyle: 'none',
            tex2jax: { inlineMath: [['$','$'],['\\(','\\)']] },
            skipStartupTypeset: true
        });

        // Typeset followed by an immediate reveal.js layout since
        // the typesetting process could affect slide height
        MathJax.Hub.Queue( [ 'Typeset', MathJax.Hub ] );
        MathJax.Hub.Queue( Reveal.layout );

        // Reprocess equations in slides when they turn visible
        Reveal.addEventListener( 'slidechanged', function( event ) {

            MathJax.Hub.Queue( [ 'Typeset', MathJax.Hub, event.currentSlide ] );

        } );

    } );

    function loadScript( url, callback ) {

        var head = document.querySelector( 'head' );
        var script = document.createElement( 'script' );
        script.type = 'text/javascript';
        script.src = url;

        // Wrapper for callback to make sure it only fires once
        var finish = function() {
            if( typeof callback === 'function' ) {
                callback.call();
                callback = null;
            }
        }

        script.onload = finish;

        // IE
        script.onreadystatechange = function() {
            if ( this.readyState === 'loaded' ) {
                finish();
            }
        }

        // Normal browsers
        head.appendChild( script );

    }


    return RevealMath;
})();

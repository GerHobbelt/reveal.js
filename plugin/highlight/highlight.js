// START CUSTOM REVEAL.JS INTEGRATION

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
      var hljs = require("highlight");
      return factory( w, w.document, Reveal, hljs );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define( [ "reveal", "highlight" ], function(Reveal, hljs) {
        return factory(window, document, Reveal, hljs);
      });
    } else {
        // Browser globals
        window.Reveal = factory(window, document, Reveal, hljs);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, document, Reveal, highlight, undefined ) {

    if (!Reveal.AddOn) {
        Reveal.AddOn = {};
    }

    Reveal.AddOn.Highlight = {
        tabReplace: "  ",
        lineNodes: true,

        exec: function() {
            var hljs_nodes = document.querySelectorAll( 'pre code' );

            for( var i = 0, len = hljs_nodes.length; i < len; i++ ) {
                var element = hljs_nodes[i];

                Reveal.AddOn.Highlight.highlightMe( element );
            }
        },
        
        highlightMe: function( element ) {
            // trim whitespace if data-trim attribute is present
            if( element.hasAttribute( 'data-trim' ) && typeof element.innerText.trim === 'function' ) {
                element.innerText = element.innerText.trim();
            }

            // Now escape html unless prevented by author
            if( ! element.hasAttribute( 'data-noescape' )) {
                element.innerHTML = element.innerText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            highlight.highlightBlock( element, Reveal.AddOn.Highlight.tabReplace, false, Reveal.AddOn.Highlight.lineNodes );
        }
    };

    function redoHightlightForBlock( event ) {
        Reveal.AddOn.Highlight.highlightMe( event.currentTarget );        
    }

    Reveal.AddOn.Highlight.exec();

    if( typeof window.addEventListener === 'function' ) {
        var hljs_nodes = document.querySelectorAll( 'pre code' );

        for( var i = 0, len = hljs_nodes.length; i < len; i++ ) {
            var element = hljs_nodes[i];

            // re-highlight when focus is lost (for edited code)
            element.addEventListener( 'focusout', redoHightlightForBlock, false );
        }
    }

    return Reveal;
}));
// END CUSTOM REVEAL.JS INTEGRATION

// Requires highlight.js

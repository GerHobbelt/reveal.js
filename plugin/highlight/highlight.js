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

    // Function to perform a better "data-trim" on code snippets
    // Will slice an indentation amount on each line of the snippet (amount based on the line having the lowest indentation length)
    function betterTrim(snippetEl) {
        // Helper functions
        function trimLeft(val) {
            // Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
            return val.replace(/^[\s\uFEFF\xA0]+/g, '');
        }
        function trimLineBreaks(input) {
            var lines = input.split('\n');

            // Trim line-breaks from the beginning
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '') {
                    lines.splice(i--, 1);
                } else break;
            }

            // Trim line-breaks from the end
            for (var i = lines.length-1; i >= 0; i--) {
                if (lines[i].trim() === '') {
                    lines.splice(i, 1);
                } else break;
            }

            return lines.join('\n');
        }

        // Main function for betterTrim()
        return (function(snippetEl) {
            var content = trimLineBreaks(snippetEl.innerText);
            var lines = content.split('\n');
            // Calculate the minimum amount to remove on each line start of the snippet (can be 0)
            var pad = lines.reduce(function(acc, line) {
                if (line.length > 0 && trimLeft(line).length > 0 && acc > line.length - trimLeft(line).length) {
                    return line.length - trimLeft(line).length;
                }
                return acc;
            }, Number.POSITIVE_INFINITY);
            // Slice each line with this amount
            return lines.map(function(line, index) {
                return line.slice(pad);
            })
            .join('\n');
        })(snippetEl);
    }

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
                element.innerText = betterTrim(element);
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

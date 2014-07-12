// provide fallback if official Highlight.js is not available or you don't want to load it for other reasons...

(function ( window, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    // Expose a factory as module.exports in loaders that implement the Node
    // module pattern (including browserify).
    // This accentuates the need for a real window in the environment
    // e.g. var jQuery = require("jquery")(window);
    module.exports = function( w ) {
      w = w || window;
      if ( !w.document ) {
        throw new Error("HighlightJS Dummy Replacement requires a window with a document");
      }
      return factory( w );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define([], function() {
        return factory(window);
      });
    } else {
        // Browser globals
        window.hljs = factory(window);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, undefined ) {

  var hljs = {
    initHighlightingOnLoad: function() {
      console.log("Dummy HighLight.js initializing...");
    },

    highlightBlock: function(a) {
      console.log("Dummy HighLight.js highlightBlock() API invoked.", arguments);
    }
  };

  return hljs;

}));


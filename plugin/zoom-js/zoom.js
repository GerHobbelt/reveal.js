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
      var zoom = require("zoom");
      var Reveal = require("reveal");
      return factory( w, w.document, Reveal, zoom );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define( [ "reveal", "zoom" ], function(Reveal, zoom) {
        return factory(window, document, Reveal, zoom);
      });
    } else {
      // Browser globals
      window.Reveal = factory(window, document, Reveal, zoom);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, document, Reveal, zoom, undefined ) {

  if ( typeof Reveal === 'undefined' ) {
      throw 'The reveal.js library must be loaded first';
  }

  if ( typeof zoom === 'undefined' ) {
      throw 'The zoom.js library must be loaded by/before the reveal-zoom plugin';
  }

  var isEnabled = true;

  var rootElement = document.querySelector( '.reveal .slides' );

  // Inform the zoom tool that the .reveal DIV is the element which should receive the transform.
  zoom.init(rootElement);

  rootElement.addEventListener( 'mousedown', function( event ) {
    var modifier = ( Reveal.getConfig().zoomKey ? Reveal.getConfig().zoomKey : 'alt' ) + 'Key';

    var zoomPadding = 20;
    var revealScale = Reveal.getScale();

    if( event[ modifier ] && isEnabled ) {
      event.preventDefault();

      var bounds;
      var originalDisplay = event.target.style.display;

      // Get the bounding rect of the contents, not the containing box
      if( window.getComputedStyle( event.target ).display === 'block' ) {
        event.target.style.display = 'inline-block';
        bounds = event.target.getBoundingClientRect();
        event.target.style.display = originalDisplay;
      } else {
        bounds = event.target.getBoundingClientRect();
      }

      zoom.to({
        x: ( bounds.left * revealScale ) - zoomPadding,
        y: ( bounds.top * revealScale ) - zoomPadding,
        width: ( bounds.width * revealScale ) + ( zoomPadding * 2 ),
        height: ( bounds.height * revealScale ) + ( zoomPadding * 2 ),
        pan: false
      });
    }
  });

  Reveal.addEventListener( 'overviewshown', function () {
    isEnabled = false;
  } );
  Reveal.addEventListener( 'overviewhidden', function () {
    isEnabled = true;
  } );

  function isZoomEnabled() {
    return isEnabled;
  };

  if (!Reveal.AddOn) {
    Reveal.AddOn = {};
  }

  Reveal.AddOn.Zoom = {
    isEnabled: isZoomEnabled,
    getZoomInstance: function () {
      return zoom;
    }
  };

  return Reveal;
}));


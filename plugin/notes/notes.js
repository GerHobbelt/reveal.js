/**
 * Handles opening of and synchronization with the reveal.js
 * notes window.
 *
 * Handshake process:
 * 1. This window posts 'connect' to notes window
 *    - Includes URL of presentation to show
 * 2. Notes window responds with 'connected' when it is available
 * 3. This window proceeds to send the current presentation state
 *    to the notes window
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
      return factory( w, w.document, require( "reveal" ) );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define( [ "reveal" ], function(Reveal) {
        return factory(window, document, Reveal);
      });
    } else {
        // Browser globals
        window.Reveal = factory(window, document, Reveal);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, document, Reveal, undefined ) {

    function openNotes() {
        var jsFileLocation = document.querySelector('script[src$="notes.js"]').src;  // this js file path
        jsFileLocation = jsFileLocation.replace(/notes\.js(\?.*)?$/, '');   // the js folder path
        var notesPopup = window.open( jsFileLocation + 'notes.html', 'reveal.js - Notes', 'width=1100,height=700' );

        /**
         * Connect to the notes window through a postmessage handshake.
         * Using postmessage enables us to work in situations where the
         * origins differ, such as a presentation being opened from the
         * file system.
         */
        function connect() {
            // Keep trying to connect until we get a 'connected' message back
            var connectInterval = setInterval( function() {
                notesPopup.postMessage( JSON.stringify( {
                    namespace: 'reveal-notes',
                    type: 'connect',
                    url: window.location.protocol + '//' + window.location.host + window.location.pathname,
                    state: Reveal.getState()
                } ), '*' );
            }, 500 );

            window.addEventListener( 'message', function( event ) {
                var data = JSON.parse( event.data );
                if( data && data.namespace === 'reveal-notes' && data.type === 'connected' ) {
                    clearInterval( connectInterval );
                    onConnected();
                }
            } );
        }

        /**
         * Posts the current slide data to the notes window
         */
        function post() {

            var slideElement = Reveal.getCurrentSlide(),
                notesElement = slideElement.querySelector( 'aside.notes' );

            var messageData = {
                namespace: 'reveal-notes',
                type: 'state',
                notes: '',
                markdown: false,
                state: Reveal.getState()
            };

            // Look for notes defined in a slide attribute
            if( slideElement.hasAttribute( 'data-notes' ) ) {
                messageData.notes = slideElement.getAttribute( 'data-notes' );
            }

            // Look for notes defined in an aside element
            if( notesElement ) {
                messageData.notes = notesElement.innerHTML;
                messageData.markdown = typeof notesElement.getAttribute( 'data-markdown' ) === 'string';
            }

            notesPopup.postMessage( JSON.stringify( messageData ), '*' );

        }

        /**
         * Called once we have established a connection to the notes
         * window.
         */
        function onConnected() {

            // Monitor events that trigger a change in state
            Reveal.addEventListener( 'slidechanged', post );
            Reveal.addEventListener( 'fragmentshown', post );
            Reveal.addEventListener( 'fragmenthidden', post );
            Reveal.addEventListener( 'overviewhidden', post );
            Reveal.addEventListener( 'overviewshown', post );
            Reveal.addEventListener( 'paused', post );
            Reveal.addEventListener( 'resumed', post );

            // Post the initial state
            post();

        }

        connect();
    }

	if( !/receiver/i.test( window.location.search ) ) {

		// If the there's a 'notes' query set, open directly
		if( window.location.search.match( /(\?|\&)notes/gi ) !== null ) {
			openNotes();
		}

		// Open the notes when the 's' key is hit
		document.addEventListener( 'keydown', function( event ) {
			// Disregard the event if the target is editable or a
			// modifier is present
			if ( document.querySelector( ':focus' ) !== null || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ) return;

			if( event.keyCode === 83 ) {
				event.preventDefault();
				openNotes();
			}
		}, false );

	}

    if (!Reveal.AddOn) {
        Reveal.AddOn = {};
    }

    Reveal.AddOn.Notes = {
        open: openNotes
    };

    return Reveal;
}));

/*
 * Handles finding a text string anywhere in the slides and showing the next occurrence to the user
 * by navigating to that slide and highlighting it.
 *
 * By Jon Snyder <snyder.jon@gmail.com>, February 2013
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
      return factory( w, w.document, require( "reveal" ), require( "hilitor" ) );
    };
  } else {
    if ( typeof define === "function" && define.amd ) {
      // AMD. Register as a named module.
      define( [ "reveal", "hilitor" ], function(Reveal, Hilitor) {
        return factory(window, document, Reveal, Hilitor);
      });
    } else {
        // Browser globals
        window.Reveal = factory(window, document, Reveal, Hilitor);
    }
  }

// Pass this, window may not be defined yet
}(this, function ( window, document, Reveal, Hilitor, undefined ) {

    var matchedSlides = [];
    var currentMatchedIndex;
    var searchboxDirty;
    var myHilitor;
    var options = {
        isHotKey: function (keyDownEvent, domElementWithFocus, domElementInputValueForSearch) {
            // ignore key event when it's not going to match due to metakey states: 
            if (event.altKey || event.ctrlKey || event.metaKey) { 
                return false;
            }
            var hitQmarkKey = (event.keyCode === 191 && event.shiftKey);   /* shift-/ = '?' key */
            var hitF3Key =    (event.keyCode === 114 && !event.shiftKey);  /* F3 */
            // ignore event when our input field has focus and it's a 'character key' being pressed right now:
            if (domElementWithFocus === domElementInputValueForSearch && hitQmarkKey) {
                return false;
            }
            // otherwise report success when either of the 'shortcuts' is hit:
            return hitQmarkKey || hitF3Key;
        }
    }
    // check if the options were already set up before:
    if (Reveal.AddOn && Reveal.AddOn.Search && Reveal.AddOn.Search.Defaults) {
        getOrSetOptions(Reveal.AddOn.Search.Defaults);      
    }


    // pass no arg or NULL to receive the current options object
    function getOrSetOptions(opts) {
        Reveal.extend(options, opts);
        return options;
    }

    function openSearch() {
        //ensure the search term input field is visible and has focus:
        var inputbox = document.getElementById("searchinput");
        inputbox.style.display = "inline";
        inputbox.focus();
        inputbox.select();
    }

    function closeSearch() {
        //ensure the search term input field is *not* visible:
        var inputbox = document.getElementById("searchinput");
        inputbox.style.display = "none";
    }

    function toggleSearch() {
        var inputbox = document.getElementById("searchinput");
        if (inputbox.style.display !== "inline") {
            openSearch();
        }
        else {
            closeSearch();
            myHilitor.remove();
        }
    }

    function doSearch() {
        var matchingSlides;

        // if there's been a change in the search term, perform a new search:
        if (searchboxDirty) {
            searchboxDirty = false;
            var searchstring = document.getElementById("searchinput").value;

            // find the keyword amongst the slides
            myHilitor = new Hilitor("slidecontent", null, {
                onStart: function () {
                    matchingSlides = [];
                },
                onFinish: function () {
                    return matchingSlides;
                },
                onDoOne: function (node) {
                    // find the slide's section element and save it in our list of matching slides
                    var secnode = node.parentNode;
                    while (secnode.nodeName != 'SECTION') {
                        secnode = secnode.parentNode;
                    }

                    var slideIndex = Reveal.getIndices(secnode);
                    var slidelen = matchingSlides.length;
                    var alreadyAdded = false;
                    for (i = 0; i < slidelen; i++) {
                        if ( (matchingSlides[i].h === slideIndex.h) && (matchingSlides[i].v === slideIndex.v) ) {
                            alreadyAdded = true;
                        }
                    }
                    if (!alreadyAdded) {
                        matchingSlides.push(slideIndex);
                    }
                }
            });
            matchedSlides = myHilitor.apply(searchstring) || [];
            currentMatchedIndex = 0;
        }

        // navigate to the next slide that has the keyword, wrapping to the first if necessary
        if (matchedSlides.length && (matchedSlides.length <= currentMatchedIndex)) {
            currentMatchedIndex = 0;
        }
        if (matchedSlides.length > currentMatchedIndex) {
            Reveal.slide(matchedSlides[currentMatchedIndex].h, matchedSlides[currentMatchedIndex].v);
            currentMatchedIndex++;
        }
    }

    var dom = {};
    dom.wrapper = document.querySelector( '.reveal' );

    if( !dom.wrapper.querySelector( '.searchbox' ) ) {
        var searchElement = document.createElement( 'div' );
        searchElement.classList.add( 'searchbox' );
        searchElement.style.position = 'fixed';
        searchElement.style.top = '10px';
        searchElement.style.left = '10px';
        //embedded base64 search icon Designed by Sketchdock - http://www.sketchdock.com/:
        searchElement.innerHTML = '<span><input type="search" id="searchinput" class="searchinput" style="vertical-align: top;"/><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJiSURBVHjatFZNaxNBGH5md+Mmu92NVdKDRipSAyqCghgQD4L4cRe86UUtAQ+eFCxoa4/25EXBFi8eBE+eRPoDhB6KgiiixdAPCEkx2pjvTXadd9yNsflwuyUDD/O+u8PzzDPvzOwyx3EwyCZhwG3gAkp7MnpjgbopjsltcD4gjuXZZKeAR348MYLYTm3LzOs/y3j3JTfZxgXWXmTuwPHIc4VmoOmv5IrI53+AO2DdHLjkDWQ3GoEEVFXtXQOvkSnPWcyUceviLhwbDYv8/XIVj97kse7TodLvZXxYxrPUHkQ1ufXs3FEdybEIxucySOesoNvUgWU1cP3MkCBfTFdw9fGaAMVmRELq7LBw2Q3/FaAxxWIRpw+ZIr/7IouPqzUBiqmdHAv7EuhRAwf1er2Vy4x1jW3b2d5Jfvu5IPp7l2LYbcgCFFNb+FoJ7oBqEAqFMPNqFcmEgVMJDfMT+1tvN0pNjERlMS6QA5pFOKxiKVPFhakPeL3It+WGJUDxt2wFR+JhzI7v5ctkd8DXOZAkCYYxhO+lKm4+Xfqz/rIixBuNBl7eOYzkQQNzqX249mRl6zUgEcYkaJrGhUwBinVdh6IouPzwE6/DL5w4oLkH8y981aDf+uq6hlKpJESiUdNfDZi7/ehG9K6KfiA3pml0PLcsq+cSMTj2NL9ukc4UOmz7AZ3+crkC4mHujFvXNaMFB3bEr8xPS6p5O+jXxq4VZtaen7/PwzrntjcLUE0iHPS1Ud1cdiEJl/8WivZk0wXd7zWOMkeF8s0CcAmkNrC2nvXZDbbbN73ccYnZoH9bfgswAFzAe9/h3dbKAAAAAElFTkSuQmCC" id="searchbutton" class="searchicon" style="vertical-align: top; margin-top: -1px;"/></span>';
        dom.wrapper.appendChild( searchElement );
    }

    document.getElementById("searchbutton").addEventListener( 'click', function( event ) {
        doSearch();
    }, false );

    document.getElementById("searchinput").addEventListener( 'keyup', function( event ) {
        switch (event.keyCode) {
        case 13:
            event.preventDefault();
            doSearch();
            break;
        default:
            searchboxDirty = true;
            break;
        }
    }, false );

    // Open the search when the '?' of [F3] key is hit, as checked for in isHotKey()
    document.addEventListener( 'keydown', function( event ) {
        // Disregard the event if the target is editable and isn't us:
        var inputbox = document.getElementById("searchinput");
        var focusbox = document.querySelector( ':focus' );
        if ( focusbox !== null && focusbox !== inputbox ) return;

        if( options.isHotKey(event, focusbox, inputbox) ) {
            event.preventDefault();
            openSearch();
        }
    }, false );

    if (!Reveal.AddOn) {
        Reveal.AddOn = {};
    }

    Reveal.AddOn.Search = {
        open: openSearch,
        close: closeSearch,
        toggle: toggleSearch,

        options: getOrSetOptions
    };

    return Reveal;
}));

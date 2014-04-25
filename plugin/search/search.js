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

// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
// 2/2013 jon: modified regex to display any match, not restricted to word boundaries.

function Hilitor(id, tag, options)
{
  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag || "EM";
  var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegex = "";
  var openLeft = true;
  var openRight = true;
  options = options || {};
  if (typeof options.onStart !== 'function') {
    options.onStart = function () { /* return FALSE when you want to abort */ };
  }
  if (typeof options.onFinish !== 'function') {
    options.onFinish = function () { /* What you return here is returned by Hilitor.apply() */ return true; };
  }
  if (typeof options.onDoOne !== 'function') {
    options.onDoOne = function (node) { /* return FALSE when you want to skip the highlighting change for this node */ };
  }

  this.setMatchType = function(type)
  {
    switch(type)
    {
    case "left":
      this.openLeft = false;
      this.openRight = true;
      break;
    case "right":
      this.openLeft = true;
      this.openRight = false;
      break;
    default:
    case "open":
      this.openLeft = this.openRight = true;
      break;
    case "complete":
      this.openLeft = this.openRight = false;
      break;
    }
  };

  this.setRegex = function (input)
  {
    input = input.replace(/^[^\w]+|[^\w]+$/g, "").replace(/[^\w'\-]+/g, "|");
    var re = "(" + input + ")";
    if(!this.openLeft) re = "\\b" + re;
    if(!this.openRight) re = re + "\\b";
    matchRegex = new RegExp(re, "i");
  };

  this.getRegex = function ()
  {
    var retval = matchRegex.toString();
    retval = retval.replace(/^\/\\b\(|\)\\b\/i$/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function (node)
  {
    var i;

    if(!node)
        return;
    if(!matchRegex)
        return;
    if(skipTags.test(node.nodeName))
        return;

    if(node.hasChildNodes()) {
      for(i = 0; i < node.childNodes.length; i++) {
        this.hiliteWords(node.childNodes[i]);
      }
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        if (false !== options.onDoOne.call(this, node)) {
          if(!wordColor[regs[0].toLowerCase()]) {
            wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
          }

          var match = document.createElement(hiliteTag);
          match.appendChild(document.createTextNode(regs[0]));
          match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
          match.style.fontStyle = "inherit";
          match.style.color = "#000";

          var after = node.splitText(regs.index);
          after.nodeValue = after.nodeValue.substring(regs[0].length);
          node.parentNode.insertBefore(match, after);
        }
      }
    }
  };

  // remove highlighting
  this.remove = function ()
  {
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      el.parentNode.replaceChild(el.firstChild, el);
    }
  };

  // start highlighting at target node
  this.apply = function (input)
  {
    // always remove all highlight markers which have been done previously
    this.remove();
    if(!input) {
      return false;
    }
    this.setRegex(input);
    var rv = options.onStart.call(this);
    if (rv === false) {
      return rv;
    }
    this.hiliteWords(targetNode);
    return options.onFinish.call(this);
  };

}

    function openSearch() {
        //ensure the search term input dialog is visible and has focus:
        var inputbox = document.getElementById("searchinput");
        inputbox.style.display = "inline";
        inputbox.focus();
        inputbox.select();
    }

    function toggleSearch() {
        var inputbox = document.getElementById("searchinput");
        if (inputbox.style.display !== "inline") {
            openSearch();
        }
        else {
            inputbox.style.display = "none";
            myHilitor.remove();
        }
    }

    function doSearch() {
        var matchingSlides;
	
        // if there's been a change in the search term, perform a new search:
        if (searchboxDirty) {
            var searchstring = document.getElementById("searchinput").value;

            // find the keyword amongst the slides
            myHilitor = new Hilitor("slidecontent", {
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
        searchElement.id = "searchinputdiv";
        searchElement.classList.add( 'searchdiv' );
        searchElement.style.position = 'absolute';
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
            searchboxDirty = false;
            break;
        default:
            searchboxDirty = true;
            break;
        }
    }, false );

    // Open the search when the 's' key is hit (yes, this conflicts with the notes plugin, disabling for now)
    /*
    document.addEventListener( 'keydown', function( event ) {
        // Disregard the event if the target is editable or a
        // modifier is present
        if ( document.querySelector( ':focus' ) !== null || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ) return;

        if( event.keyCode === 83 ) {
            event.preventDefault();
            openSearch();
        }
    }, false );
    */

    if (!Reveal.AddOn) {
        Reveal.AddOn = {};
    }

    Reveal.AddOn.Search = { 
        open: openSearch 
    };

    return Reveal;
}));

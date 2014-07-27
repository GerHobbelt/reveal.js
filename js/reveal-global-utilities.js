/**
 * These utility functions should be available already *before* the Reveal module itself is loaded.
 *
 * They provide some generic functions for working with URIs and paths, which are very probably 
 * also useful for Reveal user code, next to the Reveal boot code itself.
 *
 * -----------------------------------------------------------------------
 */


/**
 * Normalize the given URI path: fold any '../' and './' parts in there 
 * to turn this into a legal URI path.
 */
function normalizeDirectory(path) {
    "use strict";
    
    //path = libdir + path;
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


/**
 * Minimally encode content to URI compliant format a la encodeURIComponent.
 *
 * While this output is also considered 'safe enough for the URI hash component' 
 * it is far more human readable than the strict encodeURIComponent() output.
 */
function encodeURIComponentMinimally(str) {
    // prepare the lookup table:
    if (!encodeURIComponentMinimally.lookup) {
        var lus = '%20%22%24%2C%2F%3A%3C%3E%3F%40%5B%5D%5E%60%7B%7C';
        var lud = decodeURIComponent(lus);
        lus = lus.split('%');
        lus.shift();
        lud = lud.split('');
        var t = encodeURIComponentMinimally.lookup = {
            regex: new RegExp('%(?:' + lus.join('|') + ')', 'gi'),
            replacer: function (match) {
                return encodeURIComponentMinimally.lookup[match];
            }
        };
        for (var i = 0, len = lus.length; i < len; i++) {
            t['%' + lus[i]] = lud[i];
        }
    }

    // Encode the input in the usual way
    str = encodeURIComponent(str);
    // and partially *revert* the encoding process next.
    return str.replace(encodeURIComponentMinimally.lookup.regex, encodeURIComponentMinimally.lookup.replacer);
}
// Test vector for the above:
// ```
//    var x = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
//    var y = encodeURIComponentMinimally(x);
//        --> " !\"%23$%25%26'()*%2B-./0123456789:%3B<%3D>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[%5C]^_`abcdefghijklmnopqrstuvwxyz{|}%7D%7F"
//    encodeURIComponentMinimally.lookup
//        --> Object {regex: /%(?:20|22|24|2C|2F|3A|3C|3E|3F|40|5B|5D|5E|60|7B|7C)/g, replacer: function, %20: " ", %22: "\"", %24: "$"…}
//    var z = decodeURIComponent(y);
//        --> " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
// ```

/**
 * decodeURIComponent() crashes when being fed illegal input; this function instead simply returns NULL.
 */
function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return null;
    }
}


/**
 * Decode the URI path, query and hash parts into a parameter lookup tree.
 *
 * Note that the returned object is READONLY as it is a reference to the decoded Location (https://developer.mozilla.org/en-US/docs/Web/API/Location) 
 * object cached internally, which is only updated/processed again when the location changes, i.e. when the location.hash is altered by some other
 * part of the application. 
 */ 
function URIparameters() {
    "use strict";

    var location = window.location;

    // check the cache:
    var cache = URIparameters.cache;
    if (cache && cache.href === location.href) {
        return cache;
    }

    var rv = URIparameters.cache = {
        hash_raw:   (location.hash || '').replace(/^#/, ''),                       // "#/24"
        username:   location.username,                    // "xxx"
        password:   location.password,                    // "yyy"
        hostname:   location.hostname,                    // "visyond.lan"
        href:       location.href,                        // "http://xxx:yyy@visyond.lan:8080/lib/reveal.js/?transition=concave#/24"
        pathname:   location.pathname,                    // "/lib/reveal.js/"
        port:       parseInt((location.port || '').replace(/^:/, ''), 10) || 80,   // ":8080"
        protocol:   location.protocol,                    // "http:"
        query_raw:  (location.search || '').replace(/^\?/, ''),                    // "?transition=concave"

        query: {},
        hash:  {}     
    };

    function assign(group, id, value) {
        if (!id && id !== 0) {
            // ignore illegal ids
            console.log('ERROR: ignoring illegal ID in query or hash part of the URI');
        } else if (value == null) {
            // ignore illegal values
            console.log('ERROR: ignoring illegal VALUE in query or hash part of the URI');
        } else if (group[id] != null) {
            // do not overwrite existing entries
            console.log('WARNING: attempt to overwrite id "' + id + '" canceled. (value = "' + value + '")');
        } else {
            group[id] = value;
        }
    }

    /* @const */ var DEC = safeDecodeURIComponent;
    /* @const */ var ENC = encodeURIComponentMinimally;

    if (rv.query_raw) {
        var qa = rv.query_raw.split('&');
        qa.forEach(function (item, i) {
            var pair = item.split('=');
            assign(rv.query, DEC(pair[0]), pair.length > 1 ? DEC(pair[1]) : true);
        });
    }

    var has_route = false;
    if (rv.hash_raw) {
        var ha = rv.hash_raw.split(';');
        var no_val_counter = 0;
        ha.forEach(function (item, i) {
            var pair;
            // special handling for Reveal slide routes, a.k.a. current slide coordinates:
            if (!has_route && item[0] === '/') {
                pair = ['route', item];
                has_route = true;
            } else { 
                pair = item.split('=');
            }
            // special handling for non-'a=b'-type hash parameters:
            if (pair.length === 1) {
                var id = DEC(pair[0]);
                if (id === null) return;            // skip when we hit an illegal entry

                assign(rv.hash, no_val_counter++, id);

                // and when the parameter is a legal identifier, treat it similar to the query string identifiers with values: set its value to TRUE.
                if (id.match(/^[a-z]+[a-z0-9_]*$/)) {
                    assign(rv.hash, id, true);
                }
            } else {
                assign(rv.hash, DEC(pair[0]), DEC(pair[1]));
            }
        });
    }
    
    // Update the URI hash and URI history
    //
    // `argset` is an object containing the hash parameters which must be updated
    //
    // Notes from impress.js:
    //
    // > `#/step-id` is used instead of `#step-id` to prevent default browser
    // > scrolling to element in hash.
    // >
    // > And it has to be set after animation finishes, because in Chrome it
    // > makes transition laggy.
    // >
    // > BUG: http://code.google.com/p/chromium/issues/detail?id=62820
    rv.updateHash = function(argset) {
        argset = argset || {};
        var store = URIparameters();
        var id;
        var ha = store.hash;

        for (id in argset) {
            if (argset.hasOwnProperty(id)) {
                ha[id] = argset[id];
            }
        }

        // reconstruct the hash and update it when we observe a change:
        var newhash = [ENC(ha['route'])];
        var newhash2 = [];
        var skiplist = ['route'];
        for (id in ha) {
            if (ha.hasOwnProperty(id) && skiplist.indexOf(id) === -1) {
                var value = ha[id];
                // ignore the entry when its value is NULL: that means the entry has been 'deleted':
                if (value == null) {
                    continue;
                }
                // mirror the decoder in behaviour:
                if (value === true) { 
                    newhash2.push(ENC(id));
                    skiplist.push(id);
                } else if (id == +id) {             // == instead of === because we're comparing string to number
                    newhash2.push(ENC(value));
                    skiplist.push(value);
                } else {
                    newhash.push(ENC(id) + '=' + ENC(value));
                }
            }
        }
        // place the non-pair arguments last in the hash, i.e. the format is: `#route;argIDx=val;argIDy=val...;arg0;arg1;arg2...`
        var newhash = newhash.concat(newhash2).join(';');
        if (newhash !== store.hash_raw) {
            store.hash_raw = newhash;
            // Now the cache has already been updated, so all that's left is to update the browser URI (#hash) itself:
            window.location.hash = '#' + newhash; 
        }
        return store;
    };

    return rv;
}

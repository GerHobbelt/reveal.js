
// Note: jQuery appears to have their own assert(), but that one is located in their own private scope so we're fine.

// Note: assert()ions do NOT jump into the debugger but signal failure through throwing an exception 
// when they happen to be triggered inside a Jasmine Test Suite run:
//
//var unit_tests_exec_state;              // 1: running, 2: completed, 3: never executed and never will (just another kind of 'completed')


(function ( window, factory ) {

    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        // Expose a factory as module.exports in loaders that implement the Node
        // module pattern (including browserify).
        // This accentuates the need for a real window in the environment
        // e.g. var jQuery = require('jquery')(window);
        module.exports = function( w ) {
            w = w || window;
            return factory( w );
        };
    } else {
        if ( typeof define === 'function' && define.amd ) {
            // AMD. Register as a named module.
            define( [], function () {
                return factory( window );
            });
        } else {
            // Browser globals
            window.assert = factory( window );
        }
    }

// Pass this, window may not be defined yet
}(this, function ( window, undefined ) {

    'use strict';


function assert(expr, msg) {
    if (!expr) {
        msg = Array.prototype.slice.call(arguments, 1).join(' ').trim();
        if (console) {
            if (console.error) {
                console.error('@@@@@@ assertion failed: ', arguments, (msg || ''));
            } else if (console.log) {
                console.log('@@@@@@ assertion failed: ', arguments, (msg || ''));
            }
        }
        if (window.unit_tests_exec_state === 1) {
            throw new Error('ASSERTION failed' + (msg ? ': ' + msg : ''));
        } else if (window.invoke_debugger !== false) {
            debugger;
        }
    }
    return !!expr;
}

// OKAY when the type of `item` is undefined/null/boolean/number/string, i.e. anything that is not an object/array
function assertPrimitiveType(item) {
    return assert(typeof item !== 'object');
}

assert.primitiveType = assertPrimitiveType;

    return assert;
}));

/**
 * Init wrapper for the core module.
 * @param {Object} The Object that the library gets attached to in library.init.js. If the library was not loaded with an AMD loader such as require.js, this is the global Object.
 */
function initVlilleCore(context) {
    'use strict';

    /**
     * @constructor
     * @param  {Object} opt_config [description]
     * @return {Object}            [description]
     */
    var vlille = function (opt_config) {
        opt_config = opt_config || {};

        return this;
    };

    context.vlille = vlille;



}

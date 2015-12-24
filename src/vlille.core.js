/**
 * Init wrapper for the core module.
 * @param {Object} The Object that the library gets attached to in library.init.js. If the library was not loaded with an AMD loader such as require.js, this is the global Object.
 */
function initLibraryCore(context) {
    'use strict';

    /**
     * @constructor
     * @param  {[type]} opt_config [description]
     * @return {[type]}            [description]
     */
    var vlille = function (opt_config) {
        opt_config = opt_config || {};

        return this;
    };

    context.Vlille = vlille;



}

/*global initVlilleCore, initVlilleAjax, initVlilleMath*/
var initVlille = function (context) {
    'use strict';

    initVlilleCore(context);
    initVlilleAjax(context);
    initVlilleMath(context);

    return context.vlille;
};


if (typeof define === 'function' && define.amd) {
    // Expose vlille as an AMD module if it's loaded with RequireJS or
    // similar.
    define(function () {
        return initVlille({});
    });
} else {
    // Load vlille normally (creating a vlille global) if not using an AMD
    // loader.
    initVlille(this);
}

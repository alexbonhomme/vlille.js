/*global initVlilleCore, initVlilleAjax, initVlilleMath, initVlillePromise*/
var initVlille = function (context) {
    'use strict';

    initVlilleCore(context);
    initVlilleAjax(context);
    initVlilleMath(context);
    initVlillePromise(context);

    return context.vlille;
};


if (typeof define === 'function' && define.amd) {
    // Expose vlille as an AMD module if it's loaded with RequireJS or
    // similar.
    define(function () {
        'use strict';

        return initVlille({});
    });
} else {
    // Load vlille normally (creating a vlille global) if not using an AMD
    // loader.
    initVlille(this);
}

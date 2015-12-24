/*! vlille.js - v0.2.0 - 2015-12-24 - Alexandre Bonhomme */
;(function (global) {

var API_PROXY_BASE = 'http://localhost:8001/';

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

    /**
     * Privates
     */

    /**
     *
     * @param  {Document} xml [description]
     * @return {Object}       [description]
     */
    function xmlStationsToJson(xml) {
        var i,
            j,
            len,
            len2,
            markers = xml.childNodes[0].children || [],
            attributes,
            jsonMarker,
            jsonArray = [];

        // imperative way
        for (i = 0, len = markers.length; i < len; i += 1) {
            jsonMarker = {};
            attributes = markers[i].attributes;

            for (j = 0, len2 = attributes.length; j < len2; j += 1) {
                jsonMarker[attributes[j].name] = attributes[j].value;
            }

            jsonArray.push(jsonMarker);
        }

        return jsonArray;
    }

    /**
     *
     * @param  {Document} xmlNode [description]
     * @return {Object}           [description]
     */
    function xmlStationToJson(xml) {
        var i,
            len,
            stationData = xml.childNodes[0].children || [],
            jsonStation = {};

        for (i = 0, len = stationData.length; i < len; i += 1) {
            jsonStation[stationData[i].nodeName] = stationData[i].innerHTML;
        }

        return jsonStation;
    }

    /**
     * Publics
     */

    /**
     * Gets full stations list.
     * @return {Promise} [description]
     */
    vlille.stations = function () {
        return vlille.requestXML(API_PROXY_BASE + 'xml-stations.aspx', null).then(function (xml) {
            return xmlStationsToJson(xml);
        });
    };

    /**
     * Gets informations about the station whit the given `id`.
     * @param  {String} id [description]
     * @return {Promise}   [description]
     */
    vlille.station = function (id) {
        var params = {
            borne: id
        };

        return vlille.requestXML(API_PROXY_BASE + 'xml-station.aspx', params).then(function (xml) {
            return xmlStationToJson(xml);
        });
    };

    /**
     * Gets closest stations using Haversine formula.
     * The second parameter `max` (default value = 3) allow one to configure the maximum number of results.
     * @param  {Object} coord [description]
     * @param  {Int} max      [description]
     * @return {Promise}      [description]
     */
    vlille.closestStations = function (coords, max) {
        if (max === undefined) {
            max = 3;
        }

        return vlille.stations().then(function (stations) {
            var closetStations = stations
                // computes distances
                .map(function (station) {
                    var stationCoords = {
                        lat: parseFloat(station.lat),
                        lon: parseFloat(station.lng)
                    };

                    station.distance = vlille.haversineDistance(coords, stationCoords);

                    return station;
                })
                // sort by distance
                .sort(function (a, b) {
                    return a.distance - b.distance;
                });

            if (closetStations.length > max) {
                closetStations.length = max;
            }

            return closetStations;
        });
    };
}

function initVlilleAjax(context) {
    'use strict';

    var vlille = context.vlille;

    /**
     * Format params object to url query args string.
     * @param  {Object} params [description]
     * @return {String}        [description]
     */
    function formatParams(params) {
        var key,
            query = [];

        for (key in params) {
            if (params.hasOwnProperty(key)) {
                query.push(key + '=' + params[key]);
            }
        }

        return query.join('&');
    }


    /**
     * Basic XHR request implementation.
     * @param  {String}  url    [description]
     * @param  {Object}  params [description]
     * @return {Promise}        [description]
     */
    vlille.requestXML = function (url, params) {
        return new vlille.Promise(function (resolve, reject) {
            var requestObj = new window.XMLHttpRequest(),
                urlWithParams = url;

            if (params) {
                urlWithParams += '?' + formatParams(params);
            }


            requestObj.open('GET', urlWithParams);

            requestObj.addEventListener('load', function (event) {
                var target = event.target;

                if (target.status === 200) {
                    resolve(target.responseXML);
                } else {
                    reject(target);
                }
            });

            requestObj.addEventListener('error', function (event) {
                reject(new Error(event));
            });

            requestObj.send();
        });
    };
}
function initVlilleMath(context) {
    'use strict';

    var vlille = context.vlille;

    /**
     * @return {Number} Radians value of the number.
     */
    Number.prototype.toRadians = function () {
        return this * Math.PI / 180;
    };

    /**
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     * @param  {Object} coord1 [description]
     * @param  {Object} coord2 [description]
     * @return {Number}        [description]
     */
    vlille.haversineDistance = function (coord1, coord2) {
        var R = 6371000, // meters
            phi1,
            phi2,
            deltaPhi,
            deltaLambda,
            a,
            c;

        phi1 = coord1.lat.toRadians();
        phi2 = coord2.lat.toRadians();
        deltaPhi = (coord2.lat - coord1.lat).toRadians();
        deltaLambda = (coord2.lon - coord1.lon).toRadians();

        a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };
}

/**
 * Basic implementation of Promise.
 * @see http://stackoverflow.com/questions/23772801/basic-javascript-promise-implementation-attempt/23785244#23785244
 * @see https://www.promisejs.org/implementing/
 */
function initVlillePromise(context) {
    'use strict';

    var vlille = context.vlille,

        PENDING = 0,
        FULFILLED = 1,
        REJECTED = 2;

    /**
     * Check if a value is a Promise and, if it is,
     * return the `then` method of that promise.
     *
     * @param {Promise|Any} value
     * @return {Function|Null}
     */
    function getThen(value) {
        var t = typeof value;

        if (value && (t === 'object' || t === 'function')) {
            var then = value.then;

            if (typeof then === 'function') {
                return then;
            }
        }

        return null;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     *
     * @param {Function} fn A resolver function that may not be trusted
     * @param {Function} onFulfilled
     * @param {Function} onRejected
     */
    function doResolve(fn, onFulfilled, onRejected) {
        var done = false;

        try {
            fn(function (value) {
                if (done) {
                    return;
                }

                done = true;
                onFulfilled(value);
            }, function (reason) {
                if (done) {
                    return;
                }

                done = true;
                onRejected(reason);
            });
        } catch (e) {
            if (done) {
                return;
            }

            done = true;
            onRejected(e);
        }
    }

    /**
     * @constructor
     * @param {Function} fn [description]
     */
    function Promise(fn) {
        if (typeof this !== 'object') {
            throw new TypeError('Promises must be constructed via new');
        }

        if (typeof fn !== 'function') {
            throw new TypeError('fn must be a function');
        }

        var state = PENDING, // store state which can be PENDING, FULFILLED or REJECTED

            value = null, // store value once FULFILLED or REJECTED

            handlers = []; // store sucess & failure handlers

        function fulfill(result) {
            state = FULFILLED;
            value = result;

            handlers.forEach(handle);
            handlers = null;
        }

        function reject(error) {
            state = REJECTED;
            value = error;

            handlers.forEach(handle);
            handlers = null;
        }

        function resolve(result) {
            try {
                var then = getThen(result);

                if (then) {
                    doResolve(then.bind(result), resolve, reject);

                    return;
                }

                fulfill(result);
            } catch (e) {
                reject(e);
            }
        }

        function handle(handler) {
            if (state === PENDING) {
                handlers.push(handler);
            } else {
                if (state === FULFILLED && typeof handler.onFulfilled === 'function') {
                    handler.onFulfilled(value);
                }

                if (state === REJECTED && typeof handler.onRejected === 'function') {
                    handler.onRejected(value);
                }
            }
        }

        /**
         *
         * @param  {Function}   onFulfilled [description]
         * @param  {Function}   onRejected  [description]
         */
        this.done = function (onFulfilled, onRejected) {
            // ensure we are always asynchronous
            setTimeout(function () {
                handle({
                    onFulfilled: onFulfilled,
                    onRejected: onRejected
                });
            }, 0);
        };

        /**
         *
         * @param  {Function} onFulfilled [description]
         * @param  {Function} onRejected  [description]
         * @return {Promise}              [description]
         */
        this.then = function (onFulfilled, onRejected) {
            var self = this;

            return new Promise(function (resolve, reject) {
                return self.done(function (result) {
                    if (typeof onFulfilled === 'function') {
                        try {
                            return resolve(onFulfilled(result));
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        return resolve(result);
                    }
                }, function (error) {
                    if (typeof onRejected === 'function') {
                        try {
                            return resolve(onRejected(error));
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        return reject(error);
                    }
                });
            });
        };


        doResolve(fn, resolve, reject);
    }

    vlille.Promise = Promise;
}
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

} (this));

/*! vlille.js - v0.1.0 - 2015-12-24 - Alexandre Bonhomme */
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
     * @return {Function} [description]
     */
    vlille.stations = function () {
        return {
            then: function (resolve, reject) {
                var xmlResolve = function (xml) {
                    resolve(xmlStationsToJson(xml));
                };

                vlille.requestXML(API_PROXY_BASE + 'xml-stations.aspx', null, xmlResolve, reject);
            }
        };
    };

    /**
     * Gets informations about the station whit the given `id`.
     * @param  {String} id [description]
     * @return {Function}  [description]
     */
    vlille.station = function (id) {
        var params = {
            borne: id
        };

        return {
            then: function (resolve, reject) {
                var xmlResolve = function (xml) {
                    resolve(xmlStationToJson(xml));
                };

                vlille.requestXML(API_PROXY_BASE + 'xml-station.aspx', params, xmlResolve, reject);
            }
        };
    };

    /**
     * Gets closest stations using Haversine formula.
     * The second parameter `max` (default value = 3) allow one to configure the maximum number of results.
     * @param  {Object} coord [description]
     * @param  {Int} max      [description]
     * @return {Function}     [description]
     */
    vlille.losestStations = function (coords, max) {
        if (max === undefined) {
            max = 3;
        }

        function then(resolve, reject) {
            vlille.stations().then(function (stations) {
                var closetStations = stations
                    .map(function (station) {
                        var stationCoords = {
                            lat: parseFloat(station.lat),
                            lon: parseFloat(station.lng)
                        };

                        station.distance = vlille.haversineDistance(coords, stationCoords);

                        return station;
                    })
                    .sort(function (a, b) {
                        return a.distance - b.distance;
                    });

                if (closetStations.length > max) {
                    closetStations.length = max;
                }

                resolve(closetStations);
            }, reject);
        }

        return {
            then: then
        };
    };
}

/*jslint browser:true*/
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
     * @param  {String}   url     [description]
     * @param  {Object}   params  [description]
     * @param  {Function} resolve [description]
     * @param  {Function} reject  [description]
     */
    vlille.requestXML = function (url, params, resolve, reject) {
        var requestObj = new XMLHttpRequest(),
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

} (this));

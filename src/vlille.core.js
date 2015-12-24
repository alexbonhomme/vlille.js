/*global API_PROXY_BASE*/

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

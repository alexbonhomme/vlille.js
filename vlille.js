/*jslint browser:true*/

var vlille = (function () {
    'use strict';

    var API_PROXY_BASE = 'http://localhost:8001/';

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
    function requestXML(url, params, resolve, reject) {
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
    }

    /**
     * Publics
     */

    /**
     * Gets informations about the station whit the given `id`.
     * @param  {String} id [description]
     * @return {Function}  [description]
     */
    function getStation(id) {
        var params = {
            borne: id
        };

        return {
            then: function (resolve, reject) {
                var xmlResolve = function (xml) {
                    resolve(xmlStationToJson(xml));
                };

                requestXML(API_PROXY_BASE + 'xml-station.aspx', params, xmlResolve, reject);
            }
        };
    }

    /**
     * Gets full stations list.
     * @return {Function} [description]
     */
    function getStations() {
        return {
            then: function (resolve, reject) {
                var xmlResolve = function (xml) {
                    resolve(xmlStationsToJson(xml));
                };

                requestXML(API_PROXY_BASE + 'xml-stations.aspx', null, xmlResolve, reject);
            }
        };
    }

    return {
        stations: getStations,
        station: getStation
    };
}());
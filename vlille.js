/*jslint browser:true*/

var vlille = (function () {
    'use strict';

    var API_PROXY_BASE = 'http://localhost:8001/';

    /**
     *
     * @param  {String} xml [description]
     * @return {Object}     [description]
     */
    function xmlToJson(xmlNode) {
        var i,
            j,
            len,
            len2,
            markers = xmlNode.childNodes[0].children || [],
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

        // functionnal way
        // markers = [].slice.call(markers);
        // jsonArray = markers.map(function (marker) {
        //     var attributes = [].slice.call(marker.attributes);

        //     return attributes.reduce(function (prevAttr, currentAttr) {
        //         prevAttr[currentAttr.name] = currentAttr.value;

        //         return prevAttr;
        //     }, {});
        // });

        return jsonArray;
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
    function request(url, params, resolve, reject) {
        var requestObj = new XMLHttpRequest(),
            urlWithParams = url;

        if (params) {
            urlWithParams += '?' + formatParams(params);
        }

        requestObj.open('GET', urlWithParams);

        requestObj.addEventListener('load', function (event) {
            var target = event.target;

            if (target.status === 200) {
                resolve(xmlToJson(target.responseXML));
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

    function getStation(id) {
        var params = {
            borne: id
        };

        return {
            then: function (resolve, reject) {
                request(API_PROXY_BASE + 'xml-stations.aspx', params, resolve, reject);
            }
        };
    }

    function getStations() {
        return {
            then: function (resolve, reject) {
                request(API_PROXY_BASE + 'xml-stations.aspx', null, resolve, reject);
            }
        };
    }

    return {
        stations: getStations,
        station: getStation
    };
}());
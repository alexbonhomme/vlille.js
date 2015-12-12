/*jslint browser:true*/

var vlille = (function () {
    'use strict';

    var API_PROXY_BASE = 'http://localhost:8001/';

    /**
     *
     * @param  {String} xml [description]
     * @return {Object}     [description]
     */
    function xmlToJson(xml) {
        //TODO
        return xml;
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
                resolve(xmlToJson(target.response));
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
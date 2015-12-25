function initVlilleAjax(context) {
    'use strict';

    var Vlille = context.Vlille;

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
    Vlille.requestXML = function (url, params) {
        return new Vlille.Promise(function (resolve, reject) {
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
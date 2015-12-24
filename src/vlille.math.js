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

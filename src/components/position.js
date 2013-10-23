var CES = require('ces');

var Component = CES.Component.extend({
    name: 'position',
    init: function (x, y, z, zone) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        // important 4th dimension :D
        this.zone = zone || 1;
    }
});

module.exports = Component;
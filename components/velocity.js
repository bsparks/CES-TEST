var CES = require('ces');

var Component = CES.Component.extend({
    name: 'velocity',
    init: function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
});

module.exports = Component;
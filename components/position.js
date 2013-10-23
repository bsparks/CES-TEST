var CES = require('ces');

var Component = CES.Component.extend({
    name: 'position',
    init: function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
});

module.exports = Component;
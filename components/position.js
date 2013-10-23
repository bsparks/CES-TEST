var CES = require('ces');

var Component = CES.Component.extend({
    name: 'position',
    init: function (x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
});

module.exports = Component;
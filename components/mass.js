var CES = require('ces');

var Component = CES.Component.extend({
    name: 'mass',
    init: function (mass) {
        this.mass = mass || 0;
    }
});

module.exports = Component;
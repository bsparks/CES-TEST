var CES = require('ces');

var Component = CES.Component.extend({
    name: 'speed',
    init: function (speed) {
        this.speed = speed || 0;
    }
});

module.exports = Component;
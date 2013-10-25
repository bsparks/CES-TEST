var CES = require('ces');

var Component = CES.Component.extend({
    name: 'geometry',
    init: function (geometry) {
        this.geometry = geometry;
    }
});

module.exports = Component;
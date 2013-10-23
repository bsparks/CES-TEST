var CES = require('ces');

var Component = CES.Component.extend({
    name: 'path',
    init: function (points) {
        this.points = points; // array
    }
});

module.exports = Component;
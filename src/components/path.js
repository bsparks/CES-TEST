var CES = require('ces');

var Component = CES.Component.extend({
    name: 'path',
    init: function (points) {
        this.points = points || [];
    }
});

module.exports = Component;
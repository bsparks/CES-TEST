var CES = require('ces');

var Component = CES.Component.extend({
    name: 'texture',
    init: function (path) {
        this.path = path;
        this.texture = null; // until loaded!
    }
});

module.exports = Component;
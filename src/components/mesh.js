var CES = require('ces');

var Component = CES.Component.extend({
    name: 'mesh',
    init: function (mesh) {
        this.mesh = mesh;
    }
});

module.exports = Component;
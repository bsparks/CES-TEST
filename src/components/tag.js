var CES = require('ces');

var Component = CES.Component.extend({
    name: 'tag',
    init: function (value) {
        this.tag = value || 'no name';
    }
});

module.exports = Component;
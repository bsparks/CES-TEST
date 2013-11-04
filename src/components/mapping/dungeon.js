var CES = require('ces');

var Component = CES.Component.extend({
    name: 'mapping/dungeon',
    init: function() {
        this.rooms = [];
        this.corridors = [];
    }
});

module.exports = Component;

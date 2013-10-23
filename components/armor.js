var CES = require('ces');

var Component = CES.Component.extend({
    name: 'armor',
    init: function (value) {
        this.maxArmor = this.armor = value || 0;
    },
    add: function (amount) {
        this.armor += amount;
        if(this.armor > this.maxArmor) {
            this.armor = this.maxArmor;
        }
    }
});

module.exports = Component;
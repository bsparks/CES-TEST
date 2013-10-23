var CES = require('ces');

var Component = CES.Component.extend({
    name: 'health',
    init: function (value) {
        this.maxHealth = this.health = value || 0;
    },
    isDead: function () {
        return this.health <= 0;
    },
    add: function (amount) {
        this.health += amount;
        if(this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
});

module.exports = Component;
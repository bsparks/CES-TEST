// physics system
var CES = require('ces');

var System = CES.System.extend({
    update: function (dt) {
        var entities, position, velocity;

        entities = this.world.getEntities('position', 'velocity');

        entities.forEach(function (entity) {
            position = entity.getComponent('position');
            velocity = entity.getComponent('velocity');
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;
            position.z += velocity.z * dt;
        });
    }
});

module.exports = System;
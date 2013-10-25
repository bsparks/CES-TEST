// physics system
var CES = require('ces');

var System = CES.System.extend({
    update: function (dt) {
        var entities, position, velocity, rotation, angularVelocity;

        entities = this.world.getEntities('position', 'velocity', 'rotation', 'angularVelocity');

        entities.forEach(function (entity) {
            position = entity.getComponent('position');
            velocity = entity.getComponent('velocity');
            rotation = entity.getComponent('rotation');
            angularVelocity = entity.getComponent('angularVelocity');

            position.x += velocity.x * dt;
            position.y += velocity.y * dt;
            position.z += velocity.z * dt;

            rotation.x += angularVelocity.x * dt;
            rotation.y += angularVelocity.y * dt;
            rotation.z += angularVelocity.z * dt;

            // sync up mesh with components (this doesn't seem like the best way)
            if(entity.hasComponent('mesh')) {
                var mesh = entity.getComponent('mesh').mesh;

                mesh.position.x = position.x;
                mesh.position.y = position.y;
                mesh.position.z = position.z;

                mesh.rotation.x = rotation.x;
                mesh.rotation.y = rotation.y;
                mesh.rotation.z = rotation.z;
            }
        });
    }
});

module.exports = System;
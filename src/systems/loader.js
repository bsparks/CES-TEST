// three loader system
var CES = require('ces');

// TODO: require('three') - browserify (for now just client side only)

var System = CES.System.extend({
    init: function(scene) {
        this.scene = scene;
    },
    update: function(dt) {
        var system = this,
            entities;

        entities = this.world.getEntities('texture', 'geometry');
        if(entities.length > 0) {
            console.log('loader: ', entities.length);
        }
        entities.forEach(function(entity) {
            texture = entity.getComponent('texture');
            geometry = entity.getComponent('geometry');

            if (texture.texture === null) {
                texture.texture = THREE.ImageUtils.loadTexture(texture.path);

                var material = new THREE.MeshBasicMaterial({
                    map: texture.texture
                });
                var mesh = new THREE.Mesh(geometry.geometry, material);
                entity.addComponent(new ComponentRegistry.mesh(mesh));

                system.scene.add(mesh);
            }
        });
    }
});

module.exports = System;
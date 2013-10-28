CES = require('ces');
ComponentRegistry = require('../../components');
SystemsRegistry = require('../../systems');
_ = require('underscore');

var $window = window; // just for some angular compat..

var lastTime = 0;
var loop = function(game) {
    requestAnimationFrame(function() {
        loop(game);
    });

    var currentTime = Date.now(),
        deltaTime = (currentTime - lastTime) / 1000;

    game.update(deltaTime);

    lastTime = currentTime;
};

Game = CES.Class.extend({
    init: function() {
        this.world = new CES.World();
    },
    start: function() {
        var self = this;

        // hacky hack!
        self.io = io.connect();

        self.io.on('entities', function(data) {
            console.log('socket ents', data.entities);
            // clear world, server is authority
            _.each(self.world.getEntities(), function(entity) {
                self.world.removeEntity(entity);
            });

            _.each(data.entities, function(entityData) {
                //console.log('entityData: ', entityData);
                self.createEntity(entityData);
            });
        });

        var ghostManager = new SystemsRegistry['ghostManager'](self.io, false);

        self.io.on('ghosts', function(data) {
            //console.log('ghosts!', data);
            _.each(data.g, function(ghostData) {
                console.log('updateGhosts', ghostData['ghostable'].ghostID, ghostData);
                ghostManager.updateGhost(ghostData['ghostable'].ghostID, ghostData);
            });
        });

        self.renderer = new THREE.WebGLRenderer();
        self.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(self.renderer.domElement);

        self.camera = new THREE.PerspectiveCamera(70, $window.innerWidth / $window.innerHeight, 1, 1000);
        self.camera.position.z = 400;
        self.scene = new THREE.Scene();

        self.world.addSystem(new SystemsRegistry['loader'](self.scene));
        self.world.addSystem(new SystemsRegistry['physics']());
        self.world.addSystem(ghostManager);

        window.addEventListener('resize', function() {
            self.onWindowResize();
        }, false);

        loop(self);

        self.io.emit('ready');
    },
    createEntity: function(data) {
        var entity = new CES.Entity();
        //console.log('data: ', data);
        _.each(data, function(value, key) {
            //console.log('createEntity >> key: ', key, 'value: ', value);

            if (ComponentRegistry.hasOwnProperty(key)) {
                var component = new ComponentRegistry[key]();
                _.extend(component, value);
                entity.addComponent(component);
            }
        });

        this.world.addEntity(entity);
    },
    createCube: function(x, y, z) {
        x = x || 0;
        y = y || 0;
        z = z || 0;

        var entity = new CES.Entity();
        entity.addComponent(new ComponentRegistry['position'](x, y, z));
        entity.addComponent(new ComponentRegistry['rotation']());
        entity.addComponent(new ComponentRegistry['velocity']());
        entity.addComponent(new ComponentRegistry['angularVelocity']());
        entity.addComponent(new ComponentRegistry['texture']('media/images/crate.gif'));
        entity.addComponent(new ComponentRegistry['geometry'](new THREE.CubeGeometry(200, 200, 200)));

        this.world.addEntity(entity);

        return entity; // temp hack for debug
    },
    update: function(dt) {
        this.world.update(dt);

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    },
    onWindowResize: function() {
        this.camera.aspect = $window.innerWidth / $window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize($window.innerWidth, $window.innerHeight);
    }
});
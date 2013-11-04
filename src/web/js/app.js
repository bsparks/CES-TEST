CES = require('ces');
ComponentRegistry = require('../../components');
SystemsRegistry = require('../../systems');
_ = require('underscore');
Tree = require('./tree');

var $window = window; // just for some angular compat..

$window.Tree = Tree; // temp

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

PointerLockControls = require('./pointerLockControls.js');

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
        //self.camera.position.z = 400;

        self.controls = new PointerLockControls(self.camera);

        self.ray = new THREE.Raycaster();
        self.ray.ray.direction.set( 0, -1, 0 );

        self.scene = new THREE.Scene();
        self.scene.add(self.controls.getObject());

        var ambient = new THREE.AmbientLight( 0xffffff );
        self.scene.add( ambient );

        self.renderer.setClearColor(0x92aafd, 1);

        self.world.addSystem(new SystemsRegistry['loader'](self.scene));
        self.world.addSystem(new SystemsRegistry['physics']());
        self.world.addSystem(ghostManager);

        self.dgen = new SystemsRegistry['dungeonGen']();
        self.world.addSystem(self.dgen);

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
    createTower: function() {
        var self = this;
        var loader = new THREE.JSONLoader();
        loader.load('/media/meshes/guard_tower/guard_tower.js', function(geometry, materials) {
            var texture = THREE.ImageUtils.loadTexture('/media/meshes/guard_tower/guard_tower_col_512.png');
            console.log('loaded json', geometry, texture, materials);

            var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
            self.scene.add(mesh);
        });
    },
    update: function(dt) {
        this.controls.update(dt);

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
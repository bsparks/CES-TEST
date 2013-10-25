CES = require('ces');
ComponentRegistry = require('../../components');
SystemsRegistry = require('../../systems');

var $window = window; // just for some angular compat..

Game = CES.Class.extend({

    init: function() {
        this.world = new CES.World();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera = new THREE.PerspectiveCamera(75, $window.innerWidth / $window.innerHeight, 0.1, 10000);
        this.scene = new THREE.Scene();

        this.world.addSystem(new SystemsRegistry['loader'](this.scene));
        this.world.addSystem(new SystemsRegistry['physics']());

        window.addEventListener('resize', this.onWindowResize, false);
    },
    createCube: function(x, y, z) {
        x = x || 0;
        y = y || 0;
        z = z || 0;

        var entity = new CES.Entity();
        entity.addComponent(new ComponentRegistry['position'](x, y, z));
        entity.addComponent(new ComponentRegistry['rotation']());
        entity.addComponent(new ComponentRegistry['texture']('media/images/crate.gif'));
        entity.addComponent(new ComponentRegistry['geometry'](new THREE.CubeGeometry(200, 200, 200)));

        this.world.addEntity(entity);
    },
    update: function(dt) {
        this.world.update(dt);

        this.renderer.render(this.scene, this.camera);
    },
    onWindowResize: function() {
        this.camera.aspect = $window.innerWidth / $window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize($window.innerWidth, $window.innerHeight);
    }
});

game = new Game();

var lastTime = 0;
var loop = function() {
    requestAnimationFrame(loop);

    var currentTime = Date.now(),
        deltaTime = (currentTime - lastTime) / 1000;

    game.update(deltaTime);

    lastTime = currentTime;
};

loop();

var CES = require('ces'),
    MongoClient = require('mongodb').MongoClient,
    GameEngine = require('./engine'),
    _ = require('underscore'),
    mongo,
    ComponentRegistry = {};

ComponentRegistry['position'] = require('./components/position');
ComponentRegistry['velocity'] = require('./components/velocity');
ComponentRegistry['health'] = require('./components/health');
ComponentRegistry['path'] = require('./components/path');
// markers designate ways to select groups of otherwise indistinguishables
ComponentRegistry['waypoint_marker'] = require('./components/markers/waypoint');

var PhysicSystem = require('./systems/physics');

var world = new CES.World();

// systems should be added in priority order
world.addSystem(new PhysicSystem());

var init = function() {
    var hero = new CES.Entity();
    hero.addComponent(new Position(0, 0));
    hero.addComponent(new Velocity(1, 2));
    hero.addComponent(new Health(100));

    var waypoint = new CES.Entity();
    waypoint.addComponent(new Position(10, 5));
    waypoint.addComponent(new Type('Waypoint'));

    world.addEntity(hero);
    world.addEntity(waypoint);
};

var engine = new GameEngine({
    world: world
});

engine.on('tick', function(delta) {
    this.world.update(delta);
});

engine.loadWorld = function() {
    var collection = mongo.collection('entities');

    collection.find().toArray(function(err, results) {
        _.each(results, function(data) {
            var entity = new CES.Entity();
            //console.log('data: ', data);
            _.each(data, function(value, key) {
                console.log('key: ', key);
                if(ComponentRegistry.hasOwnProperty(key)) {
                    var component = new ComponentRegistry[key]();
                    _.extend(component, value);
                    entity.addComponent(component);
                }
            });
            world.addEntity(entity);
        });
    });
};

engine.saveWorld = function() {
    var entities = world.getEntities(),
        collection = mongo.collection('entities');

    // this must be a snapshot, so clear previous
    collection.remove(function(err) {
        if(err) {
            console.error('error during remove: ', err);
            return;
        }

        entities.forEach(function(entity) {
            var serialized = {};

            // id doesn't matter, only components matter
            _.each(entity._components, function(val, key) {
                serialized[key.substr(1)] = val;
            });

            collection.insert(serialized, function(err, doc) {
                if(err) {
                    console.error('Error inserting entity: ', err);
                }
            });
        });
    });
};

// setup REPL for console server mgmt
var startREPL = function() {
    var repl = require('repl'),
        pkg = require('./package.json');

    // Not game stuff, this is for the server executable
    process.stdin.setEncoding('utf8');

    // startup a full node repl for javascript awesomeness
    var serverREPL = repl.start({
        prompt: "ironbane> ",
        input: process.stdin,
        output: process.stdout
    });

    serverREPL.on('exit', function() {
        // todo: other shutdown stuff, like stop db, etc.
        process.exit();
    });

    // context variables get attached to "global" of this instance
    serverREPL.context.version = pkg.version;
    serverREPL.context.engine = engine;
    serverREPL.context.db = mongo;
    serverREPL.context.cr = ComponentRegistry;
};


MongoClient.connect('mongodb://127.0.0.1:27017/ironbane', function(err, db) {
    if (err) {
        throw err;
    }

    mongo = db;

    startREPL();
});

process.on('exit', function() {
    mongo.close();
});

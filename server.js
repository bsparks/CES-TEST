var CES = require('ces'),
    config = require('./nconf'),
    MongoClient = require('mongodb').MongoClient,
    GameEngine = require('./src/engine'),
    _ = require('underscore'),
    mongo,
    ComponentRegistry = require('./src/components'),
    SystemRegistry = require('./src/systems');

var PhysicSystem = require('./src/systems/physics');

var world = new CES.World();

// systems should be added in priority order
world.addSystem(new PhysicSystem());

// spawn a creature type
var spawn = function(name, position, rotation) {
    position = position || {};
    rotation = rotation || {};

    var entity = new CES.Entity();
    entity.addComponent(new ComponentRegistry['tag'](name));
    entity.addComponent(new ComponentRegistry['position'](position.x, position.y, position.z, position.zone));
    entity.addComponent(new ComponentRegistry['velocity']());
    entity.addComponent(new ComponentRegistry['rotation'](rotation.x, rotation.y, rotation.z));
    entity.addComponent(new ComponentRegistry['speed']());
    entity.addComponent(new ComponentRegistry['mass']());
    entity.addComponent(new ComponentRegistry['health'](10));

    world.addEntity(entity);
};

var engine = new GameEngine({
    world: world
});

engine.on('tick', function(delta) {
    this.world.update(delta);
});

// get JUST the components for all entities (for network transmission)
engine.getRawEntities = function() {
    var ents = engine.world.getEntities();
    var raw = _.map(ents, function(entity) {
        var components = {};

        _.each(entity._components, function(component) {
            components[component.name] = {};
            _.each(component, function(value, key) {
                components[component.name][key] = value;
            });
        });

        return components;
    });

    return raw;
};

engine.loadWorld = function() {
    var collection = mongo.collection('entities');

    collection.find().toArray(function(err, results) {
        _.each(results, function(data) {
            var entity = new CES.Entity();
            //console.log('data: ', data);
            _.each(data, function(value, key) {
                //console.log('key: ', key);
                if (ComponentRegistry.hasOwnProperty(key)) {
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
        if (err) {
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
                if (err) {
                    console.error('Error inserting entity: ', err);
                }
            });
        });
    });
};

// temp
engine.createCube = function(x, y, z) {
    x = x || 0;
    y = y || 0;
    z = z || 0;

    var entity = new CES.Entity();
    entity.addComponent(new ComponentRegistry['position'](x, y, z));
    entity.addComponent(new ComponentRegistry['rotation']());
    entity.addComponent(new ComponentRegistry['velocity']());
    entity.addComponent(new ComponentRegistry['angularVelocity']());
    entity.addComponent(new ComponentRegistry['texture']('media/images/crate.gif'));
    entity.addComponent(new ComponentRegistry['geometry']());
    entity.addComponent(new ComponentRegistry['ghostable'](true));

    this.world.addEntity(entity);

    return entity; // temp hack for debug
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
    serverREPL.context.sr = SystemRegistry;
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

var express = require('express.io');
var app = express().http().io();

app.use('/js', express.static(__dirname + '/' + config.get('buildTarget') + '/game/js'));
app.use('/lib', express.static(__dirname + '/' + config.get('buildTarget') + '/game/lib'));
app.use('/media', express.static(__dirname + '/' + config.get('buildTarget') + '/game/media'));
app.use(app.router);

app.io.route('ready', function(req) {
    /*req.io.emit('entities', {
        entities: engine.getRawEntities()
    });*/
});

// Send client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/' + config.get('buildTarget') + '/game/index.html');
});

app.listen(config.get('server_port'));

// do this here for now
engine.world.addSystem(new SystemRegistry['ghostManager'](app.io, true));
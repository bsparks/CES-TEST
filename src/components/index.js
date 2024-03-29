var components = {
    "tag": require('./tag'), // name is "reserved"
    "health": require('./health'),
    "armor": require('./armor'),
    "position": require('./position'),
    "rotation": require('./rotation'),
    "velocity": require('./velocity'),
    "angularVelocity": require('./angularVelocity'),
    "speed": require('./speed'),
    "mass": require('./mass'),
    "path": require('./path'),
    "texture": require('./texture'),
    "geometry": require('./geometry'),
    "mesh": require('./mesh'),
    "waypoint_marker": require('./markers/waypoint'),
    "ghostable": require('./ghostable'),
    "grid": require('./grid'),
    "mapping/dungeon": require('./mapping/dungeon')
};

module.exports = components;
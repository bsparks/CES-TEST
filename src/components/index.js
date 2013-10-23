var components = {
    "tag": require('./tag'), // name is "reserved"
    "health": require('./health'),
    "armor": require('./armor'),
    "position": require('./position'),
    "rotation": require('./rotation'),
    "velocity": require('./velocity'),
    "speed": require('./speed'),
    "mass": require('./mass'),
    "path": require('./path'),
    "waypoint_marker": require('./markers/waypoint')
};

module.exports = components;
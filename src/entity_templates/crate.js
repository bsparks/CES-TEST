
var CES = require('ces'),
    ComponentRegistry = require('../components');

module.exports = function() {
    var entity = new CES.Entity();
    entity.addComponent(new ComponentRegistry['position']());
    entity.addComponent(new ComponentRegistry['rotation']());
    entity.addComponent(new ComponentRegistry['velocity']());
    entity.addComponent(new ComponentRegistry['angularVelocity']());
    entity.addComponent(new ComponentRegistry['texture']('media/images/crate.gif'));
    entity.addComponent(new ComponentRegistry['geometry']());
    entity.addComponent(new ComponentRegistry['ghostable'](true));

    return entity;
};
// handle ghosting entities between client & server
var CES = require('ces'),
    _ = require('underscore');

var System = CES.System.extend({
    init: function(io, isServer) {
        this.io = io; // needs a reference to the socket handler
        this.isServer = !!isServer;

        this.updateTimer = 0; // start immediately
        this.updateTimeout = 32;
    },
    update: function(dt) {
        // only updating on server for now...
        if(!this.isServer) {
            return;
        }

        var system = this;
            ghosts = system.world.getEntities('ghostable');
        if (ghosts.length === 0) {
            return;
        }

        system.updateTimer--;
        if (system.updateTimer <= 0) {
            // for each client
            _.each(system.io.sockets.sockets, function(socket, socketId) {
                // here first we should grab ghosts in "scope" (i.e. test camera / cell / zone / etc.)

                var updates = [];
                // for each ghost, we have either already sent it to this client or not
                _.each(ghosts, function(ghost) {
                    var ghostable = ghost.getComponent('ghostable');
                    if (_.isObject(ghostable.ghostID)) {
                        if (ghostable.ghostID.hasOwnProperty(socketId)) {
                            // we've sent to this client before, send only partial update
                            updates.push(ghost); // todo: filter partials?
                        } else {
                            // first time this client is getting this object, send full deets, register client
                            ghostable.ghostID[socketId] = ghostable._ghostID;
                            updates.push(ghost);
                        }
                    } else {
                        ghostable._ghostID = ghostable.ghostID; // copy the id to internal
                        ghostable.ghostID = {};
                        ghostable.ghostID[socketId] = ghostable._ghostID;
                    }
                });

                if (updates.length > 0) {
                    socket.emit('ghosts', {
                        g: system.packUpdate(ghosts)
                    });
                }
            });

            // reset the clock!
            system.updateTimer = system.updateTimeout;
        }
    },
    // filter the components down to just raw data for updating
    packUpdate: function(ents) {
        var raw = _.map(ents, function(entity) {
            var ghostable = entity.getComponent('ghostable'),
                filter = [];
            if(ghostable) {
                // if not should it even be here?
                filter = ghostable.ghostedComponents;
            }

            var components = {};

            _.each(entity._components, function(component) {
                // no filtering means ALL components ghosted, otherwise only include the components marked as "networked"
                if(filter.length === 0 || filter.indexOf(component.name) >= 0) {
                    components[component.name] = {};
                    _.each(component, function(value, key) {
                        // for the actual ghostable component, only send the ID
                        if(component.name === 'ghostable') {
                            if(key === '_ghostID') {
                                components[component.name].ghostID = value;
                            }
                        } else {
                            components[component.name][key] = value;
                        }
                    });
                }
            });

            return components;
        });

        return raw;
    },
    // intended to be used on client side only!! (that's where ghosts live!)
    createGhost: function(data) {
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
    // client use
    getEntityByGhostID: function(ghostID) {
        var ghosts = this.world.getEntities('ghostable'),
            entity = _.find(ghosts, function(ghost) {
                var component = ghost.getComponent('ghostable');
                return component.ghostID === ghostID;
            });

        return entity;
    },
    // also client use (again ghosts live there!)
    updateGhost: function(ghostID, data) {
        var ghost = this.getEntityByGhostID(ghostID);
        if(!ghost) {
            console.warn('entity not found! - ghosting!', ghostID);
            this.createGhost(data);
            return;
        }

        _.each(data, function(value, key) {
            //console.log('createEntity >> key: ', key, 'value: ', value);
            var component = ghost.getComponent(key);
            if(component) {
                // todo: use getters and setters here for observation?
                _.extend(component, value);
            } else {
                // create component? prolly...
            }
        });
    }
});

module.exports = System;
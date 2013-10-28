var CES = require('ces'),
    _ = require('underscore');

var ID = 0; //todo: track separate id lists for each client?

var Component = CES.Component.extend({
    name: 'ghostable',
    init: function (scopeAlways, ghostedComponents) {
        this.scopeAlways = !!scopeAlways; // should this entity always be sent in updates?
        this.ghostID = ID++;
        this.ghostedComponents = ghostedComponents || []; // component names to include in network updates
    },
    addGhostedComponent: function(component) {
        if(this.ghostedComponents.indexOf(component) < 0) {
            this.ghostedComponents.push(component);
        }
    },
    removeGhostedComponent: function(component) {
        this.ghostedComponents = _.without(this.ghostedComponents, component);
    }
});

module.exports = Component;
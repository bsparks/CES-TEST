// 2D map grid using row major order on 1D array
var CES = require('ces');

var Component = CES.Component.extend({
    name: 'grid',
    init: function(width, height) {
        this.width = width;
        this.height = height || width;
        this.cells = new Array(this.width * this.height);
    },
    get: function(x, y, debug) {
        var index = y * this.width + x;

        if (index > this.cells.length - 1 || index < 0) {
            // out of bounds
            return;
        }

        if(debug) {
            console.log('index for: ', x, ',', y, ' is ', index);
        }

        return this.cells[index];
    },
    set: function(x, y, value) {
        var index = y * this.width + x;

        if (index > this.cells.length - 1 || index < 0) {
            throw "out of bounds!";
        }

        this.cells[index] = value;
    },
    // arguably a system method (?)
    fill: function(value) {
        for (var i = 0, len = this.cells.length; i < len; i++) {
            this.cells[i] = value;
        }
    },
    getCoords: function(index) {
        if (index < 0 || index > this.cells.length - 1) {
            throw "out of bounds!";
        }

        var y = Math.floor(index / this.width);
        var x = (index - (y * this.height));

        return {
            x: x,
            y: y
        };
    }
});

module.exports = Component;
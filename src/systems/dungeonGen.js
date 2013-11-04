// dungeonGen.js
var CES = require('ces'),
    _ = require('underscore'),
    ComponentRegistry = require('../components'),
    RNG = require('../common/rng');

var Generator = CES.System.extend({
    init: function(seed) {
        this.rng = new RNG(seed || 'Example');
        this.dice = RNG.roller('3d6', this.rng);
    },
    update: function(dt) {},
    generate: function(width, height, seed) {
        //console.log('generate: ', ComponentRegistry);

        if (!_.isUndefined(seed)) {
            this.rng = new RNG(seed);
        }

        var grid = new ComponentRegistry.grid(width, height);
        grid.fill(0);

        var map = new CES.Entity();
        map.addComponent(grid);
        map.addComponent(new ComponentRegistry['mapping/dungeon']());

        this.world.addEntity(map);

        this.initRooms(map);
        this.digRooms(map);
        this.buildCorridors(map);
        this.buildWalls(map);

        return map;
    },
    initRooms: function(map) {
        var grid = map.getComponent('grid');
        var dungeon = map.getComponent('mapping/dungeon');

        //console.log('initRooms', grid, dungeon);

        // room size
        var min_size = 5;
        var max_size = 15;

        var numRooms = this.rng.random(3, 18);
        var iterations = 0;
        for (var i = 0; i < numRooms; i++) {
            iterations++;
            var room = {};

            room.x = this.rng.random(1, grid.width - max_size - 1);
            room.y = this.rng.random(1, grid.height - max_size - 1);
            room.w = this.rng.random(min_size, max_size);
            room.h = this.rng.random(min_size, max_size);

            if (this.intersects(map, room)) {
                i--;
                continue;
            }
            room.w--;
            room.h--;

            dungeon.rooms.push(room);
        }

        console.log('rooms generated in ' + iterations + ' iterations');
    },
    // rect intersection with any other room in the dungeon
    intersects: function(map, room) {
        var dungeon = map.getComponent('mapping/dungeon');

        for (var r = 0; r < dungeon.rooms.length; r++) {
            var dRoom = dungeon.rooms[r];
            if (dRoom.x < (room.x + room.w) &&
                (dRoom.x + dRoom.w) > room.x &&
                dRoom.y < (room.y + room.h) &&
                (dRoom.y + dRoom.h) > room.y) {
                return true;
            }
        }

        return false;
    },
    digRooms: function(map) {
        var dungeon = map.getComponent('mapping/dungeon');
        var grid = map.getComponent('grid');

        //console.log('digging', dungeon, grid);

        _.each(dungeon.rooms, function(room) {
            //console.log('digging room: ', room);
            //room.coords = [];
            for (var y = room.y; y < (room.y + room.h); y++) {
                for (var x = room.x; x < (room.x + room.w); x++) {
                    grid.set(x, y, 1);
                    //room.coords.push({x: x, y: y});
                }
            }
        });

        //console.log('dug', dungeon, grid);
    },
    buildCorridors: function(map) {
        var dungeon = map.getComponent('mapping/dungeon');
        var grid = map.getComponent('grid');
        var room_count = dungeon.rooms.length;

        for (i = 0; i < room_count; i++) {
            var roomA = dungeon.rooms[i];
            var roomB = this.findNearestRoom(map, roomA);

            pointA = {
                x: this.rng.random(roomA.x, roomA.x + roomA.w),
                y: this.rng.random(roomA.y, roomA.y + roomA.h)
            };
            pointB = {
                x: this.rng.random(roomB.x, roomB.x + roomB.w),
                y: this.rng.random(roomB.y, roomB.y + roomB.h)
            };

            while ((pointB.x !== pointA.x) || (pointB.y !== pointA.y)) {
                if (pointB.x !== pointA.x) {
                    if (pointB.x > pointA.x) {
                        pointB.x--;
                    } else {
                        pointB.x++;
                    }
                } else if (pointB.y !== pointA.y) {
                    if (pointB.y > pointA.y) {
                        pointB.y--;
                    } else {
                        pointB.y++;
                    }
                }

                grid.set(pointB.x, pointB.y, 1);
            }
        }
    },
    findNearestRoom: function(map, room) {
        var dungeon = map.getComponent('mapping/dungeon');

        var mid = {
            x: room.x + (room.w / 2),
            y: room.y + (room.h / 2)
        };
        var closest = null;
        var closest_distance = 1000;
        for (var i = 0; i < dungeon.rooms.length; i++) {
            var check = dungeon.rooms[i];
            if (check === room) {
                continue;
            }
            var check_mid = {
                x: check.x + (check.w / 2),
                y: check.y + (check.h / 2)
            };
            var distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
            if (distance < closest_distance) {
                closest_distance = distance;
                closest = check;
            }
        }
        return closest;
    },
    buildWalls: function(map) {
        var grid = map.getComponent('grid');

        for (var x = 0; x < grid.width; x++) {
            for (var y = 0; y < grid.height; y++) {
                if (grid.get(x, y) === 1) {
                    for (var xx = x - 1; xx <= x + 1; xx++) {
                        for (var yy = y - 1; yy <= y + 1; yy++) {
                            if (grid.get(xx, yy) === 0) {
                                grid.set(xx, yy, 2);
                            }
                        }
                    }
                }
            }
        }
    },
    // map should be an entity with a grid component
    draw: function(ctx, scale, map) {
        map = map || this.world.getEntities('mapping/dungeon')[0];

        if (!_.isNumber(scale)) {
            scale = 1;
        }

        var grid = map.getComponent('grid');

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 512); // todo: config

        for (var y = 0; y < grid.height; y++) {
            for (var x = 0; x < grid.width; x++) {
                var tile = grid.get(x, y);
                if (_.isUndefined(tile)) {
                    console.log('bad tile? ', x, y);
                }
                if (tile === 0) {
                    ctx.fillStyle = '#040404';
                } else if (tile === 1) {
                    ctx.fillStyle = '#64908A';
                } else {
                    ctx.fillStyle = '#424254';
                }
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
});

module.exports = Generator;
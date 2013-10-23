Experimenting and learing about CES - Component Entity Systems.

Some notes:

the entity ids shouldn't matter, each time the game saves/loads/runs the ids can/should be different

saving is just a snapshot of all of the entity states at a given point in time. there is no update. there can only be first load (like a level file), then after that state
is constantly changing
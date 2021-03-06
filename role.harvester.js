var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.dest){
            var destination = Game.getObjectById(creep.memory.dest); // load destination from memory
        }
        if(Memory.debugJobs)
            creep.say(creep.memory.task);
        
        switch(creep.memory.task){
            case "request":
                destination = ""; 
                if(creep.carry.energy == creep.carryCapacity) {
                    creep.memory.task = "dDestination";
                } else {

                    var sources = creep.room.find(FIND_SOURCES);
                    for (i = 0; i< Memory.sourceInUse.length; i++){         //iterate over sources
                        if(Memory.sourceInUse[i] < 1){         //check for available spot
                            Memory.sourceInUse[i]++;
                            destination = sources[i];
                            creep.memory.sourceIndex = i;
                            creep.memory.task = "harvest";
                            break;
                        }
                    }
                    if (destination == "") {                     //all in use, goto flag
                        creep.memory.task = "fDestination";
                    }
                }
            break;

            case "dDestination": //set deposit destination
            delete creep.memory.task;
            if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity){
                destination = Game.spawns['Spawn1'];
                creep.memory.task = "deposit"
            } else {
                var containers = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_EXTENSION }});
                for(i=0; i<containers.length; i++){
                    if(containers[i].store < containers[i].storeCapacity){
                        destination = containers[i];
                        creep.memory.task = "deposit"
                        break;
                    }
                }
            }
            break;

            case "fDestination": //set flag destination
                creep.memory.flag = "Flag1";
                creep.memory.task = "flag";
            break;

            case "flag": //Determine distance to flag and progress if outside
            var flagdest = Game.flags[creep.memory.flag];
            if(flagdest){
                if(Math.sqrt((Math.pow((creep.pos.x-flagdest.pos.x),2)+Math.pow((creep.pos.y-flagdest.pos.y),2)))>5) {
                    creep.moveTo(flagdest, {visualizePathStyle: {stroke: '#ffffff'}}); //move towards if over 5 away
                } else {
                    creep.memory.task = "request"; //request new task
                }
            }
            break;

            case "harvest": //progress to destination and harvest if energy is not full
                if(creep.carry.energy<creep.carryCapacity){
                    if(creep.harvest(destination) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(destination);
                    }
                } else {
                    Memory.sourceInUse[creep.memory.sourceIndex]--;
                    delete creep.memory.sourceIndex;
                    creep.memory.task = "dDestination";
                }
            break;

            case "deposit": //if has energy, progress to destination and transfer
                if(creep.carry.energy>0){
                    if(creep.transfer(destination, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    creep.memory.task = "fDestination";
                }
            break;

            default:
                creep.memory.task = "request";
        }
        //console.log('local: ' + destination);
        if(destination){
            //console.log('local destination recognized!');
            creep.memory.dest = destination.id;
        }
        creep.memory.test = destination;
        //console.log('remote mem: ' + creep.memory.dest);
    }
};

module.exports = roleHarvester;
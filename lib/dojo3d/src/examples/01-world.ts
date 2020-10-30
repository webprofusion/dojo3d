//import { World } from "../lib/world";

import { World } from "../lib/World";


var world = new World();

world.create();

world.setupLights();

world.addGround();

//var cube1 = world.AddCube();
world.addCube(0.1, 0.1, 0.1, 3, 3, 3);

// world.LoadModel("assets/models / characters / phoenix_bird / scene.gltf", 0.005);
//https://5h3o2.csb.app/


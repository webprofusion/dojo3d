//import { World } from "../lib/world";

import { World } from "../lib/dojo3d";


var world = new World();

world.Create();

world.SetupLights();

world.AddGround();

//var cube1 = world.AddCube();
world.AddCube(0.1, 0.1, 0.1, 3, 3, 3);

// world.LoadModel("assets/models / characters / phoenix_bird / scene.gltf", 0.005);
//https://5h3o2.csb.app/


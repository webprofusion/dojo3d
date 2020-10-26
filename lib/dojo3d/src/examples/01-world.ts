import { World } from "../lib/world";

const world: World = new World();

world.Create();

const cube1 = world.AddCube();

console.log(cube1);
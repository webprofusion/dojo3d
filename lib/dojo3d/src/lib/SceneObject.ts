import { Model } from "./Model";
import { Object3D } from "three";

export class SceneObject {

    public update: () => void;

    constructor(public model: Model, public obj: Object3D) {

    }

    setPosition(x: number, y: number, z: number) {
        this.obj.position.set(x, y, z);
    }

    setScale(scale: number) {
        this.obj.scale.set(scale, scale, scale);
    }

    setRotation(x: number, y: number, z: number) {
        this.obj.rotateX(x);
        this.obj.rotateY(y);
        this.obj.rotateZ(z);
    }
}
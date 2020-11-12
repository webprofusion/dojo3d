import { Model } from "./Model";
import { AnimationMixer } from "three";
import { LoadedModel } from "./World";

export class SceneObject {

    public update: () => void;

    mixer: AnimationMixer;
    clips: any;
    obj: any;

    constructor(public loadedModel: LoadedModel, public definition: Model,) {
        this.obj = loadedModel.obj;
        this.clips = loadedModel.animationClips;

        this.setClips(this.obj, this.clips);
        this.playAllClips();
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

    onUpdate(timeDelta) {
        if (this.mixer) {
            this.mixer.update(timeDelta);
        }
    }

    setClips(obj, clips) {
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer.uncacheRoot(this.mixer.getRoot());
            this.mixer = null;
        }

        this.clips = clips;
        if (!clips.length) return;

        this.mixer = new AnimationMixer(obj);
    }

    playAllClips() {
        this.clips.forEach((clip) => {
            this.mixer.clipAction(clip).reset().play();
            // this.state.actionStates[clip.name] = true;
        });
    }
}
import { AnimationMixer, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Model, ModelCatalog } from './Model';
import { SceneObject } from './SceneObject';
//import TWEEN from '@tweenjs/tween.js';

//import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export interface Viewpoint {
  title: string
  position: Vector3;
}

class World {

  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  mixer: AnimationMixer;
  clips: any;

  modelCatalog: ModelCatalog;

  sceneObjects: SceneObject[] = [];

  isWorldCreated = false;

  prevTime = 0;

  assetsBaseUrl = "https://dojo3d.s3.amazonaws.com/";

  viewpoints: Viewpoint[] = [];

  log(msg: string) {
    console.log(msg);
  }

  constructor(createWorld = true) {
    this.sceneObjects = [];

    if (createWorld == true) {
      this.create();
    }
  }

  public addCube(w = 1, h = 1, d = 1, x = 0, y = 0, z = 0) {
    this.log(`Creating and adding cube w:${w},h:${h},d:${d} at x:${x},y:${y},z:${z}`);

    var geometry = new BoxGeometry(w, h, d);
    var material = new MeshStandardMaterial({ color: 0x00ff00 });
    var cube = new Mesh(geometry, material);
    cube.receiveShadow = true;
    cube.position.set(x, y, z);

    this.scene.add(cube);

    return cube;
  }

  public addGround() {
    const mesh = new Mesh(new PlaneBufferGeometry(100, 100), new MeshStandardMaterial({ color: 0x999999 }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;

    this.scene.add(mesh);

    return mesh;
  }

  public setupLights() {
    var dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);
  }

  public create() {
    if (!this.isWorldCreated) {
      this.scene = new Scene();
      this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      this.renderer = new WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputEncoding = sRGBEncoding;
      this.renderer.shadowMap.enabled = true;

      document.body.appendChild(this.renderer.domElement);

      this.camera.position.z = 5;

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      this.render(0);
    }
  }

  public async fetchPrefabModels() {
    this.modelCatalog =
      await fetch(this.assetsBaseUrl + 'models/index.json', {
        method: 'GET', mode: 'cors', headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/octet-stream'
        }
      })

        .then(response => response.json());
  }

  public getPrefabModel(id: string): Model {
    return this.modelCatalog.models.find(m => m.id == id);
  }

  public getPrefabModelByName(name: string): Model {
    return this.modelCatalog.models.find(m => m.name == name);
  }

  public async addSceneObject(model: Model, scale = 1) {

    let url = model.path;

    if (!url.startsWith("http")) {
      url = this.assetsBaseUrl + "models/" + model.path;
    }

    const obj = await this.loadModel(url, scale);

    var sceneObject = new SceneObject(model, obj);

    this.sceneObjects.push(sceneObject);

    return sceneObject;
  }

  public async loadModel(gltf: string, scale = 1): Promise<any> {
    var loader = new GLTFLoader();

    // var dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('/examples/js/libs/draco/');
    //loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {


      loader.load(
        // resource URL
        gltf,
        // called when the resource is loaded
        (gltf) => {


          const scene = gltf.scene || gltf.scenes[0];
          const clips = gltf.animations || [];

          //scale new scene
          scene.scale.set(scale, scale, scale);

          this.setClips(scene, clips);
          /*
          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
          */

          this.playAllClips();

          gltf.scene.scale.set(scale, scale, scale);

          this.scene.add(gltf.scene);

          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

          resolve(gltf.scene);
        },
        // called while loading is progressing
        (xhr) => {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        (error) => {
          reject('An error happened:' + error);

        }
      );

    });
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

  public render(time) {
    requestAnimationFrame((t) => {
      this.render(t);
    });

    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    const dt = (time - this.prevTime) / 1000;

    this.mixer && this.mixer.update(dt);

    this.renderer.render(this.scene, this.camera);

    this.prevTime = time;
  }

  getCameraPositionAndDirection() {
    return {
      direction: this.camera.getWorldDirection(this.controls.center.clone()),
      position: this.camera.getWorldPosition(this.controls.center.clone())
    }
  }

  setCameraViewpoint(title: string) {
    const viewpoint = this.viewpoints.find(v => v.title == title).position;
    this.camera.position.set(viewpoint.x, viewpoint.y, viewpoint.z);
  }

  /*
  async animateToViewpoint(title: string, timeSeconds: number = 3) {
    const viewpoint = this.viewpoints.find(v => v.title == title).position;

    //this.sceneRenderer.setCameraTarget(this.productModelGroup.position.clone());

    return new Promise<any>((resolve, reject) => {

      new TWEEN.Tween(this.camera.position)
        .to(viewpoint, timeSeconds)
        .easing(TWEEN.Easing.Cubic.InOut)
        // .onUpdate(t => {
        // required for smooth camera update
        // if (t < 1800)


        // })
        .start()
        .onComplete(() => {
          resolve(true);
        });
    }

    );
  }
*/
  setViewpoints(viewpoints: Viewpoint[]) {
    this.viewpoints = viewpoints;
  }

}

export { World }
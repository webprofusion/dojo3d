import { BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Model, ModelCatalog } from './Model';
import { SceneObject } from './SceneObject';
import TWEEN from '@tweenjs/tween.js';

export interface Viewpoint {
  title: string
  position: Vector3;
}

export interface LoadedModel {
  obj: any;
  animationClips: any;
}

class World {

  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;

  modelCatalog: ModelCatalog;

  sceneObjects: SceneObject[] = [];

  isWorldCreated = false;

  prevTime = 0;

  assetsBaseUrl = "https://dojo3d.s3.amazonaws.com/";

  viewpoints: Viewpoint[] = [];
  sceneCenter: Vector3 = new Vector3(0, 0, 0);

  lastLoggedCameraPos: Vector3 = null;

  log(msg: string) {
    console.log(msg);
  }

  constructor(createWorld = true) {
    this.sceneObjects = [];

    if (createWorld == true) {
      this.create();
    }
  }

  public setAssetsBaseUrl(url: string) {
    this.assetsBaseUrl = url;
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

  public addLights() {
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
      window.addEventListener('resize', () => { this.resize(); }, false);

      this.camera.position.z = 5;

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      this.render(0);

      // report camera pos

      // log camera pos
      setInterval(() => {
        const camerapos = this.camera.getWorldPosition(this.sceneCenter);
        if (this.lastLoggedCameraPos != camerapos) {
          const positionString = `{x:${camerapos.x.toFixed(3)},y:${camerapos.y.toFixed(3)},z:${camerapos.z.toFixed(3)}}`;
          this.log(positionString);

          const statsDiv = document.getElementById("stats");
          if (statsDiv) {
            statsDiv.innerHTML = positionString;
          }
        }
      }, 3000);

    }
  }

  resize() {

    const { clientHeight, clientWidth } = this.renderer.domElement.parentElement;

    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(clientWidth, clientHeight);

    this.log(`Resized: ${clientWidth} ${clientHeight}`);
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

  public async addSceneObject(definition: Model, scale = 1) {

    let url = definition.path;

    if (!url.startsWith("http")) {
      url = this.assetsBaseUrl + "models/" + definition.path;
    }

    const loadedModel = await this.loadModel(url, true, scale);

    var sceneObject = new SceneObject(loadedModel, definition);

    this.sceneObjects.push(sceneObject);

    return sceneObject;
  }

  public async addSceneModelAsObject(m: LoadedModel, scale = 1) {


    m.obj.scale.set(scale, scale, scale);
    this.scene.add(m.obj);

    var sceneObject = new SceneObject(m, null);

    this.sceneObjects.push(sceneObject);

    return sceneObject;
  }

  public async loadModel(gltf: string, addModelToScene: boolean = true, scale = 1): Promise<LoadedModel> {
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

          if (addModelToScene) {

            /*
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
            */


            gltf.scene.scale.set(scale, scale, scale);

            this.scene.add(gltf.scene);

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
          }

          resolve({ obj: scene, animationClips: clips });
        },
        // called while loading is progressing
        (xhr) => {

          this.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        (error) => {
          reject('An error happened:' + error);

        }
      );

    });
  }



  public render(time) {
    requestAnimationFrame((t) => {
      this.render(t);
      TWEEN.update(t);
    });

    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    const deltaTime = (time - this.prevTime) / 1000;

    for (let o of this.sceneObjects) {
      o.onUpdate(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);

    this.prevTime = time;
  }

  getCameraPositionAndDirection() {
    return {
      direction: this.camera.getWorldDirection(this.controls.center.clone()),
      position: this.camera.getWorldPosition(this.controls.center.clone())
    }
  }

  setViewpoint(title: string) {
    this.log("jumping to viewpoint " + title);

    const vp = this.viewpoints.find(v => v.title.toLowerCase() == title.toLowerCase());

    if (!vp) {
      this.log(`Viewpoint named ${title} not found`);
      return;
    }

    const viewpoint = vp.position;

    this.camera.position.set(viewpoint.x, viewpoint.y, viewpoint.z);
  }

  animateToViewpoint(title: string, timeSeconds: number = 1) {

    this.log("animating to viewpoint " + title);

    const vp = this.viewpoints.find(v => v.title.toLowerCase() == title.toLowerCase());

    if (!vp) {
      this.log(`Viewpoint named ${title} not found`);
      return false;
    }

    const view = vp.position;
    const viewpoint = new Vector3(view.x, view.y, view.z);

    var cameraPos = this.camera.position.clone();

    if (viewpoint.equals(cameraPos)) {
      this.log("nothing to tween, skipping.");
      return false;
    }


    return new Promise<any>((resolve, reject) => {
      new TWEEN.Tween(cameraPos)
        .to(viewpoint, timeSeconds * 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate((o, e) => {

          // update camera position
          this.camera.position.x = cameraPos.x;
          this.camera.position.y = cameraPos.y;
          this.camera.position.z = cameraPos.z;

        })
        .start()
        .onComplete(() => {
          resolve(true);
        });
    });

  }

  setViewpoints(viewpoints: Viewpoint[]) {
    this.viewpoints = viewpoints;
  }

  explainModels() {

    this.log("Models available:");

    for (let m of this.modelCatalog.models) {
      this.log(`${m.name} (${m.category})`);
    }

  }
}

export { World }
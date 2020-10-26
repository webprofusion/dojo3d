import { AnimationMixer, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, sRGBEncoding, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
//import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

class World {

  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  mixer: AnimationMixer;
  clips: any;

  isWorldCreated = false;

  prevTime = 0;

  log(msg: string) {
    console.log(msg);
  }

  public World(createWorld = true) {
    if (createWorld == true) {
      this.Create();
    }
  }

  public AddCube(w = 1, h = 1, d = 1, x = 0, y = 0, z = 0) {
    this.log(`Creating and adding cube w:${w},h:${h},d:${d} at x:${x},y:${y},z:${z}`);

    var geometry = new BoxGeometry(w, h, d);
    var material = new MeshStandardMaterial({ color: 0x00ff00 });
    var cube = new Mesh(geometry, material);
    cube.receiveShadow = true;
    cube.position.set(x, y, z);

    this.scene.add(cube);

    return cube;
  }

  public AddGround() {
    const mesh = new Mesh(new PlaneBufferGeometry(100, 100), new MeshStandardMaterial({ color: 0x999999 }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;

    this.scene.add(mesh);

    return mesh;
  }

  public SetupLights() {
    /*const light = new AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    const hemiLight = new HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(- 3, 10, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;

    this.scene.add(dirLight);*/

    var dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);
  }

  public Create() {
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

  public LoadModel(gltf: string, scale = 1) {
    var loader = new GLTFLoader();

    // var dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('/examples/js/libs/draco/');
    //loader.setDRACOLoader(dracoLoader);

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

      },
      // called while loading is progressing
      (xhr) => {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      (error) => {

        console.log('An error happened:' + error);

      }
    );
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

}

export { World }
import "/src/assets/style.scss";
import * as THREE from 'three';

class Sketch {
  constructor() {
    this.body = document.querySelector('body');

    this.createScene();
    this.createCamera();
    this.createMesh();
    this.initRenderer();
    this.render();
  }

  get viewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    return { width, height, aspectRatio };
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    const PERSPECTIVE = 1000;

    const fov = (180 * (2 * Math.atan(this.viewport.height / 2 / PERSPECTIVE))) / Math.PI;

    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 1000);
    this.camera.position.set(0, 0, PERSPECTIVE);
  }

  createMesh() {
    const geometry = new THREE.PlaneGeometry(250, 250, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
  }

  onWindowResize() {
    this.camera.aspect = this.viewport.aspectRatio;

    this.createCamera();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  initRenderer() {
    this.renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });

    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.body.appendChild(this.renderer.domElement);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();

import "/src/assets/style.scss";
import * as THREE from 'three';

const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
}

class Sketch {
  constructor() {
    this.body = document.querySelector('body');
    this.images = [...document.querySelectorAll('img')];
    this.meshItems = [];

    this.scrollable = document.querySelector('.smooth-scroll');
    this.current = 0;
    this.target = 0;
    this.easy = 0.065;

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

  smoothScroll() {
    this.target = window.scrollY;
    this.current = lerp(this.current, this.target, this.easy);
    this.scrollable.style.transform = `translate3d(0, ${-this.current}px, 0)`;
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
    this.images.map((image) => {
      const meshItem = new MeshItem(image, this.scene);

      this.meshItems.push(meshItem);
    })

    // update height
    document.body.style.height = `${this.scrollable.getBoundingClientRect().height}px`;
  }

  onWindowResize() {
    // update height
    document.body.style.height = `${this.scrollable.getBoundingClientRect().height}px`;

    this.camera.aspect = this.viewport.aspectRatio;

    this.createCamera();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  initRenderer() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.body.appendChild(this.renderer.domElement);
  }

  render() {
    this.smoothScroll();

    for (let i = 0; i < this.meshItems.length; i++) {
      this.meshItems[i].render();
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

class MeshItem{
  constructor(element, scene) {
    this.element = element;
    this.scene = scene;
    this.offset = new THREE.Vector2(0,0);
    this.sizes = new THREE.Vector2(0,0);

    this.createMesh();
  }

  updateDimensions() {
    const { width, height, top, left } = this.element.getBoundingClientRect();

    this.sizes.set(width, height);

    // В THREE JS координаты расположения объектов задается не как в браузере от верхнего левого угла,
    // а от координат x=0, y=0, z=0 (соответствующих центру экрана в нашем случае) до центральной точки объекта.
    this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2);
  }

  createMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 10, 10);

    const imageTexture = new THREE.TextureLoader().load(this.element.src);
    imageTexture.minFilter = THREE.LinearFilter;

    this.uniforms = {
      uTexture: { value: imageTexture },
      uOffset: { value: new THREE.Vector2(0.0, 0.0) },
      uAlpha: { value: 1.0 },
      u_mouse: { type: "v2", value: new THREE.Vector2() },
      u_time: { type: "f", value: 0.0 },
    };

  const material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    side: THREE.DoubleSide
  })

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  render() {
    this.updateDimensions();

    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
  }
}

new Sketch();

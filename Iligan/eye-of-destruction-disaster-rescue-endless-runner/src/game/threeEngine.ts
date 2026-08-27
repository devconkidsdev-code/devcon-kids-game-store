import * as THREE from 'three';
import { Lane, ObstacleType, CollectibleType, DisasterArea, Resident, Building } from '../types';

export class Game3DEngine {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;
  private hemisphereLight!: THREE.HemisphereLight;
  private vanLightLeft!: THREE.SpotLight;
  private vanLightRight!: THREE.SpotLight;
  private sirenLightRed!: THREE.PointLight;
  private sirenLightBlue!: THREE.PointLight;

  // Player Van & Character
  public playerGroup!: THREE.Group;
  public vanMesh!: THREE.Group;
  public characterMesh!: THREE.Group;
  public sirenBar!: THREE.Group;
  public shieldBubble!: THREE.Mesh;
  public turboParticles!: THREE.Points;

  // Runner Environment
  private roadGroup!: THREE.Group;
  private roadSegments: THREE.Mesh[] = [];
  private sceneryProps: THREE.Group[] = [];
  private obstacleMeshes: Map<number, THREE.Group> = new Map();
  private collectibleMeshes: Map<number, THREE.Group> = new Map();
  private stormVortexMesh!: THREE.Mesh;

  // Plaza / Stop Area Objects
  public plazaGroup!: THREE.Group;
  private residentMeshes: Map<string, THREE.Group> = new Map();
  private buildingMeshes: Map<string, THREE.Group> = new Map();
  private plazaDebrisGroup!: THREE.Group;
  private plazaLightsGroup!: THREE.Group;
  private activeLaserBeam: THREE.Line | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Active Particle Emitters
  private activeParticles: {
    mesh: THREE.Points;
    velocities: THREE.Vector3[];
    lifespans: number[];
    maxLife: number;
    color: THREE.Color;
  }[] = [];

  // Rose On-Foot Target Motion
  private roseTargetPos: THREE.Vector3 | null = null;
  private roseIsInteracting: boolean = false;
  private roseActionTimer: number = 0;

  // State
  private currentMode: 'RUNNER' | 'PLAZA' = 'RUNNER';
  private targetSkyColor = new THREE.Color(0x334155);
  private targetFogColor = new THREE.Color(0x1e293b);
  private currentFogColor = new THREE.Color(0x1e293b);
  private sirenTimer: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e293b);
    this.scene.fog = new THREE.FogExp2(0x1e293b, 0.018);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 800);
    this.camera.position.set(0, 4.5, 9);
    this.camera.lookAt(0, 1.2, -10);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.5);
    this.scene.add(this.hemisphereLight);

    this.dirLight = new THREE.DirectionalLight(0xffedd5, 1.3);
    this.dirLight.position.set(25, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.scene.add(this.dirLight);

    // 4. Groups
    this.roadGroup = new THREE.Group();
    this.scene.add(this.roadGroup);

    this.plazaGroup = new THREE.Group();
    this.plazaGroup.visible = false;
    this.scene.add(this.plazaGroup);

    // 5. Build Sub-components
    this.buildPlayerVan();
    this.buildRunnerRoad();
    this.buildStormVortex();

    // 6. Handle Window Resize
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Builds Rose's high-tech emergency disaster rescue van with sirens, suspension, headlights
   */
  private buildPlayerVan() {
    this.playerGroup = new THREE.Group();
    this.scene.add(this.playerGroup);

    this.vanMesh = new THREE.Group();

    // Van Body Main Chassis (White & Red Emergency vehicle)
    const bodyGeo = new THREE.BoxGeometry(2.1, 1.5, 3.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    this.vanMesh.add(body);

    // Red Disaster Rescue Stripes along sides
    const stripeGeo = new THREE.BoxGeometry(2.14, 0.4, 3.82);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.2,
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.95;
    this.vanMesh.add(stripe);

    // High visibility yellow reflector decals
    const decalGeo = new THREE.BoxGeometry(2.16, 0.1, 3.84);
    const decalMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      emissiveIntensity: 0.2,
    });
    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.position.y = 0.65;
    this.vanMesh.add(decal);

    // Front Windshield and Cabin Cockpit
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.9, 1.5);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.45, -0.6);
    this.vanMesh.add(cabin);

    // Medical First-Aid Cross on Side & Top
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.4,
    });
    // Top cross
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 1.2), crossMat);
    crossV.position.set(0, 1.78, 0.6);
    this.vanMesh.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.5), crossMat);
    crossH.position.set(0, 1.78, 0.6);
    this.vanMesh.add(crossH);

    // Wheels (4 Rugged all-terrain wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 });

    const wheelPositions = [
      [-1.05, 0.42, 1.1],
      [1.05, 0.42, 1.1],
      [-1.05, 0.42, -1.1],
      [1.05, 0.42, -1.1],
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos[0], pos[1], pos[2]);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      this.vanMesh.add(wheelGroup);
    });

    // Emergency Siren Lightbar on Roof
    this.sirenBar = new THREE.Group();
    this.sirenBar.position.set(0, 1.85, -0.4);

    const barBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8 })
    );
    this.sirenBar.add(barBase);

    const redLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.16, 0.25),
      new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      })
    );
    redLight.position.x = -0.4;
    this.sirenBar.add(redLight);

    const blueLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.16, 0.25),
      new THREE.MeshStandardMaterial({
        color: 0x0066ff,
        emissive: 0x0066ff,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      })
    );
    blueLight.position.x = 0.4;
    this.sirenBar.add(blueLight);

    this.sirenLightRed = new THREE.PointLight(0xff0000, 2.5, 18);
    this.sirenLightRed.position.set(-0.6, 2.1, -0.4);
    this.vanMesh.add(this.sirenLightRed);

    this.sirenLightBlue = new THREE.PointLight(0x0066ff, 2.5, 18);
    this.sirenLightBlue.position.set(0.6, 2.1, -0.4);
    this.vanMesh.add(this.sirenLightBlue);

    this.vanMesh.add(this.sirenBar);

    // Front Headlights
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 2.0,
    });
    const headLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.1), lightMat);
    headLeft.position.set(-0.7, 0.8, -1.91);
    this.vanMesh.add(headLeft);

    const headRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.1), lightMat);
    headRight.position.set(0.7, 0.8, -1.91);
    this.vanMesh.add(headRight);

    this.vanLightLeft = new THREE.SpotLight(0xffedd5, 4, 35, Math.PI / 6, 0.4);
    this.vanLightLeft.position.set(-0.7, 0.9, -1.9);
    this.vanLightLeft.target.position.set(-0.7, 0, -25);
    this.vanMesh.add(this.vanLightLeft);
    this.vanMesh.add(this.vanLightLeft.target);

    this.vanLightRight = new THREE.SpotLight(0xffedd5, 4, 35, Math.PI / 6, 0.4);
    this.vanLightRight.position.set(0.7, 0.9, -1.9);
    this.vanLightRight.target.position.set(0.7, 0, -25);
    this.vanMesh.add(this.vanLightRight);
    this.vanMesh.add(this.vanLightRight.target);

    // Roof Tool Rack & Medical Storage Containers
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.25, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.2 })
    );
    rack.position.set(0, 1.85, 0.8);
    this.vanMesh.add(rack);

    // Energy Shield Bubble (Pulsing blue shield mesh)
    const shieldGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      wireframe: true,
    });
    this.shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldBubble.position.y = 1.0;
    this.shieldBubble.visible = false;
    this.playerGroup.add(this.shieldBubble);

    this.playerGroup.add(this.vanMesh);

    // Also build on-foot Rose character (used in stop area)
    this.buildRoseCharacter();
  }

  /**
   * Builds Rose Hero character for on-foot stopping / repair exploration
   */
  private buildRoseCharacter() {
    this.characterMesh = new THREE.Group();

    // Body in emergency jumpsuit
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 }) // Rescue Red/Coral
    );
    body.position.y = 1.0;
    body.castShadow = true;
    this.characterMesh.add(body);

    // Rescue Backpack / First-Aid kit
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.5, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    pack.position.set(0, 1.05, 0.3);
    this.characterMesh.add(pack);

    // Head / Rescue Helmet
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.2 }) // Yellow safety helmet
    );
    head.position.y = 1.6;
    head.castShadow = true;
    this.characterMesh.add(head);

    // Visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.12, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 })
    );
    visor.position.set(0, 1.6, -0.18);
    this.characterMesh.add(visor);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.16, 0.35, 0);
    legL.castShadow = true;
    this.characterMesh.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.16, 0.35, 0);
    legR.castShadow = true;
    this.characterMesh.add(legR);

    this.characterMesh.visible = false;
    this.playerGroup.add(this.characterMesh);
  }

  /**
   * Builds the 3-Lane Endless Runner Highway & roadside scenery
   */
  private buildRunnerRoad() {
    const roadWidth = 14;
    const segmentLength = 80;
    const segmentCount = 5;

    // Road Texture Shader / Material with asphalt and lane stripes
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt dark ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Road grain
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#0f172a';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Outer shoulder yellow lines
    ctx.fillStyle = '#eab308';
    ctx.fillRect(20, 0, 8, 512);
    ctx.fillRect(484, 0, 8, 512);

    // Lane dashes (Left & Right lane dividing lines)
    ctx.fillStyle = '#ffffff';
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(170, y, 6, 36);
      ctx.fillRect(336, y, 6, 36);
    }

    const roadTexture = new THREE.CanvasTexture(canvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 4);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.8,
      metalness: 0.1,
    });

    for (let i = 0; i < segmentCount; i++) {
      const roadGeo = new THREE.PlaneGeometry(roadWidth, segmentLength);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.position.z = -i * segmentLength + 20;
      roadMesh.receiveShadow = true;
      this.roadGroup.add(roadMesh);
      this.roadSegments.push(roadMesh);

      // Side Guardrails & collapsed highway arches
      this.buildSideScenery(roadMesh.position.z, segmentLength);
    }

    // Ground terrain underneath
    const terrainGeo = new THREE.PlaneGeometry(300, 400);
    const terrainMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.position.z = -100;
    terrain.receiveShadow = true;
    this.roadGroup.add(terrain);
  }

  /**
   * Adds wrecked background buildings, collapsed overpasses, broken light poles
   */
  private buildSideScenery(zCenter: number, length: number) {
    const scenery = new THREE.Group();

    // Guard rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, length), railMat);
    railL.position.set(-7.1, 0.4, zCenter);
    railL.receiveShadow = true;
    scenery.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, length), railMat);
    railR.position.set(7.1, 0.4, zCenter);
    railR.receiveShadow = true;
    scenery.add(railR);

    // Damaged Background Skyscrapers along the road sides
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
    });

    const brokenGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x0369a1,
      emissiveIntensity: 0.15,
    });

    for (let side of [-1, 1]) {
      for (let j = 0; j < 4; j++) {
        const height = 15 + Math.random() * 35;
        const bld = new THREE.Mesh(
          new THREE.BoxGeometry(10 + Math.random() * 8, height, 12 + Math.random() * 6),
          Math.random() > 0.4 ? buildingMat : brokenGlassMat
        );
        const xOffset = side * (16 + Math.random() * 12);
        const zOffset = zCenter - length / 2 + j * (length / 4) + (Math.random() * 6 - 3);
        bld.position.set(xOffset, height / 2, zOffset);
        bld.rotation.y = (Math.random() - 0.5) * 0.2;
        bld.castShadow = true;
        bld.receiveShadow = true;
        scenery.add(bld);
      }

      // Lamp posts with occasional flickering light
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      post.position.set(side * 7.8, 3, zCenter + (Math.random() * 20 - 10));
      scenery.add(post);
    }

    this.roadGroup.add(scenery);
    this.sceneryProps.push(scenery);
  }

  /**
   * Builds the dramatic "Eye of Destruction" vortex storm in the distant skybox
   */
  private buildStormVortex() {
    const vortexGeo = new THREE.TorusGeometry(35, 12, 16, 48);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x4338ca,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    this.stormVortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    this.stormVortexMesh.position.set(0, 30, -220);
    this.stormVortexMesh.rotation.x = Math.PI / 3;
    this.scene.add(this.stormVortexMesh);
  }

  /**
   * Spawns dynamic 3D obstacle meshes for the endless runner
   */
  public createObstacleMesh(type: ObstacleType, lane: Lane, z: number, id: number): THREE.Group {
    const group = new THREE.Group();
    const laneX = lane * 3.5;
    group.position.set(laneX, 0, z);

    if (type === 'RUBBLE_PILE') {
      // Piled concrete rubble with rebar and hazard flare
      const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
      for (let i = 0; i < 6; i++) {
        const chunk = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.4),
          rubbleMat
        );
        chunk.position.set(
          (Math.random() - 0.5) * 1.6,
          0.3 + Math.random() * 0.5,
          (Math.random() - 0.5) * 1.2
        );
        chunk.rotation.set(Math.random(), Math.random(), Math.random());
        chunk.castShadow = true;
        group.add(chunk);
      }
      // Amber hazard warning beacon
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.6),
        new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0xf97316,
          emissiveIntensity: 2.0,
        })
      );
      beacon.position.set(0, 1.0, 0);
      group.add(beacon);
    } else if (type === 'OVERTURNED_CAR') {
      // Overturned disaster car (Jump or Dodge!)
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 1.2, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.4 })
      );
      carBody.position.set(0, 0.9, 0);
      carBody.rotation.z = Math.PI * 0.85; // Tilted/overturned
      carBody.castShadow = true;
      group.add(carBody);

      // Warning smoke/fire glow
      const fireGlow = new THREE.PointLight(0xf97316, 2.0, 6);
      fireGlow.position.set(0, 1.2, 0);
      group.add(fireGlow);
    } else if (type === 'FALLEN_SIGN_SLIDE') {
      // Overhead collapsed highway signage (Rose must SLIDE under!)
      const postL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      postL.position.set(-1.8, 2.0, 0);
      group.add(postL);

      const postR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      postR.position.set(1.8, 2.0, 0);
      group.add(postR);

      // Overhead barrier sign suspended at head height (1.4m to 2.8m)
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.4, 0.3),
        new THREE.MeshStandardMaterial({
          color: 0x15803d, // Highway green
          emissive: 0x166534,
          emissiveIntensity: 0.3,
        })
      );
      signBoard.position.set(0, 2.2, 0);
      signBoard.castShadow = true;
      group.add(signBoard);

      // Hanging hazard stripes
      const warningStripe = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.25, 0.35),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xca8a04,
          emissiveIntensity: 0.6,
        })
      );
      warningStripe.position.set(0, 1.4, 0);
      group.add(warningStripe);
    } else if (type === 'ELECTRIC_HAZARD_SLIDE') {
      // Hanging snapped power cables sparking (Slide under!)
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.0, 0.12, 8, 16, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      arch.position.set(0, 1.5, 0);
      arch.rotation.z = Math.PI;
      group.add(arch);

      const sparkGlow = new THREE.PointLight(0x38bdf8, 3.0, 8);
      sparkGlow.position.set(0, 1.8, 0);
      group.add(sparkGlow);
    } else if (type === 'ROAD_BARRIER') {
      // Construction Concrete Jersey Barrier (Jump or Dodge)
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.1, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
      );
      barrier.position.y = 0.55;
      barrier.castShadow = true;
      group.add(barrier);

      const redStripes = new THREE.Mesh(
        new THREE.BoxGeometry(2.82, 0.3, 0.72),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      redStripes.position.y = 0.55;
      group.add(redStripes);
    } else if (type === 'CRACKED_FISSURE_JUMP') {
      // Earthquake Fissure in road with glowing magma/steam (Must Jump!)
      const fissure = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.1, 3.2),
        new THREE.MeshStandardMaterial({
          color: 0x7c2d12,
          emissive: 0xd97706,
          emissiveIntensity: 1.2,
          roughness: 0.9,
        })
      );
      fissure.position.y = 0.05;
      group.add(fissure);
    } else {
      // Ramp debris (can be driven up or dodged)
      const rampGeo = new THREE.BufferGeometry();
      const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.8, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      ramp.position.y = 0.4;
      ramp.rotation.x = -0.3;
      ramp.castShadow = true;
      group.add(ramp);
    }

    this.scene.add(group);
    this.obstacleMeshes.set(id, group);
    return group;
  }

  /**
   * Spawns 3D Collectibles (Med Kits, Repair Materials, Shields, Coins, Nitro)
   */
  public createCollectibleMesh(type: CollectibleType, lane: Lane, z: number, id: number, yOffset: number = 0): THREE.Group {
    const group = new THREE.Group();
    const laneX = lane * 3.5;
    group.position.set(laneX, 1.2 + yOffset, z);

    if (type === 'MED_KIT') {
      // Floating First-Aid Kit with glowing cross
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.4),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
          emissive: 0x22c55e,
          emissiveIntensity: 0.3,
        })
      );
      box.castShadow = true;
      group.add(box);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.45, 0.42),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 1.0,
        })
      );
      group.add(crossV);

      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.18, 0.42),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 1.0,
        })
      );
      group.add(crossH);

      const glow = new THREE.PointLight(0x22c55e, 2.0, 5);
      group.add(glow);
    } else if (type === 'REPAIR_MATERIAL') {
      // Golden Tool Box / Construction Materials
      const toolbox = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.55, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.6,
          roughness: 0.2,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
        })
      );
      toolbox.castShadow = true;
      group.add(toolbox);

      // Steel handle
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.05, 8, 12, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 })
      );
      handle.position.y = 0.32;
      group.add(handle);

      const glow = new THREE.PointLight(0xf59e0b, 2.0, 5);
      group.add(glow);
    } else if (type === 'SHIELD') {
      // Pulsing energy shield orb
      const orb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.55, 2),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.85,
        })
      );
      group.add(orb);

      const glow = new THREE.PointLight(0x38bdf8, 3.0, 6);
      group.add(glow);
    } else if (type === 'NITRO') {
      // Cyan Turbo Nitro Canister
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.9, 16),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 1.5,
          metalness: 0.7,
        })
      );
      tank.rotation.z = Math.PI / 4;
      group.add(tank);

      const glow = new THREE.PointLight(0x06b6d4, 3.0, 6);
      group.add(glow);
    } else {
      // Golden Rescue Coin / Badge
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xeab308,
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.1,
        })
      );
      coin.rotation.x = Math.PI / 2;
      group.add(coin);

      const glow = new THREE.PointLight(0xfacc15, 1.5, 4);
      group.add(glow);
    }

    this.scene.add(group);
    this.collectibleMeshes.set(id, group);
    return group;
  }

  public removeObstacleMesh(id: number) {
    const mesh = this.obstacleMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.obstacleMeshes.delete(id);
    }
  }

  public removeCollectibleMesh(id: number) {
    const mesh = this.collectibleMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.collectibleMeshes.delete(id);
    }
  }

  /**
   * Initializes the 3D Stopping / Rescue Plaza for the current Disaster Area
   */
  public setupPlazaArea(area: DisasterArea) {
    // Clear previous plaza objects
    while (this.plazaGroup.children.length > 0) {
      this.plazaGroup.remove(this.plazaGroup.children[0]);
    }
    this.residentMeshes.clear();
    this.buildingMeshes.clear();

    this.plazaDebrisGroup = new THREE.Group();
    this.plazaLightsGroup = new THREE.Group();
    this.plazaGroup.add(this.plazaDebrisGroup);
    this.plazaGroup.add(this.plazaLightsGroup);

    // Plaza Ground (Paved city square / courtyard)
    const plazaFloorGeo = new THREE.PlaneGeometry(60, 60);
    const plazaFloorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(plazaFloorGeo, plazaFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.plazaGroup.add(floor);

    // Park Rose's rescue van in the center station
    this.vanMesh.position.set(0, 0, 0);
    this.vanMesh.rotation.set(0, 0, 0);
    this.characterMesh.position.set(0, 0, 2.5);
    this.characterMesh.visible = true;

    // Spawn Area Buildings (Damaged or Restored)
    area.buildings.forEach((bld) => {
      this.createPlazaBuilding(bld);
    });

    // Spawn Area Injured Residents
    area.residents.forEach((res) => {
      this.createPlazaResident(res);
    });

    // Spawn Debris chunks & hazard barriers around plaza
    this.spawnPlazaDebris(area.isRestored);

    this.roadGroup.visible = false;
    this.plazaGroup.visible = true;
    this.currentMode = 'PLAZA';

    // Position camera for cinematic district overview
    this.camera.position.set(0, 8.5, 16);
    this.camera.lookAt(0, 1.5, 0);

    // Fog & Sky Colors
    if (area.isRestored) {
      this.targetSkyColor.set(area.restoredSkyColor);
      this.targetFogColor.set(area.restoredFogColor);
      this.scene.fog = new THREE.FogExp2(area.restoredFogColor, 0.008);
      this.ambientLight.intensity = 1.0;
      this.dirLight.intensity = 1.6;
    } else {
      this.targetSkyColor.set(area.skyColor);
      this.targetFogColor.set(area.fogColor);
      this.scene.fog = new THREE.FogExp2(area.fogColor, 0.015);
      this.ambientLight.intensity = 0.5;
      this.dirLight.intensity = 1.1;
    }
  }

  /**
   * Creates a damaged / restorable 3D Building in the plaza
   */
  private createPlazaBuilding(bld: Building) {
    const group = new THREE.Group();
    group.position.set(bld.position[0], bld.position[1], bld.position[2]);
    group.rotation.y = bld.rotation;
    group.userData = { type: 'building', id: bld.id };

    const width = bld.type === 'city_hall' || bld.type === 'hospital' ? 14 : 10;
    const height = bld.type === 'city_hall' ? 18 : bld.type === 'power_plant' ? 12 : 14;
    const depth = 9;

    // Main Structure Mesh
    const wallColor = bld.isRepaired ? 0xf1f5f9 : (bld.structuralIntegrity || 0) > 60 ? 0x94a3b8 : 0x334155;
    const structureMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: bld.isRepaired ? 0.25 : 0.9,
      metalness: bld.isRepaired ? 0.2 : 0.05,
    });
    const structure = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), structureMat);
    structure.position.y = height / 2;
    structure.castShadow = true;
    structure.receiveShadow = true;
    structure.name = 'structure';
    group.add(structure);

    // Structural Cracks / Rubble Mesh at building base
    const baseRubbleGroup = new THREE.Group();
    baseRubbleGroup.name = 'base_rubble';
    if (!bld.isRepaired) {
      const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
      for (let i = 0; i < 6; i++) {
        const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.5), rubbleMat);
        chunk.position.set((Math.random() - 0.5) * (width - 1), 0.4, (depth / 2) + Math.random() * 1.5);
        baseRubbleGroup.add(chunk);
      }
    }
    group.add(baseRubbleGroup);

    // Scaffolding Grid Structure
    const scaffoldingGroup = new THREE.Group();
    scaffoldingGroup.name = 'scaffolding_group';
    scaffoldingGroup.visible = !bld.isRepaired && (bld.currentPhaseIndex || 0) > 0;

    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    // Left & Right scaffold towers
    for (let side = -1; side <= 1; side += 2) {
      for (let tier = 0; tier < 3; tier++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, depth + 1), scaffoldMat);
        bar.position.set(side * (width / 2 + 0.6), (tier + 1) * 3.5, 0);
        scaffoldingGroup.add(bar);

        const vert1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 12, 8), scaffoldMat);
        vert1.position.set(side * (width / 2 + 0.6), 6, (depth / 2));
        scaffoldingGroup.add(vert1);

        const vert2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 12, 8), scaffoldMat);
        vert2.position.set(side * (width / 2 + 0.6), 6, -(depth / 2));
        scaffoldingGroup.add(vert2);
      }
    }
    // Amber blinking hazard beacon on scaffolding top
    const scaffoldLight = new THREE.PointLight(0xf59e0b, 1.5, 8);
    scaffoldLight.position.set(0, height + 1, depth / 2 + 1);
    scaffoldingGroup.add(scaffoldLight);
    group.add(scaffoldingGroup);

    // Windows & Lit Interior
    const winColor = bld.isRepaired ? 0xfef08a : (bld.currentPhaseIndex || 0) >= 2 ? 0xfde047 : 0x090d16;
    const windowMat = new THREE.MeshStandardMaterial({
      color: winColor,
      emissive: bld.isRepaired || (bld.currentPhaseIndex || 0) >= 2 ? 0xfef08a : 0x000000,
      emissiveIntensity: bld.isRepaired ? 0.9 : (bld.currentPhaseIndex || 0) >= 2 ? 0.4 : 0,
      roughness: 0.1,
    });
    const winGrid = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, height * 0.7, depth * 0.7), windowMat);
    winGrid.position.y = height / 2;
    winGrid.name = 'windows';
    group.add(winGrid);

    // Roof features (Helipad, Clock, Water tank, Chimney)
    if (bld.type === 'hospital') {
      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.5, 0.4),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: bld.isRepaired ? 1.0 : 0.2
        })
      );
      cross.position.set(0, height + 1.5, depth / 2 + 0.1);
      cross.name = 'roof_cross';
      group.add(cross);
    } else if (bld.type === 'city_hall') {
      // Classical clock tower dome
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 })
      );
      dome.position.y = height;
      dome.name = 'roof_dome';
      group.add(dome);
    }

    // Interactive objective indicator beacon
    if (!bld.isRepaired) {
      const markerGroup = new THREE.Group();
      markerGroup.name = 'marker';
      markerGroup.position.set(0, height + 3.0, 0);

      const beacon = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 2.0,
          wireframe: true,
        })
      );
      markerGroup.add(beacon);

      const light = new THREE.PointLight(0x38bdf8, 2.5, 10);
      markerGroup.add(light);

      group.add(markerGroup);
    }

    this.plazaGroup.add(group);
    this.buildingMeshes.set(bld.id, group);
  }

  /**
   * Creates an injured or rescued Resident 3D character in the plaza
   */
  private createPlazaResident(res: Resident) {
    const group = new THREE.Group();
    group.position.set(res.position[0], 0, res.position[2]);
    group.userData = { type: 'resident', id: res.id };

    // Resident character mesh
    const bodyColor = res.isRescued ? 0x22c55e : (res.treatmentStage || 0) > 0 ? 0xf59e0b : 0xe11d48;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.5,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.85, 12), bodyMat);
    body.name = 'resident_body';
    
    // Posture calculation
    if (res.isRescued) {
      body.position.y = 0.95;
      body.rotation.z = 0;
    } else if ((res.treatmentStage || 0) === 1) {
      body.position.y = 0.6;
      body.rotation.z = Math.PI / 8; // Sitting propped up
    } else {
      body.position.y = 0.4;
      body.rotation.z = Math.PI / 3.5; // Lying down injured
    }
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.4 })
    );
    head.name = 'resident_head';
    head.position.set(0, res.isRescued ? 1.55 : (res.treatmentStage || 0) === 1 ? 1.1 : 0.75, 0);
    head.castShadow = true;
    group.add(head);

    // Left & Right Arms (Can animate waving / standing)
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5 });
    
    const armL = new THREE.Mesh(armGeo, armMat);
    armL.name = 'arm_l';
    armL.position.set(-0.35, res.isRescued ? 1.2 : 0.5, 0);
    armL.rotation.z = res.isRescued ? Math.PI / 4 : 0;
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.name = 'arm_r';
    armR.position.set(0.35, res.isRescued ? 1.3 : 0.5, 0);
    armR.rotation.z = res.isRescued ? -Math.PI / 3 : 0; // Waving hand
    group.add(armR);

    // Bandage Mesh
    const bandage = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.05, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    );
    bandage.name = 'bandage';
    bandage.position.y = 0.85;
    bandage.visible = (res.treatmentStage || 0) > 0;
    group.add(bandage);

    // Interactive distress beacon / pulse ring
    if (!res.isRescued) {
      const distressMarker = new THREE.Group();
      distressMarker.name = 'distress_marker';
      distressMarker.position.set(0, 2.2, 0);

      const markerColor = (res.treatmentStage || 0) > 0 ? 0xf59e0b : 0xef4444;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.07, 8, 16),
        new THREE.MeshStandardMaterial({
          color: markerColor,
          emissive: markerColor,
          emissiveIntensity: 2.0,
        })
      );
      ring.rotation.x = Math.PI / 2;
      distressMarker.add(ring);

      const light = new THREE.PointLight(markerColor, 2.5, 6);
      distressMarker.add(light);
      group.add(distressMarker);
    } else {
      // Rescued happy aura
      const aura = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.9, 16),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      );
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.05;
      group.add(aura);
    }

    this.plazaGroup.add(group);
    this.residentMeshes.set(res.id, group);
  }

  private spawnPlazaDebris(isRestored: boolean) {
    if (isRestored) return;

    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    for (let i = 0; i < 25; i++) {
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.8),
        rubbleMat
      );
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 18;
      chunk.position.set(Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius);
      chunk.rotation.set(Math.random(), Math.random(), Math.random());
      chunk.castShadow = true;
      this.plazaDebrisGroup.add(chunk);
    }
  }

  /**
   * Visually advances a resident's healing stage with animations and particles
   */
  public animateResidentHealingStage(residentId: string, stage: number, healthPercent: number) {
    const group = this.residentMeshes.get(residentId);
    if (!group) return;

    const body = group.getObjectByName('resident_body') as THREE.Mesh;
    const head = group.getObjectByName('resident_head') as THREE.Mesh;
    const armL = group.getObjectByName('arm_l') as THREE.Mesh;
    const armR = group.getObjectByName('arm_r') as THREE.Mesh;
    const bandage = group.getObjectByName('bandage') as THREE.Mesh;

    if (bandage) bandage.visible = true;

    if (stage === 1) {
      // Sitting up, stabilized
      if (body) {
        body.rotation.z = Math.PI / 8;
        body.position.y = 0.6;
        (body.material as THREE.MeshStandardMaterial).color.set(0xf59e0b);
      }
      if (head) head.position.y = 1.1;
      if (armL) (armL.material as THREE.MeshStandardMaterial).color.set(0xf59e0b);
      if (armR) (armR.material as THREE.MeshStandardMaterial).color.set(0xf59e0b);
    } else if (stage >= 2 || healthPercent >= 100) {
      // Fully standing up and waving!
      this.animateResidentRescued(residentId);
    }

    // Spawn green healing sparkle fountain
    this.spawnHealingParticles(group.position);
    this.sendRoseToTarget(group.position.x, group.position.z, 'HEAL');
  }

  /**
   * Visually advances a building's construction phase with scaffolding and particles
   */
  public animateBuildingRepairPhase(buildingId: string, phaseIndex: number, integrity: number) {
    const group = this.buildingMeshes.get(buildingId);
    if (!group) return;

    const structure = group.getObjectByName('structure') as THREE.Mesh;
    const windows = group.getObjectByName('windows') as THREE.Mesh;
    const scaffolding = group.getObjectByName('scaffolding_group') as THREE.Group;
    const baseRubble = group.getObjectByName('base_rubble') as THREE.Group;

    if (phaseIndex === 1) {
      // Phase 1: Scaffolding erected, rubble cleared
      if (scaffolding) scaffolding.visible = true;
      if (baseRubble) baseRubble.visible = false;
      if (structure) {
        (structure.material as THREE.MeshStandardMaterial).color.set(0x64748b);
      }
    } else if (phaseIndex === 2) {
      // Phase 2: Pristine walls, illuminated windows
      if (scaffolding) scaffolding.visible = true;
      if (structure) {
        (structure.material as THREE.MeshStandardMaterial).color.set(0x94a3b8);
      }
      if (windows) {
        const mat = windows.material as THREE.MeshStandardMaterial;
        mat.color.set(0xfef08a);
        mat.emissive.set(0xfef08a);
        mat.emissiveIntensity = 0.5;
      }
    } else if (phaseIndex >= 3 || integrity >= 100) {
      // Complete!
      this.animateBuildingRepaired(buildingId);
    }

    // Spawn welding spark burst
    const sparkPos = new THREE.Vector3(group.position.x, 3.5, group.position.z + 4);
    this.spawnWeldingParticles(sparkPos);
    this.sendRoseToTarget(group.position.x, group.position.z + 4, 'REPAIR');
  }

  /**
   * Moves Rose character to a target location in the plaza with working laser/tool effect
   */
  public sendRoseToTarget(targetX: number, targetZ: number, actionType: 'HEAL' | 'REPAIR') {
    if (!this.characterMesh) return;
    this.roseTargetPos = new THREE.Vector3(targetX + (actionType === 'REPAIR' ? 2 : 1), 0, targetZ + 1.5);
    this.roseIsInteracting = true;
    this.roseActionTimer = 1.8; // 1.8 seconds interaction beam

    // Create laser / tool beam between Rose and target
    if (this.activeLaserBeam) {
      this.plazaGroup.remove(this.activeLaserBeam);
    }

    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(this.characterMesh.position.x, 1.2, this.characterMesh.position.z),
      new THREE.Vector3(targetX, 1.0, targetZ)
    ]);
    const beamColor = actionType === 'HEAL' ? 0x22c55e : 0x38bdf8;
    const beamMat = new THREE.LineBasicMaterial({ color: beamColor, linewidth: 3 });
    this.activeLaserBeam = new THREE.Line(beamGeo, beamMat);
    this.plazaGroup.add(this.activeLaserBeam);
  }

  /**
   * Spawns rising green healing particle burst
   */
  private spawnHealingParticles(pos: THREE.Vector3) {
    const count = 35;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];
    const lifespans: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = pos.y + 0.3 + Math.random() * 0.5;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 1.5;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        1.5 + Math.random() * 2.0,
        (Math.random() - 0.5) * 1.2
      ));
      lifespans.push(1.2 + Math.random() * 0.6);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.25,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geo, mat);
    this.plazaGroup.add(points);

    this.activeParticles.push({
      mesh: points,
      velocities,
      lifespans,
      maxLife: 1.8,
      color: new THREE.Color(0x4ade80),
    });
  }

  /**
   * Spawns bright orange/yellow welding sparks burst
   */
  private spawnWeldingParticles(pos: THREE.Vector3) {
    const count = 45;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];
    const lifespans: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.5;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 3.5,
        (Math.random() - 0.5) * 4.0
      ));
      lifespans.push(0.8 + Math.random() * 0.5);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.2,
      transparent: true,
      opacity: 1.0,
    });
    const points = new THREE.Points(geo, mat);
    this.plazaGroup.add(points);

    this.activeParticles.push({
      mesh: points,
      velocities,
      lifespans,
      maxLife: 1.3,
      color: new THREE.Color(0xf59e0b),
    });
  }

  /**
   * Spawns multi-colored celebratory confetti in restored plaza
   */
  public spawnCelebrationConfetti(pos: THREE.Vector3) {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];
    const lifespans: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x + (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = pos.y + 6 + Math.random() * 6;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 10;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        -1.0 - Math.random() * 1.5,
        (Math.random() - 0.5) * 1.5
      ));
      lifespans.push(3.0 + Math.random() * 2.0);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geo, mat);
    this.plazaGroup.add(points);

    this.activeParticles.push({
      mesh: points,
      velocities,
      lifespans,
      maxLife: 5.0,
      color: new THREE.Color(0x38bdf8),
    });
  }

  /**
   * Raycast click helper to detect clicking on a resident or building in the 3D scene
   */
  public raycastPlazaClick(
    clientX: number,
    clientY: number,
    onSelectResident: (residentId: string) => void,
    onSelectBuilding: (buildingId: string) => void
  ) {
    const target = this.raycastPlazaTarget(clientX, clientY);
    if (target) {
      if (target.type === 'resident') {
        onSelectResident(target.id);
      } else if (target.type === 'building') {
        onSelectBuilding(target.id);
      }
    }
  }

  /**
   * Raycast helper to detect what 3D object is under a screen coordinate (for drag-and-drop & hover)
   */
  public raycastPlazaTarget(clientX: number, clientY: number): { type: 'resident' | 'building'; id: string } | null {
    if (this.currentMode !== 'PLAZA') return null;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.plazaGroup.children, true);

    for (const hit of intersects) {
      let current: THREE.Object3D | null = hit.object;
      while (current && current !== this.plazaGroup) {
        if (current.userData && current.userData.type) {
          if (current.userData.type === 'resident' || current.userData.type === 'building') {
            return {
              type: current.userData.type as 'resident' | 'building',
              id: current.userData.id,
            };
          }
        }
        current = current.parent;
      }
    }
    return null;
  }

  /**
   * Visually transforms a building when repaired (pristine walls, glowing windows, tree sprouts)
   */
  public animateBuildingRepaired(buildingId: string) {
    const group = this.buildingMeshes.get(buildingId);
    if (!group) return;

    const structure = group.getObjectByName('structure') as THREE.Mesh;
    if (structure) {
      (structure.material as THREE.MeshStandardMaterial).color.set(0xf8fafc);
      (structure.material as THREE.MeshStandardMaterial).roughness = 0.2;
    }

    const windows = group.getObjectByName('windows') as THREE.Mesh;
    if (windows) {
      const mat = windows.material as THREE.MeshStandardMaterial;
      mat.color.set(0xfef08a);
      mat.emissive.set(0xfef08a);
      mat.emissiveIntensity = 0.9;
    }

    const marker = group.getObjectByName('marker');
    if (marker) {
      group.remove(marker);
    }

    const scaffolding = group.getObjectByName('scaffolding_group');
    if (scaffolding) {
      scaffolding.visible = false;
    }

    // Add decorative restored trees next to repaired building
    const treeTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    treeTrunk.position.set(group.position.x > 0 ? -4 : 4, 1.0, 4);
    this.plazaGroup.add(treeTrunk);

    const treeFoliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 })
    );
    treeFoliage.position.set(group.position.x > 0 ? -4 : 4, 2.8, 4);
    this.plazaGroup.add(treeFoliage);
  }

  /**
   * Visually transforms a resident when rescued (stands up, heals, aura)
   */
  public animateResidentRescued(residentId: string) {
    const group = this.residentMeshes.get(residentId);
    if (!group) return;

    const body = group.getObjectByName('resident_body') as THREE.Mesh;
    if (body) {
      body.rotation.z = 0;
      body.position.y = 0.95;
      (body.material as THREE.MeshStandardMaterial).color.set(0x22c55e);
    }

    const head = group.getObjectByName('resident_head') as THREE.Mesh;
    if (head) {
      head.position.y = 1.55;
    }

    const armL = group.getObjectByName('arm_l') as THREE.Mesh;
    if (armL) {
      armL.position.y = 1.2;
      armL.rotation.z = Math.PI / 4;
      (armL.material as THREE.MeshStandardMaterial).color.set(0x22c55e);
    }

    const armR = group.getObjectByName('arm_r') as THREE.Mesh;
    if (armR) {
      armR.position.y = 1.3;
      armR.rotation.z = -Math.PI / 3; // Waving hand
      (armR.material as THREE.MeshStandardMaterial).color.set(0x22c55e);
    }

    const marker = group.getObjectByName('distress_marker');
    if (marker) {
      group.remove(marker);
    }

    // Add green healing ring on ground
    const aura = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.9, 16),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.05;
    group.add(aura);
  }

  /**
   * Grand Area Restoration Transition (Clears fog, brightens sky, lights turn on)
   */
  public applyFullAreaRestoration(area: DisasterArea) {
    this.targetSkyColor.set(area.restoredSkyColor);
    this.targetFogColor.set(area.restoredFogColor);

    // Clear all rubble
    while (this.plazaDebrisGroup.children.length > 0) {
      this.plazaDebrisGroup.remove(this.plazaDebrisGroup.children[0]);
    }

    // Add glowing streetlamps around the restored plaza
    const lampPositions = [
      [-15, 0, -15],
      [15, 0, -15],
      [-15, 0, 15],
      [15, 0, 15],
      [0, 0, 22],
    ];

    lampPositions.forEach(([x, y, z]) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      pole.position.set(x, 2.5, z);
      this.plazaLightsGroup.add(pole);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 2.0 })
      );
      lamp.position.set(x, 5.0, z);
      this.plazaLightsGroup.add(lamp);

      const light = new THREE.PointLight(0xfef08a, 2.0, 12);
      light.position.set(x, 5.0, z);
      this.plazaLightsGroup.add(light);
    });

    this.ambientLight.intensity = 1.0;
    this.dirLight.intensity = 1.6;

    // Trigger celebration confetti
    this.spawnCelebrationConfetti(new THREE.Vector3(0, 0, 0));
  }

  /**
   * Switch back to Runner Mode when moving to next area
   */
  public switchToRunnerMode() {
    this.plazaGroup.visible = false;
    this.roadGroup.visible = true;
    this.characterMesh.visible = false;
    this.vanMesh.position.set(0, 0, 0);
    this.vanMesh.rotation.set(0, 0, 0);
    this.currentMode = 'RUNNER';

    this.camera.position.set(0, 4.5, 9);
    this.camera.lookAt(0, 1.2, -10);
  }

  /**
   * Main Frame Tick for Physics, Animations, Lighting, Camera Lerp
   */
  public update(
    delta: number,
    playerX: number,
    playerY: number,
    isJumping: boolean,
    isSliding: boolean,
    hasShield: boolean,
    speed: number,
    distanceToStop: number
  ) {
    // 1. Sirens Animation (Alternating red & blue pulsing lights on roof)
    this.sirenTimer += delta * 12;
    const redIntensity = Math.max(0, Math.sin(this.sirenTimer)) * 3.5;
    const blueIntensity = Math.max(0, -Math.sin(this.sirenTimer)) * 3.5;
    this.sirenLightRed.intensity = redIntensity;
    this.sirenLightBlue.intensity = blueIntensity;

    // 2. Active Particles Update
    for (let pIndex = this.activeParticles.length - 1; pIndex >= 0; pIndex--) {
      const emitter = this.activeParticles[pIndex];
      const positions = emitter.mesh.geometry.attributes.position.array as Float32Array;
      let aliveCount = 0;

      for (let i = 0; i < emitter.lifespans.length; i++) {
        if (emitter.lifespans[i] > 0) {
          emitter.lifespans[i] -= delta;
          positions[i * 3] += emitter.velocities[i].x * delta;
          positions[i * 3 + 1] += emitter.velocities[i].y * delta;
          positions[i * 3 + 2] += emitter.velocities[i].z * delta;
          aliveCount++;
        }
      }
      emitter.mesh.geometry.attributes.position.needsUpdate = true;

      if (aliveCount === 0) {
        this.plazaGroup.remove(emitter.mesh);
        this.activeParticles.splice(pIndex, 1);
      }
    }

    if (this.currentMode === 'RUNNER') {
      // Smooth player position & tilt
      this.playerGroup.position.x = playerX;
      this.playerGroup.position.y = playerY;

      // Suspension bounce & banking tilt when switching lanes
      const targetRoll = (playerX - this.playerGroup.position.x) * 0.15;
      this.vanMesh.rotation.z = THREE.MathUtils.lerp(this.vanMesh.rotation.z, -targetRoll, 0.15);

      // Slide deformation (van lowers / squashes slightly during slide)
      if (isSliding) {
        this.vanMesh.scale.set(1.15, 0.55, 1.1);
      } else {
        this.vanMesh.scale.set(1.0, 1.0, 1.0);
      }

      // Jump pitch tilt
      if (isJumping) {
        this.vanMesh.rotation.x = -0.15;
      } else {
        this.vanMesh.rotation.x = Math.sin(Date.now() * 0.015) * 0.02; // Idle engine rumble
      }

      // Shield visibility & rotation
      this.shieldBubble.visible = hasShield;
      if (hasShield) {
        this.shieldBubble.rotation.y += delta * 2;
        this.shieldBubble.rotation.x += delta * 1;
      }

      // Scroll Road Segments seamlessly
      const segmentLength = 80;
      const totalLength = this.roadSegments.length * segmentLength;
      for (let i = 0; i < this.roadSegments.length; i++) {
        const seg = this.roadSegments[i];
        seg.position.z += speed * delta;
        if (seg.position.z > 40) {
          seg.position.z -= totalLength;
        }
      }

      // Rotate storm vortex in the background
      if (this.stormVortexMesh) {
        this.stormVortexMesh.rotation.z += delta * 0.4;
      }

      // Animate floating collectibles (rotation & gentle bobbing)
      this.collectibleMeshes.forEach((mesh) => {
        mesh.rotation.y += delta * 3.0;
      });

      // Camera follows behind player van with dynamic slight lag
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, playerX * 0.6, 0.1);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 4.5 + playerY * 0.5, 0.1);
      this.camera.lookAt(playerX * 0.3, 1.2 + playerY * 0.2, -15);
    } else {
      // In Stop / Plaza Area Mode
      // Animate Rose on-foot walking to target
      if (this.roseTargetPos && this.characterMesh) {
        this.characterMesh.position.lerp(this.roseTargetPos, delta * 4);
        // Face target
        this.characterMesh.lookAt(this.roseTargetPos.x, 0.5, this.roseTargetPos.z);
        // Bobbing walk animation
        this.characterMesh.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.15;
      }

      // Update interaction laser beam timer
      if (this.roseActionTimer > 0) {
        this.roseActionTimer -= delta;
        if (this.roseActionTimer <= 0 && this.activeLaserBeam) {
          this.plazaGroup.remove(this.activeLaserBeam);
          this.activeLaserBeam = null;
        }
      }

      // Animate resident distress markers / waving arms
      this.residentMeshes.forEach((mesh) => {
        const marker = mesh.getObjectByName('distress_marker');
        if (marker) {
          marker.rotation.y += delta * 3.0;
          marker.position.y = 2.2 + Math.sin(Date.now() * 0.005) * 0.2;
        }
        const armR = mesh.getObjectByName('arm_r');
        if (armR && armR.rotation.z < -0.5) {
          // Waving animation for healed resident!
          armR.rotation.z = -Math.PI / 3 + Math.sin(Date.now() * 0.008) * 0.35;
        }
      });

      this.buildingMeshes.forEach((mesh) => {
        const marker = mesh.getObjectByName('marker');
        if (marker) {
          marker.rotation.y += delta * 2.0;
          marker.rotation.x += delta * 1.5;
        }
      });

      // Camera orbit slightly for cinematic feel
      const camAngle = Date.now() * 0.0003;
      this.camera.position.x = Math.sin(camAngle) * 4;
      this.camera.lookAt(0, 2.0, 0);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}

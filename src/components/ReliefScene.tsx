import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { ReliefInk } from './ReliefInk';
import modelUrl from '../../assets/glb/reliefs_high_compressed.glb?url';

const TRAIL_COUNT = 10;
const FRAMING_OFFSET_Y = -1.5;

/** Screen-space feathered reveals preserve the supplied model's baked relief textures. */
export function ReliefScene({ motion, dark = false }: { motion: boolean; dark?: boolean }) {
  const invalidate = useRef(() => {});
  const darkTheme = useRef(dark);
  useEffect(() => { darkTheme.current = dark; invalidate.current(); }, [dark]);
  const host = useRef<HTMLDivElement>(null);
  const enabled = useRef(motion);
  const [status, setStatus] = useState('loading');
  useEffect(() => { enabled.current = motion; invalidate.current(); }, [motion]);
  useEffect(() => {
    const container = host.current!;
    const stage = container.parentElement!;
    const hero = stage.parentElement!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setStatus('fallback'); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-15, 15, 10, -10, .1, 150);
    camera.position.set(0, 0, 60);
    const group = new THREE.Group(); scene.add(group);
    const hemisphere = new THREE.HemisphereLight('#f6faff', '#b8c4d0', 2.5); scene.add(hemisphere);
    const key = new THREE.DirectionalLight('#f3f8ff', 2.7); key.position.set(-10, 10, 12); scene.add(key);
    const fill = new THREE.DirectionalLight('#dceaff', 1.0); fill.position.set(12, -5, 10); scene.add(fill);
    const rim = new THREE.DirectionalLight('#8bd9ef', 0); rim.position.set(10, 4, 5); scene.add(rim);
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    const trails = Array.from({ length: TRAIL_COUNT }, () => new THREE.Vector4(.5, .5, 0, .23));
    const ink = new ReliefInk(renderer);
    const uniforms = {
      uReveal: { value: trails },
      uInk: { value: ink.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uStill: { value: 0 },
      uAmbient: { value: .6 },
      uDark: { value: darkTheme.current ? 1 : 0 },
    };
    const targetTexture = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
    // All supplied atlas textures use RGB 139/139/139 for their flat backing.
    // Render that neutral surface under the same lights, then transfer only the relief's
    // lighting difference onto the shared CSS wall color. A 1x1 pass needs no readback.
    const wallReferenceTarget = new THREE.WebGLRenderTarget(1, 1);
    const referenceScene = new THREE.Scene();
    const referenceCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
    referenceCamera.position.z = 60;
    const referenceGray = new THREE.Color('#8b8b8b');
    const referenceMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#edf4fa').multiply(referenceGray),
      emissive: referenceGray, emissiveIntensity: .08, roughness: .94, metalness: 0,
    });
    const referenceGeometry = new THREE.PlaneGeometry(4, 4);
    const referencePlane = new THREE.Mesh(referenceGeometry, referenceMaterial);
    referenceScene.add(referencePlane);
    const referenceHemisphere = (scene.children.find(o => o instanceof THREE.HemisphereLight) as THREE.HemisphereLight).clone();
    const referenceKey = key.clone();
    referenceScene.add(referenceHemisphere, referenceKey, fill.clone());
    const compositeScene = new THREE.Scene();
    const compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const compositeMaterial = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uScene: { value: targetTexture.texture },
        uWallReference: { value: wallReferenceTarget.texture },
        uWallColor: { value: new THREE.Vector3(246 / 255, 247 / 255, 245 / 255) },
      },
      transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv; uniform sampler2D uScene; uniform sampler2D uWallReference; uniform vec3 uWallColor;
        uniform vec4 uReveal[${TRAIL_COUNT}]; uniform sampler2D uInk; uniform vec2 uResolution; uniform float uStill; uniform float uAmbient; uniform float uDark;
        void main() {
          float aspect = uResolution.x / uResolution.y;
          float reveal = 0.0;
          for (int i = 0; i < ${TRAIL_COUNT}; i++) {
            vec2 delta = (vUv - uReveal[i].xy) * vec2(aspect, 1.0);
            float radius = uReveal[i].w;
            float feather = 1.0 - smoothstep(radius * 0.15, radius, length(delta));
            float envelope = uReveal[i].z * (1.0 - smoothstep(0.82, 1.0, uReveal[i].z));
            reveal = max(reveal, feather * envelope);

          }
          vec2 stillDelta = (vUv - vec2(0.5, 0.55)) * vec2(aspect, 1.0);
          float centralRelief = 1.0 - smoothstep(0.15, 0.62, length(stillDelta));
          reveal = max(reveal, centralRelief * uAmbient);
          reveal = mix(reveal, centralRelief * 0.72, uStill);
          gl_FragColor = texture2D(uScene, vUv);
          // Match the light theme's quiet central presence. Only pointer trails
          // reveal the sides; their visibility returns fully to the navy wall.
          float stroke = texture2D(uInk, vUv).b;
          float darkFocus = smoothstep(0.015, 0.78, stroke);
          float centralPresence = centralRelief * uAmbient;
          float joinedPresence = pow(pow(centralPresence, 6.0) + pow(darkFocus * 0.98, 6.0), 1.0 / 6.0);
          float darkReveal = mix(clamp(joinedPresence, 0.0, 1.0), centralRelief * 0.45, uStill);
          // Both themes share the persistent ink field. White retains its existing
          // central/idle presence, smoothly merged with the same continuous brush.
          float lightPresence = pow(pow(clamp(reveal, 0.0, 1.0), 6.0)
            + pow(darkFocus * 0.98, 6.0), 1.0 / 6.0);
          float lightReveal = mix(clamp(lightPresence, 0.0, 1.0), centralRelief * 0.72, uStill);
          gl_FragColor.a *= mix(lightReveal, darkReveal, uDark);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          vec3 neutralWall = texture2D(uWallReference, vec2(0.5)).rgb;
          #if defined(TONE_MAPPING)
            neutralWall = toneMapping(neutralWall);
          #endif
          neutralWall = linearToOutputTexel(vec4(neutralWall, 1.0)).rgb;
          vec3 reliefShading = gl_FragColor.rgb - neutralWall;
          vec3 lightRelief = clamp(uWallColor + reliefShading, 0.0, 1.0);
          // Preserve continuous sculpted surfaces instead of keying alpha from
          // brightness: neutral crossings must not cut black lines into petals.
          vec3 porcelain = pow(clamp(gl_FragColor.rgb, 0.0, 1.0), vec3(1.12));
          porcelain = clamp((porcelain - 0.42) * 1.16 + 0.46, 0.0, 1.0);
          porcelain = clamp(porcelain * mix(0.94, 1.07, darkFocus * (1.0 - uStill)), 0.0, 1.0);
          gl_FragColor.rgb = mix(lightRelief, porcelain, uDark);
        }`,
    });
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    compositeScene.add(new THREE.Mesh(quadGeometry, compositeMaterial));
    const draco = new DRACOLoader(); draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    let destroyed = false, frame = 0, visible = true, dirty = true;
    let render: (now: number) => void;
    const wake = () => {
      dirty = true;
      if (!destroyed && !frame && visible && !document.hidden) frame = requestAnimationFrame(now => render(now));
    };
    invalidate.current = wake;
    let sceneDirty = true;
    const previousScene = [NaN, NaN, NaN, NaN];
    let width = 1, height = 1;
    let scrollTarget = 0, scrollPosition = 0, lastScrollPosition = 0;
    let startY = 1.2, endY = -49.6;
    let loaded = false, loadedAt = 0;
    const updateScroll = () => {
      const bounds = hero.getBoundingClientRect();
      scrollTarget = THREE.MathUtils.clamp(-bounds.top / Math.max(hero.offsetHeight - stage.offsetHeight, 1), 0, 1);
      stage.style.setProperty('--journey-progress', String(scrollTarget));
      wake();
    };
    let elapsed = 0, lastInput = -10, trailIndex = 0, lastFrame = 0, nextIdle = 0;
    const pointer = new THREE.Vector2(.5, .55);
    const target = pointer.clone();
    let pointerInside = false;
    const collectMaterial = (m: THREE.Material) => {
      materials.add(m);
      Object.values(m).forEach(v => { if (v instanceof THREE.Texture) textures.add(v); });
    };
    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (width === bounds.width && height === bounds.height) { updateScroll(); return; }
      width = bounds.width; height = bounds.height;
      sceneDirty = true;
      renderer.setSize(width, height);
      renderer.getDrawingBufferSize(uniforms.uResolution.value);
      targetTexture.setSize(uniforms.uResolution.value.x, uniforms.uResolution.value.y);
      ink.resize(width,height);
      const aspect = width / Math.max(height, 1);
      // Frame the top bird panel, not the center of the full 60-unit-tall atlas.
      // On narrow screens preserve the full central panel; on desktop keep adjacent reliefs visible.
      const viewHeight = Math.max(13.5, 14 / aspect);
      camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      updateScroll();
      dirty = true;
    };
    loader.load(modelUrl, gltf => {
      if (destroyed) {
        gltf.scene.traverse(o => { if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(collectMaterial);
        } });
        materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); return;
      }
      gltf.scene.traverse(o => {
        if (!(o instanceof THREE.Mesh)) return;
        o.geometry.computeBoundingBox();
        const bounds = o.geometry.boundingBox!;
        const geometryBounds = new THREE.Vector4(bounds.min.x, bounds.min.y, bounds.max.x, bounds.max.y);
        // Each cropped atlas panel needs its own bounds, even when it shares source material.
        const sourceMaterials = Array.isArray(o.material) ? o.material : [o.material];
        const featheredMaterials = sourceMaterials.map(source => {
          collectMaterial(source);
          if (!(source instanceof THREE.MeshStandardMaterial)) return source;
          const m = source.clone(); collectMaterial(m);
          m.color.set('#edf4fa'); m.roughness = .94; m.metalness = 0; m.emissiveIntensity = .08;
          m.transparent = false; m.depthWrite = true;
          m.onBeforeCompile = shader => {
            shader.uniforms.uPanelBounds = { value: geometryBounds };
            shader.uniforms.uReliefDark = uniforms.uDark;
            shader.uniforms.uReliefNeutral = { value: referenceMaterial.color };
            const varyings = 'varying float vReliefHeight; varying float vReliefSlope; varying vec2 vReliefXY;\n';
            shader.vertexShader = varyings + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
              '#include <begin_vertex>\n vReliefHeight = position.z; vReliefXY = position.xy; vReliefSlope = 1.0 - abs(normalize(normal).z);');
            shader.fragmentShader = 'uniform vec4 uPanelBounds; uniform float uReliefDark; uniform vec3 uReliefNeutral;\n' + varyings + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader
              .replace('#include <color_fragment>', `
                #include <color_fragment>
                float sourceCarving = smoothstep(0.012, 0.065, length(diffuseColor.rgb - uReliefNeutral));
                diffuseColor.rgb *= mix(vec3(1.0), vec3(2.15, 2.25, 2.38), uReliefDark);
              `)
              .replace('#include <roughnessmap_fragment>', `
                #include <roughnessmap_fragment>
                roughnessFactor = mix(roughnessFactor, 0.28, uReliefDark);
              `)
              .replace('#include <metalnessmap_fragment>', `
                #include <metalnessmap_fragment>
                metalnessFactor = mix(metalnessFactor, 0.22, uReliefDark);
              `);
            shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
              // Restrained cyan Fresnel at grazing angles, directional and local.
              float grazing = pow(1.0 - clamp(abs(normal.z), 0.0, 1.0), 3.0);
              float rimFacing = 0.35 + 0.65 * max(dot(normal, normalize(vec3(0.8, 0.3, 0.4))), 0.0);
              outgoingLight += vec3(0.12, 0.55, 0.72) * grazing * rimFacing * 0.24 * uReliefDark;
              #include <opaque_fragment>
              float raisedDetail = smoothstep(0.02, 0.105, vReliefHeight);
              float recessedDetail = smoothstep(0.015, 0.13, vReliefSlope)
                * smoothstep(-0.06, 0.025, vReliefHeight) * 0.72;
              vec2 toEdge = min(vReliefXY - uPanelBounds.xy, uPanelBounds.zw - vReliefXY);
              vec2 edgeWidth = min(vec2(1.25, 0.9), (uPanelBounds.zw - uPanelBounds.xy) * 0.22);
              vec2 feather = smoothstep(vec2(0.0), edgeWidth, toEdge);
              float croppedEdge = feather.x * feather.y;
              // The flat slab ends inside the decorative silhouettes. Fade its top AND bottom;
              // taller petals/branches can extend beyond it, while crop edges always feather.
              float backingTop = 1.0 - smoothstep(3.0, 4.5, vReliefXY.y);
              float backingBottom = smoothstep(-4.65, -3.15, vReliefXY.y);
              float backingEdge = backingTop * backingBottom;
              float backingVisibility = mix(backingEdge, 1.0, smoothstep(0.09, 0.22, vReliefHeight));
              gl_FragColor.a *= max(raisedDetail, recessedDetail) * croppedEdge * backingVisibility;
              float darkCarving = max(smoothstep(0.035, 0.09, vReliefHeight), sourceCarving * smoothstep(0.005, 0.025, vReliefHeight));
              gl_FragColor.a *= mix(1.0, darkCarving, uReliefDark);
            `);
          };
          m.customProgramCacheKey = () => 'relief-porcelain-cyan-v14';
          return m;
        });
        o.material = Array.isArray(o.material) ? featheredMaterials : featheredMaterials[0];
      });
      gltf.scene.updateMatrixWorld(true);
      // Keep authored coordinates: bird_01 is at the top, followed by deer, dragonflies,
      // squirrel, peacock and frog in descending rows. Never center the whole atlas.
      const bird = gltf.scene.getObjectByName('bird_01');
      const frog = gltf.scene.getObjectByName('frog_01');
      if (bird) {
        const center = new THREE.Box3().setFromObject(bird).getCenter(new THREE.Vector3());
        camera.position.x = center.x;
        startY = center.y + 1.2;
      }
      if (frog) endY = new THREE.Box3().setFromObject(frog).getCenter(new THREE.Vector3()).y;
      group.add(gltf.scene); resize();
      scrollPosition = scrollTarget;
      camera.position.y = THREE.MathUtils.lerp(startY, endY, scrollPosition) + FRAMING_OFFSET_Y;
      loaded = true; loadedAt = elapsed;
      setStatus('ready'); sceneDirty = true; wake();
    }, undefined, () => { if (!destroyed) setStatus('fallback'); });
    const observer = new ResizeObserver(resize); observer.observe(container); observer.observe(hero); resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }); intersection.observe(container);
    const move = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button,a')) return;
      const rect = container.getBoundingClientRect();
      target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
      if (e.pointerType === 'touch' && e.type === 'pointerdown') pointer.copy(target);
      pointerInside = true; lastInput = elapsed; wake();
    };
    const leave = () => { pointerInside = false; wake(); };
    const touchEnd = (e: PointerEvent) => { if (e.pointerType !== 'mouse') leave(); };
    const visibilityChange = () => { if (!document.hidden) { lastFrame = performance.now(); wake(); } };
    document.addEventListener('visibilitychange', visibilityChange);
    hero.addEventListener('pointerup', touchEnd, { passive: true });
    hero.addEventListener('pointercancel', leave, { passive: true });
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerdown', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    const stamp = (x: number, y: number, strength: number, radius: number) => {
      trails[trailIndex].set(x, y, strength, radius);
      trailIndex = (trailIndex + 1) % TRAIL_COUNT;
    };
    let wasMoving = true;
    render = (now: number) => {
      frame = 0;
      const dt = Math.min((now - lastFrame) / 1000 || .016, .05); lastFrame = now;
      if (!visible || document.hidden) return;
      const themeTarget = darkTheme.current ? 1 : 0;
      if (Math.abs(uniforms.uDark.value - themeTarget) > .001) {
        uniforms.uDark.value = enabled.current
          ? THREE.MathUtils.lerp(uniforms.uDark.value, themeTarget, 1 - Math.exp(-dt * 4))
          : themeTarget;
        dirty = true;
      }
      const darkBlend = uniforms.uDark.value;
      hemisphere.intensity = THREE.MathUtils.lerp(2.5, 0.85, darkBlend);
      key.intensity = THREE.MathUtils.lerp(2.7, 4.8, darkBlend);
      fill.intensity = THREE.MathUtils.lerp(1.0, 0.65, darkBlend);
      rim.intensity = darkBlend * 0.85;
      elapsed += dt;
      scrollPosition = enabled.current
        ? THREE.MathUtils.lerp(scrollPosition, scrollTarget, 1 - Math.exp(-dt * 9))
        : scrollTarget;
      if (Math.abs(scrollPosition - lastScrollPosition) > .00001) dirty = true;
      const scrollSpeed = Math.abs(scrollPosition - lastScrollPosition) / Math.max(dt, .001);
      lastScrollPosition = scrollPosition;
      camera.position.y = THREE.MathUtils.lerp(startY, endY, scrollPosition) + FRAMING_OFFSET_Y;
      // A quiet central reveal establishes the bird composition immediately. Scrolling
      // opens the relief further so each successive row is readable without moving the mouse.
      const opening = loaded ? Math.min((elapsed - loadedAt) / 1.5, 1) : 0;
      const ambientTarget = (.32 + Math.min(scrollSpeed * 5, THREE.MathUtils.lerp(.42, .08, uniforms.uDark.value))) * opening;
      uniforms.uAmbient.value += (ambientTarget - uniforms.uAmbient.value) * (1 - Math.exp(-dt * 5));
      if (enabled.current) {
        uniforms.uStill.value = 0;
        trails.forEach(t => { t.z *= Math.exp(-dt * THREE.MathUtils.lerp(.72, .50, uniforms.uDark.value)); });
        pointer.lerp(target, 1 - Math.exp(-dt * 18));
        if (!darkTheme.current && elapsed - lastInput > 1.8 && elapsed > nextIdle) {
          // Stagger quiet blooms; they expire through the same trail system.
          stamp(.28 + Math.random() * .44,
            .3 + Math.random() * .4, .99, .24 + Math.random() * .13);
          nextIdle = elapsed + 1.7 + Math.random() * 1.3;
        }
        group.rotation.y += ((pointer.x - .5) * .022 - group.rotation.y) * .035;
        key.position.x += (-10 + (pointer.x - .5) * 3 - key.position.x) * .025;
        wasMoving = true;
      } else if (wasMoving) {
        uniforms.uStill.value = 1; group.rotation.set(0, 0, 0); key.position.x = -10;
        dirty = true; wasMoving = false;
      }
      if (enabled.current || dirty) {
        ink.update(dt,pointer,enabled.current && pointerInside && elapsed-lastInput < .18,
          enabled.current);
        uniforms.uInk.value = ink.texture;
        referenceKey.position.copy(key.position);
        referencePlane.rotation.copy(group.rotation);
        const cameraY = camera.position.y, rotationY = group.rotation.y, lightX = key.position.x;
        if (sceneDirty || Math.abs(cameraY - previousScene[0]) > .00001 ||
          Math.abs(rotationY - previousScene[1]) > .00001 || Math.abs(lightX - previousScene[2]) > .00001 ||
          Math.abs(darkBlend - previousScene[3]) > .00001 || Number.isNaN(previousScene[0])) {
          if (darkBlend < .999) {
            renderer.setRenderTarget(wallReferenceTarget); renderer.render(referenceScene, referenceCamera);
          }
          renderer.setRenderTarget(targetTexture); renderer.render(scene, camera);
          previousScene[0] = cameraY; previousScene[1] = rotationY; previousScene[2] = lightX; previousScene[3] = darkBlend;
          sceneDirty = false;
        }
        renderer.setRenderTarget(null); renderer.render(compositeScene, compositeCamera); dirty = false;
      }
      if (enabled.current && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(render);
    }; wake();
    return () => {
      destroyed = true; invalidate.current = () => {}; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', visibilityChange);
      hero.removeEventListener('pointerup', touchEnd); hero.removeEventListener('pointercancel', leave);
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerdown', move); hero.removeEventListener('pointerleave', leave);
      draco.dispose(); group.traverse(o => { if (o instanceof THREE.Mesh) o.geometry.dispose(); });
      materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      wallReferenceTarget.dispose(); referenceMaterial.dispose(); referenceGeometry.dispose();
      targetTexture.dispose(); quadGeometry.dispose(); compositeMaterial.dispose(); ink.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <div className={`relief-scene ${status}`} ref={host} aria-hidden="true"><div className="relief-fallback"/><span className="model-status">{status === 'loading' ? 'LOADING SCULPTURE' : status === 'fallback' ? '静态视觉模式' : ''}</span></div>;
}

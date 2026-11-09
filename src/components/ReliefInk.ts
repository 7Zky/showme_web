import * as THREE from 'three';

/** A small, persistent velocity/ink field; never stores or moves the relief itself. */
export class ReliefInk {
  private read = this.makeTarget();
  private write = this.makeTarget();
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private geometry = new THREE.PlaneGeometry(2, 2);
  private previous = new THREE.Vector2(.5, .5);
  private drawing = false;
  private active = false;
  private brushRadius = .13;
  private aspect = 1;
  private remaining = 0;
  private uniforms = {
    uField: { value: this.read.texture },
    uTexel: { value: new THREE.Vector2(1, 1) },
    uStart: { value: new THREE.Vector2(.5, .5) },
    uEnd: { value: new THREE.Vector2(.5, .5) },
    uRadius: { value: new THREE.Vector2(.13, .13) },
    uVelocity: { value: new THREE.Vector2() },
    uAspect: { value: 1 },
    uDt: { value: 1 / 60 },
    uPaint: { value: 0 },
    uTime: { value: 0 },
  };
  private material = new THREE.ShaderMaterial({
    uniforms: this.uniforms, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uField;
      uniform vec2 uTexel, uStart, uEnd, uRadius, uVelocity;
      uniform float uAspect, uDt, uPaint, uTime;
      void main(){
        vec3 old = texture2D(uField, vUv).rgb;
        // Semi-Lagrangian transport gives the wake inertia independent of sampling.
        vec2 drift = vec2(sin(vUv.y*19.0+uTime*.27), cos(vUv.x*17.0-uTime*.21));
        vec2 back = vUv - (old.xy + drift * old.z * .0012) * uDt;
        vec3 field = texture2D(uField, back).rgb;
        vec3 nearby = (texture2D(uField, back+vec2(uTexel.x,0.)).rgb
          + texture2D(uField, back-vec2(uTexel.x,0.)).rgb
          + texture2D(uField, back+vec2(0.,uTexel.y)).rgb
          + texture2D(uField, back-vec2(0.,uTexel.y)).rgb) * .25;
        field = mix(field, nearby, 1.0-exp(-uDt*5.0));
        vec2 velocity = field.xy * exp(-uDt*2.8);
        float density = field.z * exp(-uDt*.68);
        vec2 ratio = vec2(uAspect,1.0);
        vec2 segment = (uEnd-uStart)*ratio;
        vec2 fromStart = (vUv-uStart)*ratio;
        float t = clamp(dot(fromStart,segment)/max(dot(segment,segment),.000001),0.,1.);
        float radius = mix(uRadius.x,uRadius.y,t);
        float d = length(fromStart-segment*t)/max(radius,.001);
        // A tapered capsule injects a whole continuous stroke, with a broad soft edge.
        float brush = exp(-d*d*3.5)*(1.0-smoothstep(.72,1.25,d));
        float paint = 1.0-exp(-brush*uPaint*uDt*20.0);
        density = 1.0-(1.0-density)*(1.0-paint);
        velocity = mix(velocity,uVelocity*.055,paint*.55);
        gl_FragColor=vec4(velocity,clamp(density,0.,1.),1.);
      }`,
  });
  constructor(private renderer: THREE.WebGLRenderer) {
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
  }
  private makeTarget() {
    return new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: false, stencilBuffer: false,
    });
  }
  get texture() { return this.read.texture; }
  resize(width: number, height: number) {
    const scale = Math.min(1, 768 / Math.max(width, height));
    const w = Math.max(2, Math.round(width * scale)), h = Math.max(2, Math.round(height * scale));
    if (this.read.width === w && this.read.height === h && this.aspect === width / Math.max(height,1)) return;
    this.read.setSize(w, h); this.write.setSize(w, h);
    this.aspect = width / Math.max(height, 1);
    this.uniforms.uAspect.value = this.aspect;
    this.uniforms.uTexel.value.set(1 / w, 1 / h);
    this.clear();
  }
  private clear() {
    const oldTarget = this.renderer.getRenderTarget();
    for (const target of [this.read, this.write]) {
      this.renderer.setRenderTarget(target); this.renderer.clear();
    }
    this.renderer.setRenderTarget(oldTarget);
    this.drawing = false; this.remaining = 0;
  }
  update(dt: number, pointer: THREE.Vector2, drawing: boolean, active: boolean) {
    if (!active) { this.active = false; this.drawing = false; return; }
    if (!this.active) this.clear();
    this.active = true;
    if (drawing) this.remaining = 12;
    else if (this.remaining > 0) {
      this.remaining -= dt;
      if (this.remaining <= 0) this.clear();
    }
    if (this.remaining <= 0) { this.previous.copy(pointer); this.drawing = false; return; }
    const connected = drawing && this.drawing;
    this.uniforms.uStart.value.copy(connected ? this.previous : pointer);
    this.uniforms.uEnd.value.copy(pointer);
    const velocity = this.uniforms.uVelocity.value;
    velocity.copy(pointer).sub(connected ? this.previous : pointer).divideScalar(Math.max(dt,.001));
    const speed = Math.hypot(velocity.x*this.aspect,velocity.y);
    if (speed > 5) velocity.multiplyScalar(5/speed);
    const desiredRadius = .12 + Math.min(speed*.035,.075);
    const nextRadius = THREE.MathUtils.lerp(this.brushRadius,desiredRadius,1-Math.exp(-dt*9));
    this.uniforms.uRadius.value.set(connected ? this.brushRadius : nextRadius,nextRadius);
    this.brushRadius = nextRadius;
    this.uniforms.uPaint.value = drawing ? .85 + Math.min(speed*.25,.55) : 0;
    this.uniforms.uDt.value = dt;
    this.uniforms.uTime.value += dt;
    this.uniforms.uField.value = this.read.texture;
    const oldTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.write); this.renderer.render(this.scene,this.camera);
    this.renderer.setRenderTarget(oldTarget);
    [this.read,this.write] = [this.write,this.read];
    this.previous.copy(pointer); this.drawing = drawing;
  }
  dispose() {
    this.read.dispose(); this.write.dispose(); this.geometry.dispose(); this.material.dispose();
  }
}

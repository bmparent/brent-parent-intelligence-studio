import fragment from './fragment.glsl?raw';
import { HERO, heroCrop, heroLight } from './scene';

/** One owner for every graphics resource and listener, including StrictMode remounts. */
export function mountHero(canvas: HTMLCanvasElement, photo: HTMLImageElement, button: HTMLButtonElement) {
  const scene = canvas.parentElement!;
  const stage = scene.closest<HTMLElement>('.ew-cinema')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
  const abort = new AbortController();
  const passive = { passive: true, signal: abort.signal };
  let disposed = false, failed = false, ready = false, visible = false, paused = false;
  let raf = 0, previous = 0, time = 0, slowFrames = 0, lastLight = 0;
  let scale = Math.min(devicePixelRatio || 1, innerWidth <= 760 ? 1.15 : 1.5);
  let frames = 0, elapsed = 0;
  const wakes = new Float32Array(48);
  let wakeIndex = 0, lastWake = -10, lastPoint: number[] | null = null;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null, texture: WebGLTexture | null = null;
  const shaders: WebGLShader[] = [];
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const restricted = () => reduced.matches || forced.matches || !!connection?.saveData;
  const running = () => ready && !failed && !disposed && !paused && !restricted() && visible && !document.hidden;

  function light() {
    stage.dispatchEvent(new CustomEvent('hero-light', { detail: heroLight(canvas.getBoundingClientRect(), time) }));
  }
  function labels() {
    button.hidden = !ready || failed || restricted();
    button.textContent = paused ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-label', paused ? 'Play hero animation' : 'Pause hero animation');
    scene.dataset.motion = failed ? 'unavailable' : restricted() ? 'static' : paused ? 'paused' : running() ? 'playing' : 'suspended';
    scene.classList.toggle('is-ready', ready && !failed && !restricted());
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; previous = 0; }
  function disposeGraphics() {
    if (!gl) return;
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl!.deleteShader(shader)); shaders.length = 0;
    texture = null; buffer = null; program = null;
  }
  function fallback() { failed = true; ready = false; stop(); disposeGraphics(); labels(); light(); }
  function draw() {
    if (!gl || !ready || failed || disposed || restricted()) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const crop = heroCrop(rect.width, rect.height);
    const w = Math.max(1, Math.round(rect.width * scale)), h = Math.max(1, Math.round(rect.height * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform4f(uniforms.crop, crop.x, crop.y, crop.width, crop.height);
    gl.uniform4fv(uniforms['wakes[0]'], wakes);
    gl.uniform1f(uniforms.t, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    scene.dataset.renderScale = scale.toFixed(2);
  }
  function tick(stamp: number) {
    raf = 0;
    if (!running()) { previous = 0; return; }
    // Use actual elapsed time on slow devices. Reset only across suspension.
    const dt = previous ? (stamp - previous) / 1000 : 0;
    previous = stamp; time += dt;
    if (dt > 0) { frames++; elapsed += dt; }
    slowFrames = dt > .042 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 30 && scale > .5) { scale = Math.max(.5, scale * .8); slowFrames = 0; }
    if (elapsed >= 2) { scene.dataset.measuredFps = (frames / elapsed).toFixed(1); frames = 0; elapsed = 0; }
    draw();
    if (stamp - lastLight > 80) { light(); lastLight = stamp; }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    if (!restricted() && !ready && !failed) initialize();
    if (ready && visible && !document.hidden) draw();
    labels(); light();
    if (running()) raf = requestAnimationFrame(tick);
  }
  function initialize() {
    if (disposed || ready || failed || restricted() || !photo.complete || !photo.naturalWidth) return;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
      if (!gl) { fallback(); return; }
      const compile = (type: number, source: string) => {
        const shader = gl!.createShader(type);
        if (!shader) throw new Error('Shader allocation failed');
        shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error('Hero shader compilation failed');
        return shader;
      };
      program = gl.createProgram();
      if (!program) throw new Error('Program allocation failed');
      gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 a; varying vec2 uv; void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}'));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Hero shader link failed');
      gl.useProgram(program);
      buffer = gl.createBuffer(); texture = gl.createTexture();
      if (!buffer || !texture) throw new Error('Graphics allocation failed');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const attribute = gl.getAttribLocation(program, 'a');
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      for (const key of ['t', 'amount', 'water', 'light', 'crop', 'wakes[0]']) uniforms[key] = gl.getUniformLocation(program, key);
      gl.uniform1f(uniforms.amount, HERO.motion); gl.uniform1f(uniforms.water, HERO.water); gl.uniform1f(uniforms.light, HERO.light);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      for (const wrap of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, wrap, gl.CLAMP_TO_EDGE);
      for (const filter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, filter, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
      if (gl.getError() !== gl.NO_ERROR) throw new Error('Hero texture unavailable');
      ready = true; draw();
    } catch { fallback(); }
  }
  function disturb(event: PointerEvent, press = false) {
    if (!running() || (event.target as Element).closest('a,button')) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (event.clientX - rect.left) / rect.width, sy = (event.clientY - rect.top) / rect.height;
    if (sx < 0 || sx > 1 || sy < 0 || sy > 1) { lastPoint = null; return; }
    const crop = heroCrop(rect.width, rect.height), x = crop.x + sx * crop.width, y = crop.y + sy * crop.height;
    if (y < .755 || y > 1) { lastPoint = null; return; }
    const z = 1.35 / (y - .735), wx = (x - .5) * 1.77 * z;
    const travel = lastPoint ? Math.hypot(wx - lastPoint[0], z - lastPoint[1]) : 0;
    if (!press && (time - lastWake < .1 || (lastPoint && travel < .14))) return;
    wakes.set([wx, z, time, press ? .07 : Math.min(.05, .02 + travel * .008)], wakeIndex * 4);
    wakeIndex = (wakeIndex + 1) % 12; lastWake = time; lastPoint = [wx, z];
  }
  button.addEventListener('click', () => { paused = !paused; sync(); }, passive);
  photo.addEventListener('load', sync, passive);
  photo.addEventListener('error', fallback, passive);
  stage.addEventListener('pointermove', event => { if (event.pointerType !== 'touch' || event.buttons) disturb(event); }, passive);
  stage.addEventListener('pointerdown', event => disturb(event, true), passive);
  stage.addEventListener('pointerleave', () => { lastPoint = null; }, passive);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); }, { signal: abort.signal });
  // A lost context remains on the native photo; restoring it never reloads the page.
  document.addEventListener('visibilitychange', sync, passive);
  reduced.addEventListener('change', sync, passive); forced.addEventListener('change', sync, passive);
  connection?.addEventListener('change', sync, passive);
  window.addEventListener('scroll', () => { if (visible) light(); }, passive);
  const resize = new ResizeObserver(() => { if (visible) { draw(); light(); } }); resize.observe(scene);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); intersection.observe(scene);
  sync();
  return () => { disposed = true; stop(); abort.abort(); resize.disconnect(); intersection.disconnect(); disposeGraphics(); scene.classList.remove('is-ready'); };
}

/** A single-pass lake: world-space water, a photographed Himalayan horizon,
 * reflected clouds, wind waves, raindrop rings, and depth-layered drizzle. */
const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D landscape;
uniform sampler2D detailFront;
uniform sampler2D detailRight;
uniform sampler2D detailBack;
uniform sampler2D detailLeft;
uniform vec4 detailReady;
uniform vec2 resolution;
uniform float time;
uniform vec3 camera;
uniform float yaw;
uniform float pitch;
out vec4 color;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
}
float clouds(vec2 p) { return noise(p)*.57+noise(p*2.03+7.)*.28+noise(p*4.1-3.)*.15; }
// The far shore surrounds the lake rather than ending at the sides of a flat
// image. Every horizontal ray intersects the cylindrical horizon in front of it.
vec4 mountainTile(sampler2D tile, vec2 uv, vec2 dx, vec2 dy, float center, float ready) {
  float offset=fract(uv.x-center+.5)-.5;
  float weight=(1.-smoothstep(.115,.15,abs(offset)))*ready;
  vec2 local=vec2(.5+offset/.3,(uv.y-.25)/.29);
  weight*=smoothstep(0.,.09,local.y)*(1.-smoothstep(.975,1.,local.y));
  if(weight<=0.) return vec4(0.);
  vec3 sampleColor=textureGrad(tile,clamp(local,vec2(.001),vec2(.999)),dx/vec2(.3,.29),dy/vec2(.3,.29)).rgb;
  return vec4(sampleColor*weight,weight);
}
vec3 panorama(vec2 uv) {
  float u=fract(uv.x);
  // Unwrap derivatives too: automatic mip selection at atan's discontinuity
  // otherwise samples the entire image and leaves a dark line at the rear.
  vec2 dx=dFdx(uv), dy=dFdy(uv);
  dx.x-=round(dx.x); dy.x-=round(dy.x);
  vec3 base=textureGrad(landscape,vec2(u,clamp(uv.y,.001,.999)),dx,dy).rgb;
  float seam=1.-smoothstep(0.,.018,min(u,1.-u));
  vec3 neighbor=textureGrad(landscape,vec2(clamp(1.-u,.0001,.9999),clamp(uv.y,.001,.999)),dx*vec2(-1,1),dy*vec2(-1,1)).rgb;
  base=mix(base,(base+neighbor)*.5,seam);
  // Each overlapping terrain tile spends its pixels on one mountain view,
  // instead of magnifying a small patch of a whole-sphere image.
  vec4 detail=mountainTile(detailFront,uv,dx,dy,.5,detailReady.x)
             +mountainTile(detailRight,uv,dx,dy,.75,detailReady.y)
             +mountainTile(detailBack,uv,dx,dy,0.,detailReady.z)
             +mountainTile(detailLeft,uv,dx,dy,.25,detailReady.w);
  return mix(base,detail.rgb/max(detail.a,.0001),min(detail.a,1.));
}
vec3 environment(vec3 direction, vec3 origin) {
  float a=max(dot(direction.xz,direction.xz),.000001);
  float b=dot(origin.xz,direction.xz);
  float c=dot(origin.xz,origin.xz)-650.*650.;
  float distanceToShore=(-b+sqrt(max(b*b-a*c,0.)))/a;
  vec3 atShore=origin+direction*distanceToShore;
  vec2 uv=vec2(.5+atan(atShore.x,-atShore.z)/6.2831853,
               .526-atan(atShore.y,650.)/3.14159265);
  vec3 photograph=panorama(uv);
  // Clouds use world coordinates, so their motion also joins across the seam.
  vec2 cloudPosition=direction.xz/max(direction.y+.3,.12);
  float bank=clouds(cloudPosition*.9+vec2(time*.008,-time*.003));
  float sky=smoothstep(.38,.16,uv.y);
  float vapor=smoothstep(.42,.82,bank)*sky*.29;
  photograph=mix(photograph,vec3(.68,.73,.77),vapor);
  // The zenith is a continuous cloudy dome, avoiding equirectangular pole pinching.
  vec3 zenith=mix(vec3(.49,.56,.63),vec3(.71,.76,.80),bank);
  photograph=mix(photograph,zenith,1.-smoothstep(.04,.17,uv.y));
  float mist=exp(-pow((uv.y-.44)/.035,2.))*clouds(atShore.xz*.01+vec2(time*.014,0.))*.13;
  return mix(photograph,vec3(.60,.68,.71),mist);
}
vec2 waterSlope(vec2 p, float distanceToEye) {
  vec2 slope=vec2(0.);
  slope+=vec2(.43,.16)*cos(dot(p,vec2(.43,.16))-time*.78)*.065;
  slope+=vec2(-.22,.76)*cos(dot(p,vec2(-.22,.76))+time*1.13)*.031;
  slope+=vec2(.91,.47)*cos(dot(p,vec2(.91,.47))-time*1.58)*.017;
  float detail=1.-smoothstep(30.,160.,distanceToEye);
  slope+=vec2(2.7,-1.8)*cos(dot(p,vec2(2.7,-1.8))+time*2.05)*.006*detail;
  slope+=vec2(-4.1,3.5)*cos(dot(p,vec2(-4.1,3.5))-time*2.6)*.0025*detail;
  // Expanding impact rings are anchored to the water, so camera travel reveals parallax.
  vec2 tile=p*.52;
  vec2 cell=floor(tile);
  for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) {
    vec2 id=cell+vec2(float(x),float(y));
    vec2 center=id+vec2(hash(id),hash(id+37.));
    vec2 delta=tile-center;
    float radius=length(delta);
    float age=fract(time*.46+hash(id+13.));
    float ring=radius-age*.68;
    float envelope=exp(-abs(ring)*32.)*smoothstep(0.,.08,age)*(1.-age);
    slope+=normalize(delta+vec2(.0001))*cos(ring*95.)*envelope*.027*detail;
  }
  return slope;
}
float rainLayer(vec2 uv,float scale,float speed) {
  vec2 p=vec2(uv.x+uv.y*.29,uv.y)*vec2(62.,8.)*scale;
  p.y+=time*speed;
  vec2 cell=floor(p), f=fract(p);
  float seed=hash(cell);
  float width=max(fwidth(p.x)*.65,.013);
  float line=1.-smoothstep(width,width*2.,abs(f.x-(.2+hash(cell+4.)*.6)));
  float trail=smoothstep(.05,.1,f.y)*(1.-smoothstep(.17,.42,f.y));
  return line*trail*step(.77,seed)*(.35+seed*.65);
}
void main() {
  vec2 screen=(gl_FragCoord.xy-resolution*.5)/resolution.y;
  vec3 forward=vec3(sin(yaw)*cos(pitch),sin(pitch),-cos(yaw)*cos(pitch));
  vec3 right=normalize(cross(forward,vec3(0,1,0)));
  vec3 up=cross(right,forward);
  vec3 ray=normalize(forward*.9+right*screen.x+up*screen.y);
  vec3 result;
  float hit=-camera.y/min(ray.y,-.00001);
  vec3 point=camera+ray*hit;
  if(ray.y<0. && dot(point.xz,point.xz)<648.*648.) {
    vec2 slope=waterSlope(point.xz,hit);
    vec3 normal=normalize(vec3(-slope.x,1.,-slope.y));
    vec3 reflection=reflect(ray,normal);
    reflection.y=abs(reflection.y);
    vec3 reflected=environment(reflection,point);
    float fresnel=.34+.66*pow(1.-max(dot(-ray,normal),0.),4.);
    vec3 glacial=vec3(.045,.28,.31);
    result=mix(glacial,reflected,fresnel);
    float light=pow(max(dot(normal,normalize(vec3(-.5,1.,.3))),0.),20.);
    result+=vec3(.16,.22,.24)*light*.14;
    float haze=smoothstep(110.,650.,hit)*.24;
    result=mix(result,vec3(.37,.50,.54),haze);
  } else {
    result=environment(ray,camera);
  }
  // Two focal depths keep the drizzle fine, sparse, and diagonal.
  vec2 rainUV=gl_FragCoord.xy/resolution.y;
  float rain=rainLayer(rainUV,1.,12.)*.14+rainLayer(rainUV+17.,.61,8.)*.11;
  result=mix(result,vec3(.77,.85,.87),rain);
  float vignette=1.-.13*pow(length(screen*vec2(.65,.8)),1.4);
  color=vec4(result*vignette,1.);
}
`;

export function cameraAt(progress: number, seconds = 0) {
  const p = Math.max(0, Math.min(1, progress));
  const elapsed = Math.max(0, seconds);
  // Advance even between interactions. Approach the far shore smoothly without
  // ever crossing the photographic horizon or looping back to the start.
  const drift = (140 * elapsed) / (elapsed + 60);
  const distance = p * 180 + drift * (1 - p * 0.25);
  return {
    x: 0,
    y: 2.25,
    z: 36 - distance,
    pitch: 0.2 + distance * 0.001,
    yaw: 0,
  };
}

export type LookDirection = { yaw: number; pitch: number };
export type LakeRenderer = {
  draw: (progress: number, seconds: number, look?: LookDirection) => boolean;
  resize: () => void;
  dispose: () => void;
};

export function createLakeRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  detailImages: HTMLImageElement[] = [],
): LakeRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const parallel = gl.getExtension("KHR_parallel_shader_compile");
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const detailTextures = Array.from({ length: 4 }, () => gl.createTexture());
  if (!program || !buffer || !texture || detailTextures.some((t) => !t)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    detailTextures.forEach((t) => gl.deleteTexture(t));
    return null;
  }
  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    detailTextures.forEach((t) => gl.deleteTexture(t));
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
  };
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to allocate landscape shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    let prepared = false;
    const uploaded = [0, 0, 0, 0];
    let uniforms: Record<string, WebGLUniformLocation | null> = {};
    const prepare = () => {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          shaders.map((s) => gl.getShaderInfoLog(s)).join("\n") ||
            "Landscape shader linking failed",
        );
      }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      uniforms = Object.fromEntries(
        ["resolution", "time", "camera", "yaw", "pitch", "detailReady"].map(
          (key) => [key, gl.getUniformLocation(program, key)],
        ),
      );
      gl.uniform1i(gl.getUniformLocation(program, "landscape"), 0);
      ["detailFront", "detailRight", "detailBack", "detailLeft"].forEach(
        (name, i) => {
          gl.activeTexture(gl.TEXTURE1 + i);
          gl.bindTexture(gl.TEXTURE_2D, detailTextures[i]);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255]),
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR_MIPMAP_LINEAR,
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.uniform1i(gl.getUniformLocation(program, name), i + 1);
        },
      );
      prepared = true;
      resize();
    };
    const resize = () => {
      const width = canvas.clientWidth,
        height = canvas.clientHeight;
      const scale = Math.min(
        window.devicePixelRatio || 1,
        1.25,
        (window.matchMedia("(pointer: coarse)").matches ? 1440 : 1920) / width,
        (window.matchMedia("(pointer: coarse)").matches ? 1000 : 1200) / height,
      );
      const nextWidth = Math.max(1, Math.round(width * scale));
      const nextHeight = Math.max(1, Math.round(height * scale));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (prepared)
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };
    resize();
    if (!parallel) prepare();
    return {
      resize,
      draw(progress, seconds, look = { yaw: 0, pitch: 0 }) {
        // Poll compilation without blocking clicks, scrolling, or the first
        // photographic paint. The fallback stays visible until a real frame.
        if (!prepared) {
          if (
            parallel &&
            !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)
          )
            return false;
          prepare();
        }
        for (let i = 0; i < Math.min(4, detailImages.length); i++) {
          const detail = detailImages[i];
          if (uploaded[i] || !detail.complete || !detail.naturalWidth) continue;
          gl.activeTexture(gl.TEXTURE1 + i);
          gl.bindTexture(gl.TEXTURE_2D, detailTextures[i]);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            detail,
          );
          gl.generateMipmap(gl.TEXTURE_2D);
          uploaded[i] = 1;
        }
        gl.uniform4fv(uniforms.detailReady, uploaded);
        const camera = cameraAt(progress, seconds);
        gl.uniform1f(uniforms.time, seconds);
        gl.uniform3f(uniforms.camera, camera.x, camera.y, camera.z);
        gl.uniform1f(uniforms.yaw, camera.yaw + look.yaw);
        gl.uniform1f(
          uniforms.pitch,
          Math.max(-1.48, Math.min(1.48, camera.pitch + look.pitch)),
        );
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        canvas.dataset.cameraZ = camera.z.toFixed(2);
        canvas.dataset.lookYaw = look.yaw.toFixed(3);
        canvas.dataset.lookPitch = look.pitch.toFixed(3);
        canvas.dataset.detailTiles = String(
          uploaded.reduce((a, b) => a + b, 0),
        );
        return true;
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

/** A single-pass lake: world-space water, a photographed Himalayan horizon,
 * reflected clouds, wind waves, raindrop rings, and depth-layered drizzle. */
const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D landscape;
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
vec3 environment(vec3 direction, vec3 origin) {
  float distanceToShore = (-650.-origin.z)/min(direction.z,-.05);
  vec3 atShore = origin+direction*distanceToShore;
  vec2 uv=vec2(.5+atShore.x/1450., .639-atShore.y/604.17);
  vec3 photograph=texture(landscape,clamp(uv,vec2(.001),vec2(.999))).rgb;
  // Cloud banks move independently of the photographed peaks.
  float sky=smoothstep(.52,.05,uv.y);
  float bank=clouds(uv*vec2(5.,8.)+vec2(time*.017,-time*.003));
  float vapor=smoothstep(.42,.82,bank)*sky*.29;
  photograph=mix(photograph,vec3(.68,.73,.77),vapor);
  float mist=exp(-pow((uv.y-.43)/.085,2.))*clouds(uv*vec2(8.,19.)+vec2(time*.011,0.))*.19;
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
  vec3 forward=normalize(vec3(sin(yaw),pitch,-cos(yaw)));
  vec3 right=normalize(cross(forward,vec3(0,1,0)));
  vec3 up=cross(right,forward);
  vec3 ray=normalize(forward*1.16+right*screen.x+up*screen.y);
  vec3 result;
  float hit=-camera.y/min(ray.y,-.00001);
  vec3 point=camera+ray*hit;
  if(ray.y<0. && point.z>-648.) {
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

export function cameraAt(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  return {
    x: Math.sin(p * Math.PI * 1.6) * 34,
    y: 2.25 + Math.sin(p * Math.PI) * 0.3,
    z: 36 - p * 146,
    pitch: 0.1 + p * 0.1,
    yaw: Math.sin(p * Math.PI * 2 - 0.35) * 0.105,
  };
}

export type LakeRenderer = {
  draw: (progress: number, seconds: number) => void;
  resize: () => void;
  dispose: () => void;
};

export function createLakeRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
): LakeRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!program || !buffer || !texture) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    return null;
  }
  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    const uniforms = Object.fromEntries(
      ["resolution", "time", "camera", "yaw", "pitch"].map((key) => [
        key,
        gl.getUniformLocation(program, key),
      ]),
    );
    gl.uniform1i(gl.getUniformLocation(program, "landscape"), 0);
    const resize = () => {
      const width = canvas.clientWidth,
        height = canvas.clientHeight;
      const scale = Math.min(
        window.devicePixelRatio || 1,
        1.25,
        1440 / width,
        1000 / height,
      );
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };
    resize();
    return {
      resize,
      draw(progress, seconds) {
        const camera = cameraAt(progress);
        gl.uniform1f(uniforms.time, seconds);
        gl.uniform3f(uniforms.camera, camera.x, camera.y, camera.z);
        gl.uniform1f(uniforms.yaw, camera.yaw);
        gl.uniform1f(uniforms.pitch, camera.pitch);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

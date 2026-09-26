import { createSkylineTexture } from "./skyline";
import { sceneLighting } from "./daylight";
import { fallbackWeather, type WeatherVisuals } from "./weather";

/** A single-pass lake with independently advected sky, drifting valley mist,
 * moving cloud shadows, reflective water, wind waves, and diagonal drizzle. */
const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D landscape;
uniform sampler2D skyline;
uniform sampler2D cloudTexture;
uniform float skyReady;
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
uniform float daylight;
uniform float twilight;
uniform vec4 weather; // cloud cover, wind, rain, snow
uniform float mist;
uniform float weatherFlow;
out vec4 color;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
}
float clouds(vec2 p) { return noise(p)*.57+noise(p*2.03+7.)*.28+noise(p*4.1-3.)*.15; }
// Ridge masks are tied to the artwork, never to the camera or moving sky.
float skyMask(vec2 uv, float row) {
  float ridge=texture(skyline,vec2(clamp(uv.x,0.,1.),(row+.5)/5.)).r;
  return 1.-smoothstep(ridge-.06,ridge-.012,uv.y);
}
vec3 surround(vec2 uv) {
  float u=fract(uv.x);
  vec2 dx=dFdx(uv), dy=dFdy(uv);
  dx.x-=round(dx.x); dy.x-=round(dy.x);
  vec3 base=textureGrad(landscape,vec2(u,clamp(uv.y,.001,.999)),dx,dy).rgb;
  float seam=1.-smoothstep(0.,.018,min(u,1.-u));
  vec3 neighbor=textureGrad(landscape,vec2(clamp(1.-u,.0001,.9999),clamp(uv.y,.001,.999)),dx*vec2(-1,1),dy*vec2(-1,1)).rgb;
  return mix(base,(base+neighbor)*.5,seam);
}
vec4 mountainTile(sampler2D tile, vec2 uv, vec2 dx, vec2 dy, float center, float ready, float row, out float sky) {
  float offset=fract(uv.x-center+.5)-.5;
  float weight=(1.-smoothstep(.115,.15,abs(offset)))*ready;
  vec2 local=vec2(.5+offset/.3,(uv.y-.25)/.29);
  weight*=smoothstep(0.,.09,local.y)*(1.-smoothstep(.975,1.,local.y));
  sky=0.;
  if(weight<=0.) return vec4(0.);
  sky=skyMask(local,row)*weight;
  vec3 sampleColor=textureGrad(tile,clamp(local,vec2(.001),vec2(.999)),dx/vec2(.3,.29),dy/vec2(.3,.29)).rgb;
  return vec4(sampleColor*weight,weight);
}
vec4 panorama(vec2 uv) {
  vec2 dx=dFdx(uv), dy=dFdy(uv);
  dx.x-=round(dx.x); dy.x-=round(dy.x);
  vec3 base=surround(uv);
  float baseSky=skyMask(vec2(fract(uv.x),uv.y),0.);
  float frontSky, rightSky, backSky, leftSky;
  vec4 detail=mountainTile(detailFront,uv,dx,dy,.5,detailReady.x,1.,frontSky)
             +mountainTile(detailRight,uv,dx,dy,.75,detailReady.y,2.,rightSky)
             +mountainTile(detailBack,uv,dx,dy,0.,detailReady.z,3.,backSky)
             +mountainTile(detailLeft,uv,dx,dy,.25,detailReady.w,4.,leftSky);
  float blend=min(detail.a,1.);
  vec3 terrain=mix(base,detail.rgb/max(detail.a,.0001),blend);
  float sky=mix(baseSky,(frontSky+rightSky+backSky+leftSky)/max(detail.a,.0001),blend);
  return vec4(terrain,sky);
}
// A separate cloud-only texture travels behind stationary ridges and appears
// in the same world-space reflections. No terrain pixels enter the moving sky.
vec3 movingSky(vec3 direction, vec2 uv) {
  vec2 dome=direction.xz/max(direction.y+.45,.2);
  vec2 wind=vec2(weatherFlow*.018,-weatherFlow*.006);
  float vapor=clouds(dome*1.9+wind);
  vec2 skyUV=vec2(uv.x*2.+.37+weatherFlow*.0013,clamp(uv.y*2.+.012*(vapor-.5),.01,.99));
  vec2 dx=dFdx(skyUV), dy=dFdy(skyUV);
  dx.x-=round(dx.x); dy.x-=round(dy.x);
  float u=fract(skyUV.x);
  vec3 sky=textureGrad(cloudTexture,vec2(u,skyUV.y),dx,dy).rgb;
  float seam=1.-smoothstep(0.,.04,min(u,1.-u));
  vec3 other=textureGrad(cloudTexture,vec2(clamp(1.-u,.001,.999),skyUV.y),dx*vec2(-1,1),dy*vec2(-1,1)).rgb;
  sky=mix(sky,(sky+other)*.5,seam);
  // The high layer moves at a different speed and gently evolves in density.
  float high=clouds(dome*3.1+wind*.43+13.);
  float veil=smoothstep(.48,.8,high)*.19;
  sky=mix(sky,vec3(.79,.82,.84),veil);
  vec3 zenith=mix(vec3(.41,.49,.58),vec3(.76,.80,.84),smoothstep(.22,.75,vapor));
  vec3 clouded=mix(sky,zenith,1.-smoothstep(.04,.16,uv.y));
  vec3 clearSky=mix(vec3(.60,.72,.81),vec3(.20,.41,.63),smoothstep(0.,.9,direction.y));
  float coverage=smoothstep(1.-weather.x-.14,1.-weather.x+.14,vapor);
  return mix(clearSky,clouded,coverage);
}
float sunlight(vec2 position) {
  // The same moving cloud cover lights the mountains and the water below.
  float cover=clouds(position*.0028+vec2(weatherFlow*.014,-weatherFlow*.005));
  return mix(1.,smoothstep(.28,.74,cover)*.7,weather.x);
}
vec3 valleyMist(vec3 color, vec3 direction, vec3 origin, vec3 atShore) {
  // Two altitudes and wind speeds give wisps depth, rather than a gray overlay.
  vec2 wind=vec2(weatherFlow*.027,-weatherFlow*.009);
  float height=atShore.y;
  float lift=clouds(atShore.xz*.004+wind*.36)*31.;
  float bank=exp(-pow((height-205.-lift)/64.,2.));
  float strands=clouds(atShore.xz*.012+vec2(height*.018,0.)+wind);
  float far=bank*smoothstep(.29,.73,strands)*.34;
  float nearDistance=155.;
  vec3 nearPoint=origin+direction*nearDistance;
  float low=exp(-pow((nearPoint.y-5.)/13.,2.));
  float wisps=clouds(nearPoint.xz*.027+vec2(weatherFlow*.046,-weatherFlow*.018));
  float near=low*smoothstep(.43,.82,wisps)*.19;
  return mix(color,vec3(.68,.75,.78),(1.-(1.-far)*(1.-near))*mist);
}
vec3 environment(vec3 direction, vec3 origin) {
  float a=max(dot(direction.xz,direction.xz),.000001);
  float b=dot(origin.xz,direction.xz);
  float c=dot(origin.xz,origin.xz)-650.*650.;
  float distanceToShore=(-b+sqrt(max(b*b-a*c,0.)))/a;
  vec3 atShore=origin+direction*distanceToShore;
  vec2 uv=vec2(.5+atan(atShore.x,-atShore.z)/6.2831853,
               .526-atan(atShore.y,650.)/3.14159265);
  vec4 view=panorama(uv);
  float sun=sunlight(atShore.xz+vec2(atShore.y*.65,0.));
  vec3 lit=view.rgb*mix(vec3(.87,.91,.96),vec3(1.10,1.07,1.02),sun);
  vec3 result=lit;
  if(view.a*skyReady>.001) result=mix(lit,movingSky(direction,uv),view.a*skyReady);
  return valleyMist(result,direction,origin,atShore);
}
vec2 waterSlope(vec2 p, float distanceToEye) {
  float gust=.92+.12*sin(time*.19)+.06*sin(time*.071);
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
    slope+=normalize(delta+vec2(.0001))*cos(ring*95.)*envelope*.027*detail*weather.z;
  }
  return slope*gust*(.3+weather.y*1.9);
}
float rainLayer(vec2 uv,float scale,float speed) {
  vec2 p=vec2(uv.x+uv.y*(.12+weather.y*.45+.035*sin(time*.11)),uv.y)*vec2(62.,8.)*scale;
  p.y+=time*speed;
  vec2 cell=floor(p), f=fract(p);
  float seed=hash(cell);
  float width=max(fwidth(p.x)*.65,.013);
  float line=1.-smoothstep(width,width*2.,abs(f.x-(.2+hash(cell+4.)*.6)));
  float trail=smoothstep(.05,.1,f.y)*(1.-smoothstep(.17,.42,f.y));
  return line*trail*step(.77,seed)*(.35+seed*.65);
}
float snowLayer(vec2 uv,float scale,float speed) {
  vec2 p=uv*scale+vec2(weatherFlow*.2,time*speed);
  p.x+=sin(p.y*.4+time*.3)*.14;
  vec2 cell=floor(p), f=fract(p);
  vec2 center=.2+.6*vec2(hash(cell),hash(cell+17.));
  float radius=mix(.035,.09,hash(cell+37.));
  float edge=max(fwidth(p.x),.018);
  return (1.-smoothstep(radius,radius+edge,length(f-center)))*step(.48,hash(cell+51.));
}
vec3 timeOfDay(vec3 value, vec3 ray) {
  float luminance=dot(value,vec3(.2126,.7152,.0722));
  // Soft simulated moonlight preserves snow detail without retaining bright
  // daylight cloud highlights. Apply this after water/rain so all light agrees.
  vec3 moonlit=pow(max(luminance,0.),.95)*vec3(.24,.34,.51)+vec3(.003,.006,.012);
  vec3 warm=value*vec3(1.13,.79,.59)+vec3(.025,.006,0.);
  vec3 daytime=mix(value,warm,twilight*.78);
  vec3 result=mix(moonlit,daytime,daylight);
  float horizon=exp(-pow(ray.y/.34,2.));
  result+=vec3(.09,.027,.006)*horizon*twilight*daylight;
  return result;
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
    float sun=sunlight(point.xz);
    result*=.95+.10*sun;
    result+=vec3(.26,.25,.21)*light*(.08+.13*sun);
    float haze=smoothstep(110.,650.,hit)*.24;
    result=mix(result,vec3(.37,.50,.54),haze);
  } else {
    result=environment(ray,camera);
  }
  // Two focal depths keep the drizzle fine, sparse, and diagonal.
  vec2 rainUV=gl_FragCoord.xy/resolution.y;
  float rain=rainLayer(rainUV,1.,12.)*.14+rainLayer(rainUV+17.,.61,8.)*.11;
  result=mix(result,vec3(.77,.85,.87),rain*weather.z);
  if(weather.w>.001) {
    float snow=snowLayer(rainUV,19.,1.2)*.50+snowLayer(rainUV+7.,32.,.65)*.32;
    result=mix(result,vec3(.89,.93,.95),snow*weather.w);
  }
  float vignette=1.-.13*pow(length(screen*vec2(.65,.8)),1.4);
  color=vec4(timeOfDay(result,ray)*vignette,1.);
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
  draw: (
    progress: number,
    seconds: number,
    look?: LookDirection,
    weather?: WeatherVisuals,
  ) => boolean;
  resize: () => void;
  dispose: () => void;
};

export function createLakeRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  detailImages: HTMLImageElement[] = [],
  skyImage?: HTMLImageElement | null,
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
  const ridgeTexture = gl.createTexture();
  const skyTexture = gl.createTexture();
  const detailTextures = Array.from({ length: 4 }, () => gl.createTexture());
  if (
    !program ||
    !buffer ||
    !texture ||
    !ridgeTexture ||
    !skyTexture ||
    detailTextures.some((t) => !t)
  ) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteTexture(ridgeTexture);
    gl.deleteTexture(skyTexture);
    detailTextures.forEach((t) => gl.deleteTexture(t));
    return null;
  }
  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteTexture(ridgeTexture);
    gl.deleteTexture(skyTexture);
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
    let skyUploaded = false;
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
        [
          "resolution",
          "time",
          "camera",
          "yaw",
          "pitch",
          "detailReady",
          "skyReady",
          "daylight",
          "twilight",
          "weather",
          "mist",
          "weatherFlow",
        ].map((key) => [key, gl.getUniformLocation(program, key)]),
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
      const ridge = createSkylineTexture();
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, ridgeTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        ridge.width,
        ridge.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        ridge.pixels,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(program, "skyline"), 5);
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, skyTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([140, 155, 170, 255]),
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
      gl.uniform1i(gl.getUniformLocation(program, "cloudTexture"), 6);
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
    const conditions = { ...fallbackWeather };
    let previousSeconds = 0;
    let flow = 0;
    return {
      resize,
      draw(
        progress,
        seconds,
        look = { yaw: 0, pitch: 0 },
        targetWeather = fallbackWeather,
      ) {
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
        if (!skyUploaded && skyImage?.complete && skyImage.naturalWidth) {
          gl.activeTexture(gl.TEXTURE6);
          gl.bindTexture(gl.TEXTURE_2D, skyTexture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            skyImage,
          );
          gl.generateMipmap(gl.TEXTURE_2D);
          skyUploaded = true;
        }
        gl.uniform1f(uniforms.skyReady, skyUploaded ? 1 : 0);
        gl.uniform4fv(uniforms.detailReady, uploaded);
        const camera = cameraAt(progress, seconds);
        const lighting = sceneLighting();
        const delta = Math.max(0, Math.min(0.08, seconds - previousSeconds));
        previousSeconds = seconds;
        // Slow changes keep a new weather report from popping the scenery.
        // A static frame uses current conditions without starting an animation.
        const blend = delta ? 1 - Math.exp(-delta / 4) : 1;
        for (const key of Object.keys(conditions) as (keyof WeatherVisuals)[])
          conditions[key] += (targetWeather[key] - conditions[key]) * blend;
        flow += delta * (0.25 + conditions.wind * 2);
        gl.uniform4f(
          uniforms.weather,
          conditions.cloud,
          conditions.wind,
          conditions.rain,
          conditions.snow,
        );
        gl.uniform1f(uniforms.mist, conditions.mist);
        gl.uniform1f(uniforms.weatherFlow, flow);
        gl.uniform1f(uniforms.daylight, lighting.daylight);
        gl.uniform1f(uniforms.twilight, lighting.twilight);
        gl.uniform1f(uniforms.time, seconds);
        gl.uniform3f(uniforms.camera, camera.x, camera.y, camera.z);
        gl.uniform1f(uniforms.yaw, camera.yaw + look.yaw);
        gl.uniform1f(
          uniforms.pitch,
          Math.max(-1.48, Math.min(1.48, camera.pitch + look.pitch)),
        );
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        canvas.dataset.sky = skyUploaded ? "animated" : "fallback";
        canvas.dataset.lighting = lighting.period;
        canvas.dataset.nepalTime = lighting.nepalTime;
        canvas.dataset.weatherCloud = conditions.cloud.toFixed(3);
        canvas.dataset.weatherRain = conditions.rain.toFixed(3);
        canvas.dataset.weatherSnow = conditions.snow.toFixed(3);
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

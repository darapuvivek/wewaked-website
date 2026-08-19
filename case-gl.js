/* Shader sources. GLSL contains no backticks or ${, so template literals are safe. */
const SRC = {
  vs: `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`,
  scene: `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uMood;       // 0 composed .. 1 coming apart
uniform vec2  uPar;        // pointer parallax
uniform vec3  uSkin, uHair, uCloth, uShirt;
uniform float uBuild;      // shoulder width multiplier
uniform float uStyle;      // 0 slick, 1 bob, 2 tied
uniform float uPhase;      // per-suspect animation offset
uniform float uBlend;      // temporal accumulation weight

const vec3  LAMP    = vec3(0.0, 1.720, -1.52);
const float TABLE_Y = 0.775;
const vec3  FIG     = vec3(0.0, 0.0, -1.92);   // where the suspect sits

/* ─────────────────────────────────────────────── primitives */
float sdBox(vec3 p, vec3 b){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdEllipsoid(vec3 p, vec3 r){
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/max(k1,1e-6);
}
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){
  vec3 pa = p-a, ba = b-a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa - ba*h) - r;
}
float sdCylinder(vec3 p, float h, float r){
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdCappedCone(vec3 p, float h, float r1, float r2){
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2,h);
  vec2 k2 = vec2(r2-r1, 2.0*h);
  vec2 ca = vec2(q.x - min(q.x, (q.y<0.0)?r1:r2), abs(q.y)-h);
  vec2 cb = q - k1 + k2*clamp(dot(k1-q,k2)/dot(k2,k2), 0.0, 1.0);
  float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
  return s*sqrt(min(dot(ca,ca), dot(cb,cb)));
}
float smin(float a, float b, float k){
  float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b,a,h) - k*h*(1.0-h);
}
float smax(float a, float b, float k){
  float h = clamp(0.5 - 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b,a,h) + k*h*(1.0-h);
}
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

vec2 opU(vec2 a, vec2 b){ return (a.x < b.x) ? a : b; }

/* ─────────────────────────────────────────────── the suspect
   Materials: 9 skin  10 hair  11 clothing  12 eye                */
vec2 figure(vec3 p){
  float lean = uMood*0.055;
  vec3 q = p - FIG - vec3(0.0, 0.0, lean);
  float breathe = sin(uTime*1.05 + uPhase)*0.005;

  /* torso — shoulders slope out of an ellipsoid, arms reach onto the table */
  vec3 tq = q - vec3(0.0, 0.850 + breathe*0.4, 0.0);
  float torso = sdEllipsoid(tq, vec3(0.238*uBuild, 0.300, 0.148 + breathe));
  float armL = sdCapsule(q, vec3(-0.200*uBuild, 1.020, 0.010), vec3(-0.185, 0.818, 0.300), 0.053);
  float armR = sdCapsule(q, vec3( 0.200*uBuild, 1.020, 0.010), vec3( 0.180, 0.818, 0.295), 0.053);
  float cloth = smin(torso, smin(armL, armR, 0.03), 0.055);

  /* neck */
  float neck = sdCapsule(q, vec3(0.0,1.055,-0.004), vec3(0.0,1.180,0.004), 0.051);

  /* head, with a slow sway and a nod */
  float sway = sin(uTime*0.38 + uPhase)*0.030 + sin(uTime*0.23 + uPhase*1.7)*0.018;
  vec3 hq = q - vec3(0.0, 1.258 - uMood*0.022, 0.014);
  hq.xz = rot(sway)*hq.xz;
  hq.yz = rot(sway*0.42 + uMood*0.05)*hq.yz;

  float cran = sdEllipsoid(hq, vec3(0.087, 0.109, 0.099));
  float jaw  = sdEllipsoid(hq - vec3(0.0,-0.066, 0.016), vec3(0.068, 0.070, 0.081));
  float head = smin(cran, jaw, 0.046);

  head = smin(head, sdEllipsoid(hq - vec3(0.0, 0.020, 0.079), vec3(0.073,0.015,0.027)), 0.030); // brow ridge
  head = smin(head, sdEllipsoid(hq - vec3(0.0,-0.014, 0.100), vec3(0.019,0.031,0.025)), 0.024); // nose
  float cheeks = smin(sdEllipsoid(hq - vec3( 0.057,-0.020, 0.058), vec3(0.033,0.025,0.030)),
                      sdEllipsoid(hq - vec3(-0.057,-0.020, 0.058), vec3(0.033,0.025,0.030)), 0.02);
  head = smin(head, cheeks, 0.032);

  /* carve the eye sockets so the lamp leaves them in shadow */
  float sock = smin(sdEllipsoid(hq - vec3( 0.038, 0.006, 0.095), vec3(0.027,0.017,0.019)),
                    sdEllipsoid(hq - vec3(-0.038, 0.006, 0.095), vec3(0.027,0.017,0.019)), 0.014);
  head = smax(head, -sock, 0.026);

  float ears = smin(sdEllipsoid(hq - vec3( 0.095,-0.016,-0.010), vec3(0.012,0.031,0.021)),
                    sdEllipsoid(hq - vec3(-0.095,-0.016,-0.010), vec3(0.012,0.031,0.021)), 0.01);
  head = smin(head, ears, 0.018);

  /* the mouth is a shallow groove — the lamp fills it with shadow.
     it presses thinner and turns down as they lose composure */
  float mo = -0.049 - uMood*0.004;
  vec3 mq = hq - vec3(0.0, mo, 0.090);
  mq.yz = rot(-0.25)*mq.yz;
  head = smax(head, -sdEllipsoid(mq, vec3(0.025, 0.0040 - uMood*0.0010, 0.009)), 0.013);

  /* eyelids ride down over the eyeballs to blink */
  float ph = fract(uTime*0.21 + uPhase*0.31);
  float blink = smoothstep(0.955,0.972,ph) * (1.0 - smoothstep(0.978,0.994,ph));
  float lidY = 0.031 - blink*0.030 - uMood*0.005;
  float lids = smin(sdEllipsoid(hq - vec3( 0.038, lidY, 0.081), vec3(0.029,0.016,0.021)),
                    sdEllipsoid(hq - vec3(-0.038, lidY, 0.081), vec3(0.029,0.016,0.021)), 0.012);

  vec2 res = vec2(smin(min(head, lids), neck, 0.030), 9.0);
  res = opU(res, vec2(cloth, 11.0));

  float eyes = min(sdEllipsoid(hq - vec3( 0.038, 0.006, 0.082), vec3(0.0145,0.0115,0.0130)),
                   sdEllipsoid(hq - vec3(-0.038, 0.006, 0.082), vec3(0.0145,0.0115,0.0130)));
  res = opU(res, vec2(eyes, 12.0));
  float iris = min(sdEllipsoid(hq - vec3( 0.038, 0.005, 0.0905), vec3(0.0072,0.0072,0.0050)),
                   sdEllipsoid(hq - vec3(-0.038, 0.005, 0.0905), vec3(0.0072,0.0072,0.0050)));
  res = opU(res, vec2(iris, 20.0));

  /* brows — they drive inward and down under pressure, and without them
     the face reads as a blank mask at this distance */
  float bY = 0.031 - uMood*0.009;
  float bT = 0.20 + uMood*0.30;                       // inner end drops
  vec3 bl = hq - vec3(-0.039, bY, 0.083); bl.xy = rot(-bT)*bl.xy;
  vec3 brr = hq - vec3( 0.039, bY, 0.083); brr.xy = rot( bT)*brr.xy;
  float brows = min(sdEllipsoid(bl, vec3(0.028,0.0065,0.011)),
                    sdEllipsoid(brr, vec3(0.028,0.0065,0.011)));
  res = opU(res, vec2(brows, 19.0));

  /* hair */
  float hair = sdEllipsoid(hq - vec3(0.0, 0.028,-0.012), vec3(0.100, 0.101, 0.106));
  hair = smax(hair, 0.030 + hq.z*0.62 - hq.y, 0.022);          // expose the forehead
  if(uStyle > 1.5){
    hair = smin(hair, sdEllipsoid(hq - vec3(0.0,0.040,-0.112), vec3(0.046,0.041,0.041)), 0.02);
  } else if(uStyle > 0.5){
    hair = smin(hair, sdEllipsoid(hq - vec3( 0.088,-0.048,-0.008), vec3(0.034,0.076,0.077)), 0.03);
    hair = smin(hair, sdEllipsoid(hq - vec3(-0.088,-0.048,-0.008), vec3(0.034,0.076,0.077)), 0.03);
  }
  res = opU(res, vec2(hair, 10.0));

  /* a wedge of shirt at the open collar, sitting flush with the jacket */
  float shirt = sdEllipsoid(q - vec3(0.0, 1.030, 0.100), vec3(0.028, 0.038, 0.008));
  res = opU(res, vec2(shirt, 13.0));

  return res;
}


/* ─────────────────────────────────────────────── the room
   1 back wall  2 side walls  3 floor  4 ceiling  5 table
   6 lamp shade  7 chair  8 mirror  18 bulb                   */
/* the compact things — everything a sphere trace handles well */
vec2 mapObjects(vec3 p){
  vec2 res = vec2(1e9, 0.0);
  res = opU(res, vec2(sdBox(p - vec3(-2.82, 1.52, -1.80), vec3(0.012,0.50,0.92)), 8.0));

  float chair = sdBox(p - vec3(0.0, 0.88, FIG.z - 0.30), vec3(0.205,0.195,0.022)) - 0.022;
  res = opU(res, vec2(chair, 7.0));

  vec3 lp = p - LAMP;
  float cord  = sdCylinder(lp - vec3(0.0,0.76,0.0), 0.64, 0.005);
  float outer = sdCappedCone(lp - vec3(0.0,0.126,0.0), 0.122, 0.270, 0.070);
  float inner = sdCappedCone(lp - vec3(0.0,0.094,0.0), 0.122, 0.270, 0.058);
  res = opU(res, vec2(min(max(outer,-inner), cord), 6.0));
  res = opU(res, vec2(length(lp) - 0.036, 18.0));

  /* bounding spheres keep the figure and props out of most marching steps */
  float figB = length(p - (FIG + vec3(0.0,0.95,0.10))) - 0.78;
  if(figB < 0.06) res = opU(res, figure(p));
  else            res = opU(res, vec2(figB, 9.0));

  return res;
}

/* full field, including the flat surfaces — used for shadows, AO and normals */
vec2 map(vec3 p){
  vec2 res = mapObjects(p);
  res = opU(res, vec2(p.y, 3.0));
  res = opU(res, vec2(2.86 - p.y, 4.0));
  res = opU(res, vec2(p.z + 4.15, 1.0));
  res = opU(res, vec2(2.84 - abs(p.x), 2.0));
  res = opU(res, vec2(1.05 - p.z, 2.0));
  float table = sdBox(p - vec3(0.0, TABLE_Y - 0.043, -1.24), vec3(1.22,0.043,0.66)) - 0.014;
  res = opU(res, vec2(table, 5.0));
  return res;
}

/* exact ray/plane hits for the room shell and the tabletop */
void planes(vec3 ro, vec3 rd, inout float bt, inout float bm, inout vec3 bn){
  float t;
  if(rd.y < -1e-6){
    t = -ro.y/rd.y;                    if(t > 0.0 && t < bt){ bt=t; bm=3.0; bn=vec3(0,1,0); }
    t = (TABLE_Y - ro.y)/rd.y;
    if(t > 0.0 && t < bt){
      vec3 q = ro + rd*t;
      if(abs(q.x) < 1.234 && q.z > -1.914 && q.z < -0.566){ bt=t; bm=5.0; bn=vec3(0,1,0); }
    }
  }
  if(rd.y >  1e-6){ t = (2.86-ro.y)/rd.y;  if(t>0.0&&t<bt){ bt=t; bm=4.0; bn=vec3(0,-1,0); } }
  if(rd.z < -1e-6){ t = (-4.15-ro.z)/rd.z; if(t>0.0&&t<bt){ bt=t; bm=1.0; bn=vec3(0,0,1); } }
  if(rd.z >  1e-6){ t = (1.05-ro.z)/rd.z;  if(t>0.0&&t<bt){ bt=t; bm=2.0; bn=vec3(0,0,-1); } }
  if(rd.x >  1e-6){ t = (2.84-ro.x)/rd.x;  if(t>0.0&&t<bt){ bt=t; bm=2.0; bn=vec3(-1,0,0); } }
  if(rd.x < -1e-6){ t = (-2.84-ro.x)/rd.x; if(t>0.0&&t<bt){ bt=t; bm=2.0; bn=vec3(1,0,0); } }
}

vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.0013, 0.0);
  return normalize(vec3(
    map(p+e.xyy).x - map(p-e.xyy).x,
    map(p+e.yxy).x - map(p-e.yxy).x,
    map(p+e.yyx).x - map(p-e.yyx).x));
}

/* per-pixel jitter — trades stepping artifacts for grain the film look wants */
float gSeed = 0.0;

float softShadow(vec3 ro, vec3 rd, float mint, float maxt){
  float res = 1.0, t = mint + gSeed*0.012;
  for(int i=0;i<34;i++){
    float h = map(ro + rd*t).x;
    if(h < 0.0012) return 0.0;
    res = min(res, 9.0*h/t);
    t += clamp(h, 0.007, 0.16);
    if(t > maxt) break;
  }
  res = clamp(res, 0.0, 1.0);
  return res*res*(3.0 - 2.0*res);
}

float shadowFast(vec3 ro, vec3 rd, float maxt){
  float t = 0.05;
  for(int i=0;i<11;i++){
    float h = map(ro + rd*t).x;
    if(h < 0.005) return 0.0;
    t += clamp(h, 0.045, 0.40);
    if(t > maxt) break;
  }
  return 1.0;
}

float ao(vec3 p, vec3 n){
  float occ = 0.0, sca = 1.0;
  for(int i=0;i<8;i++){
    float hr = 0.008 + 0.105*(float(i) + gSeed*0.55)/8.0;
    occ += (hr - map(p + n*hr).x)*sca;
    sca *= 0.80;
  }
  return clamp(1.0 - 1.55*occ, 0.0, 1.0);
}

/* ─────────────────────────────────────────────── surfaces */
float hash21(vec2 p){
  p = fract(p*vec2(233.34, 851.73));
  p += dot(p, p+23.45);
  return fract(p.x*p.y);
}
float valNoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<4;i++){ v += a*valNoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void shadeSurface(float mid, vec3 p, inout vec3 alb, inout float rough, inout float metal){
  metal = 0.0;
  if(mid < 2.5){                                        // panelled walls
    float u = (abs(p.z) > 3.0) ? p.x : p.z;
    float groove = smoothstep(0.026, 0.0, abs(fract(u*0.56) - 0.5));
    float rail   = smoothstep(0.022, 0.0, abs(fract(p.y*0.46 + 0.2) - 0.5));
    float grain  = fbm(vec2(u*2.4, p.y*7.0));
    alb  = mix(vec3(0.082,0.056,0.040), vec3(0.044,0.029,0.021), grain*0.9);
    alb *= 1.0 - 0.55*max(groove, rail*0.75);
    rough = 0.76 - 0.14*grain;
  } else if(mid < 3.5){                                 // waxed boards
    float board = smoothstep(0.018, 0.0, abs(fract(p.x*0.82)-0.5));
    float g = fbm(vec2(p.x*1.8, p.z*4.5));
    alb  = mix(vec3(0.046,0.035,0.028), vec3(0.028,0.021,0.016), g);
    alb *= 1.0 - 0.5*board;
    rough = 0.44 + 0.05*g;
  } else if(mid < 4.5){
    alb = vec3(0.026,0.024,0.022); rough = 0.94;
  } else if(mid < 5.5){                                 // the table
    float g = fbm(vec2(p.x*2.6, p.z*5.5));
    alb = mix(vec3(0.082,0.053,0.035), vec3(0.058,0.037,0.024), g);
    rough = 0.40 + 0.05*g;
  } else if(mid < 6.5){                                 // enamel shade
    alb = vec3(0.26,0.25,0.24); rough = 0.24; metal = 0.55;
  } else if(mid < 7.5){
    alb = vec3(0.038,0.033,0.030); rough = 0.70;
  } else if(mid < 8.5){                                 // observation glass
    alb = vec3(0.016,0.020,0.026); rough = 0.05; metal = 0.85;
  } else if(mid < 9.5){                                 // skin
    float pores = fbm(p.xy*55.0)*0.04;
    alb = uSkin * (0.78 + pores);
    rough = 0.62;
  } else if(mid < 10.5){                                // hair
    alb = uHair; rough = 0.40;
  } else if(mid < 11.5){                                // clothing
    float weave = fbm(p.xy*45.0)*0.07;
    alb = uCloth * (0.80 + weave);
    rough = 0.93;
  } else if(mid < 12.5){                                // eye
    alb = vec3(0.42,0.39,0.36); rough = 0.20;
  } else if(mid < 13.5){                                // shirt
    alb = uShirt*0.55; rough = 0.80;
  } else if(mid < 14.5){                                // bakelite
    alb = vec3(0.030,0.030,0.033); rough = 0.34;
  } else if(mid < 15.5){                                // paper
    alb = vec3(0.74,0.70,0.60); rough = 0.88;
  } else if(mid < 16.5){                                // glass of water
    alb = vec3(0.09,0.13,0.15); rough = 0.04; metal = 0.45;
  } else if(mid < 17.5){                                // packet
    alb = vec3(0.22,0.055,0.045); rough = 0.55;
  } else if(mid < 18.5){                                // bulb
    alb = vec3(1.0,0.85,0.65); rough = 0.20;
  } else if(mid < 19.5){                                // brows
    alb = uHair*0.72; rough = 0.62;
  } else {                                              // iris
    alb = vec3(0.030,0.020,0.012); rough = 0.05; metal = 0.60;
  }
}

/* ─────────────────────────────────────────────── light */
float flicker(){
  float f = 0.960 + 0.026*sin(uTime*11.3) + 0.018*sin(uTime*27.7 + 1.7);
  return f - smoothstep(0.988, 1.0, valNoise(vec2(uTime*1.5, 0.0)))*0.30;
}
vec3 lampColour(){ return vec3(1.0, 0.700, 0.395) * 2.30 * flicker(); }

/* the shade throws the light down: a cone, not a bare bulb */
float coneMask(vec3 dirFromLamp){
  return smoothstep(-0.30, 0.40, -dirFromLamp.y);
}

vec3 shadePoint(vec3 p, vec3 n, vec3 rd, float mid){
  vec3 alb = vec3(0.05); float rough = 0.7, metal = 0.0;
  shadeSurface(mid, p, alb, rough, metal);

  if(mid > 17.5 && mid < 18.5) return alb * 5.0 * flicker();   // the bulb is the source

  vec3 ld = LAMP - p;
  float d = length(ld);
  ld /= d;

  float ndl  = max(dot(n, ld), 0.0);
  float sh   = softShadow(p + n*0.008, ld, 0.02, d - 0.05);
  float att  = 1.0 / (0.10 + d*d);
  float cone = coneMask(-ld);

  vec3 lc = lampColour();
  vec3 col = alb * lc * ndl * sh * att * cone;

  vec3 h = normalize(ld - rd);
  float spec = pow(max(dot(n,h),0.0), mix(16.0, 380.0, 1.0-rough));
  col += lc * spec * att * sh * cone * mix(0.04, 1.0, metal + (1.0-rough)*0.55);

  // skin picks up a little warmth where the light grazes it
  if(mid > 8.5 && mid < 9.5){
    float wrap = max(dot(n, ld)*0.5 + 0.5, 0.0);
    col += alb * lc * pow(wrap, 4.0) * att * cone * sh * 0.10 * vec3(1.0,0.52,0.38);
  }

  float occ = ao(p,n);

  // a cold rim from the back of the room, so the figure separates from the
  // wall instead of dissolving into it
  vec3 rimDir = normalize(vec3(0.30, 0.34, -1.0));
  col += alb * vec3(0.16,0.21,0.34) * pow(max(dot(n, rimDir),0.0), 2.2) * occ;

  col += alb * vec3(0.026,0.038,0.064) * max(dot(n, normalize(vec3(-1.0,0.30,0.30))),0.0) * occ; // mirror side
  col += alb * vec3(0.038,0.027,0.018) * max(-n.y,0.0) * 0.32 * occ;                             // floor bounce
  col += alb * vec3(0.011,0.013,0.020) * occ;                                                     // ambient

  return col;
}

/* ─────────────────────────────────────────────── haze */
vec3 volumetric(vec3 ro, vec3 rd, float tmax, float dither){
  vec3 acc = vec3(0.0);
  const float dt = 0.40;
  vec3 lc = lampColour();
  for(int i=0;i<20;i++){
    float t = (float(i) + dither) * dt;
    if(t > tmax) break;
    vec3 p = ro + rd*t;
    vec3 ld = LAMP - p;
    float d = length(ld);
    ld /= d;
    float cone = coneMask(-ld);
    if(cone > 0.01){
      float sh = shadowFast(p, ld, d - 0.07);
      if(sh > 0.0){
        float dens = 0.030 * (0.5 + 0.9*exp(-max(p.y-0.25,0.0)*0.60))
                   * (0.75 + 0.5*fbm(vec2(p.x*0.8 + uTime*0.04, p.z*0.8)));
        // a column of smoke rising off the ashtray side of the table
        vec2 sm = vec2(p.x - 0.20, p.z + 1.16);
        float col2 = exp(-dot(sm,sm)*7.0) * smoothstep(0.78, 1.30, p.y) * smoothstep(2.0, 1.5, p.y);
        if(col2 > 0.02) dens += 0.055 * col2 * valNoise(vec2(p.x*5.0 + uTime*0.16, p.y*3.4 - uTime*0.42));
        float ct = dot(rd, ld);
        float g = 0.45;
        float phase = (1.0-g*g) / pow(max(1.0 + g*g - 2.0*g*ct, 1e-4), 1.5) * 0.0796;
        acc += lc * sh * cone * dens * phase * dt / (0.14 + d*d);
      }
    }
  }
  return acc;
}

vec3 aces(vec3 x){
  const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  gSeed = hash21(gl_FragCoord.xy + fract(uTime)*91.0);

  float br = sin(uTime*0.60)*0.008 + sin(uTime*0.29)*0.004;
  vec3 ro = vec3(uPar.x*0.040, 1.420 + br, -0.30);
  vec3 ta = vec3(uPar.x*0.07, 1.160 + br*0.5 - uPar.y*0.04, -1.95);

  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0,1.0,0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x*rt + uv.y*up + 2.20*fw);

  float t = 13.0, mid = -1.0;
  vec3 nrm = vec3(0.0,1.0,0.0);
  planes(ro, rd, t, mid, nrm);

  float to = 0.02;
  for(int i=0;i<80;i++){
    if(to > t) break;
    vec2 h = mapObjects(ro + rd*to);
    if(h.x < 0.0006*to){ t = to; mid = h.y; nrm = calcNormal(ro + rd*to); break; }
    to += h.x*0.92;
  }

  vec3 col = vec3(0.0);
  float tmax = t;
  if(mid > 0.0) col = shadePoint(ro + rd*t, nrm, rd, mid);

  float dither = hash21(gl_FragCoord.xy + fract(uTime)*137.0);
  col += volumetric(ro, rd, tmax, dither);

  col = mix(col, vec3(0.004,0.004,0.006), 1.0 - exp(-0.024*t*t));

  col *= 1.10;
  col = aces(col);
  float lum = dot(col, vec3(0.2126,0.7152,0.0722));
  col *= mix(vec3(0.70,0.83,1.08), vec3(1.05,0.98,0.90), smoothstep(0.02, 0.40, lum));
  col = mix(col, col*vec3(0.86,0.93,1.12), uMood*0.55);
  col = pow(col, vec3(0.4545));
  col = mix(vec3(lum), col, 1.10 - uMood*0.14);

  // the scene target is only 8-bit and this image lives in its darkest
  // decile — dither before quantising or the falloff terraces into bands
  col += (hash21(gl_FragCoord.xy*1.7 + fract(uTime)*53.0) - 0.5) / 900.0;

  // written with alpha blending on, so each pass is an exponential moving
  // average of the last few — the per-pixel jitter above averages out
  gl_FragColor = vec4(col, uBlend);
}
`,
  post: `
precision highp float;
uniform sampler2D uScene;
uniform vec2  uRes;
uniform float uTime;

float hash21(vec2 p){
  p = fract(p*vec2(233.34, 851.73));
  p += dot(p, p+23.45);
  return fract(p.x*p.y);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 c  = uv - 0.5;
  float r2 = dot(c,c);

  float ca = 0.0018 * r2;
  vec3 col;
  col.r = texture2D(uScene, uv - c*ca).r;
  col.g = texture2D(uScene, uv).g;
  col.b = texture2D(uScene, uv + c*ca).b;

  vec3 bl = vec3(0.0);
  float px = 3.2 / uRes.y;
  for(int i=0;i<8;i++){
    float a = float(i)*0.7854;
    vec2 o = vec2(cos(a), sin(a));
    bl += texture2D(uScene, uv + o*px*6.0).rgb;
    bl += texture2D(uScene, uv + o*px*15.0).rgb;
  }
  bl = max(bl/16.0 - 0.38, 0.0);
  col += bl * 0.70;

  col *= 1.0 - smoothstep(0.14, 0.80, r2)*0.78;

  float g = hash21(gl_FragCoord.xy + fract(uTime)*311.0) - 0.5;
  float lum = dot(col, vec3(0.2126,0.7152,0.0722));
  col += g * 0.032 * (1.25 - lum);

  gl_FragColor = vec4(col, 1.0);
}
`,
};

/* ═══════════════════════════════════════════════ the interrogation room
 * A raymarched room: signed-distance geometry, one practical light in the
 * lamp with soft shadows and single-scattering haze, tonemapped and graded.
 * The scene pass is expensive so it runs at reduced resolution into a
 * half-float buffer at a capped rate; a cheap post pass runs every frame.
 */
window.CaseGL = (function(){
  const dead = { ok:false, setMood(){}, setSuspect(){} };

  function lin(hex){
    const h = String(hex).replace('#','');
    return [0,2,4].map(i => Math.pow(parseInt(h.slice(i,i+2),16)/255, 2.2));
  }

  function init(canvas){
    let gl = null;
    try{
      gl = canvas.getContext('webgl', { antialias:false, alpha:false, powerPreference:'high-performance' })
        || canvas.getContext('experimental-webgl');
    }catch(e){ gl = null; }
    if(!gl) return dead;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const link = (a, b) => {
      const v = compile(gl.VERTEX_SHADER, a), f = compile(gl.FRAGMENT_SHADER, b);
      if(!v || !f) return null;
      const p = gl.createProgram();
      gl.attachShader(p,v); gl.attachShader(p,f); gl.linkProgram(p);
      if(!gl.getProgramParameter(p, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(p)); return null; }
      return p;
    };

    const pScene = link(SRC.vs, SRC.scene);
    const pPost  = link(SRC.vs, SRC.post);
    if(!pScene || !pPost) return dead;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const bindQuad = prog => {
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    /* An 8-bit target cannot hold an image that lives this close to black —
       the lamp falloff quantises into contour rings. Half-float removes the
       banding and lets the temporal accumulation actually converge. */
    const extHF  = gl.getExtension('OES_texture_half_float');
    const extHFL = gl.getExtension('OES_texture_half_float_linear');
    let texType   = extHF ? extHF.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    let texFilter = (texType === gl.UNSIGNED_BYTE || extHFL) ? gl.LINEAR : gl.NEAREST;

    const tex = gl.createTexture(), fbo = gl.createFramebuffer();
    let W=0, H=0, SW=0, SH=0, settle=1;
    let SCALE = (window.innerWidth < 760 || (window.devicePixelRatio||1) > 2.5) ? 0.50 : 0.68;

    function resize(){
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width*dpr)), h = Math.max(1, Math.round(r.height*dpr));
      if(w === W && h === H && SW === Math.round(W*SCALE)) return;
      W=w; H=h; canvas.width=W; canvas.height=H; settle=1;
      SW = Math.max(1, Math.round(W*SCALE)); SH = Math.max(1, Math.round(H*SCALE));
      for(let attempt=0; attempt<2; attempt++){
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SW, SH, 0, gl.RGBA, texType, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) break;
        texType = gl.UNSIGNED_BYTE; texFilter = gl.LINEAR;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    const uS = n => gl.getUniformLocation(pScene, n);
    const L = {
      res:uS('uRes'), time:uS('uTime'), mood:uS('uMood'), par:uS('uPar'),
      skin:uS('uSkin'), hair:uS('uHair'), cloth:uS('uCloth'), shirt:uS('uShirt'),
      build:uS('uBuild'), style:uS('uStyle'), phase:uS('uPhase'), blend:uS('uBlend'),
      pTex:gl.getUniformLocation(pPost,'uScene'),
      pRes:gl.getUniformLocation(pPost,'uRes'), pTime:gl.getUniformLocation(pPost,'uTime'),
    };

    let mood=0, moodT=0, par=[0,0], parT=[0,0];
    let cost=-1, samples=0, lastBegan=0;
    let sus = { skin:lin('#c68e63'), hair:lin('#1f1b18'), cloth:lin('#243247'),
                shirt:lin('#e8e6e1'), build:1.12, style:0, phase:0 };
    let t0 = performance.now(), lastScene = 0, running = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function frame(now){
      if(!running) return;
      requestAnimationFrame(frame);
      const time = (now - t0)/1000;
      resize();
      mood   += (moodT - mood)*0.05;
      par[0] += (parT[0]-par[0])*0.045;
      par[1] += (parT[1]-par[1])*0.045;

      if(now - lastScene > (reduced ? 500 : 44)){
        const began = now;
        lastScene = now;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0,0,SW,SH);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(pScene); bindQuad(pScene);
        gl.uniform1f(L.blend, settle > 0 ? 1.0 : 0.14);
        if(settle > 0) settle--;
        gl.uniform2f(L.res, SW, SH);
        gl.uniform1f(L.time, time);
        gl.uniform1f(L.mood, mood);
        gl.uniform2f(L.par, par[0], par[1]);
        gl.uniform3fv(L.skin, sus.skin);
        gl.uniform3fv(L.hair, sus.hair);
        gl.uniform3fv(L.cloth, sus.cloth);
        gl.uniform3fv(L.shirt, sus.shirt);
        gl.uniform1f(L.build, sus.build);
        gl.uniform1f(L.style, sus.style);
        gl.uniform1f(L.phase, sus.phase);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        if(lastBegan > 0){
          const spent = began - lastBegan;
          if(spent > 0 && spent < 4000){
            cost = cost < 0 ? spent : cost*0.85 + spent*0.15;
            if(++samples > 24){
              samples = 0;
              const want = cost > 120 ? SCALE - 0.10 : (cost < 55 && SCALE < 0.70 ? SCALE + 0.06 : SCALE);
              const next = Math.max(0.34, Math.min(0.70, want));
              if(Math.abs(next - SCALE) > 0.01){ SCALE = next; resize(); }
            }
          }
        }
        lastBegan = began;
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.BLEND);
      gl.viewport(0,0,W,H);
      gl.useProgram(pPost); bindQuad(pPost);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(L.pTex, 0);
      gl.uniform2f(L.pRes, W, H);
      gl.uniform1f(L.pTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    resize();
    requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => {
      if(document.hidden){ running = false; }
      else if(!running){ running = true; t0 = performance.now() - 2000; requestAnimationFrame(frame); }
    });
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      parT = [((e.clientX-r.left)/r.width - 0.5)*2, ((e.clientY-r.top)/r.height - 0.5)*2];
    });
    canvas.addEventListener('pointerleave', () => { parT = [0,0]; });

    return {
      ok:true,
      setMood(m){ moodT = Math.max(0, Math.min(1, m)); },
      setSuspect(s){
        const a = s.avatar;
        sus = {
          skin:lin(a.skin), hair:lin(a.hair), cloth:lin(a.cloth), shirt:lin(a.shirt),
          build:{ broad:1.14, slim:0.90, soft:1.03 }[a.build] || 1,
          style:{ slick:0, bob:1, tied:2 }[a.hairStyle] || 0,
          phase:{ adrian:0, priya:2.3, teresa:4.7 }[s.id] || 0,
        };
        settle = 1;
      },
    };
  }

  return { init };
})();

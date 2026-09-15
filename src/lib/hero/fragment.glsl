precision highp float;
varying vec2 uv;
uniform sampler2D photo;
uniform float t,amount,water,light;
uniform vec4 crop;

uniform vec4 wakes[12];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
// Linear finite-depth gravity waves: omega^2 = g*k*tanh(k*depth).
// Returns analytic height derivatives, avoiding noisy finite differences.
vec2 slope(vec2 x){vec2 s=vec2(0.);for(int i=0;i<6;i++){float j=float(i);float angle=.27+j*2.39996;vec2 d=vec2(cos(angle),sin(angle));float k=4.0+j*3.7;float kh=k*.65;float th=(1.-exp(-2.*kh))/(1.+exp(-2.*kh));float omega=sqrt(9.81*k*th);float amp=.009/(1.+j*.7);s+=d*amp*k*cos(k*dot(d,x)-omega*t*.48+j*1.8);}for(int i=0;i<12;i++){
vec4 w=wakes[i];float age=t-w.z;
if(w.w>0. && age>=0. && age<7.){
vec2 delta=x-w.xy;float r=length(delta);float speed=1.65;float k=8.;
float q=r-speed*age;float width=.40+.10*age;
float env=exp(-q*q/(width*width))*exp(-age*.85)/sqrt(1.+r*2.);
float phase=k*q;
float derivative=env*(k*cos(phase)+sin(phase)*(-2.*q/(width*width)-1./(1.+2.*r)));
s+=delta/max(r,.06)*w.w*derivative*smoothstep(0.,.12,age);
}}
return s*water;}
float fresnel(float c){return .02037+.97963*pow(1.-clamp(c,0.,1.),5.);}
float edgeLight(vec2 p,vec2 a,vec2 b,vec2 c,float shift){
vec2 lo=min(a,min(b,c))-.025, hi=max(a,max(b,c))+.025;
if(p.x<lo.x || p.x>hi.x || p.y<lo.y || p.y>hi.y)return 0.;
float best=1.;float along=0.;vec2 last=a;
for(int i=1;i<=16;i++){float f=float(i)/16.;vec2 next=mix(mix(a,b,f),mix(b,c,f),f);vec2 v=next-last;
float h=clamp(dot(p-last,v)/dot(v,v),0.,1.);float d=length((p-last-v*h)*vec2(1.77,1.));
if(d<best){best=d;along=(float(i)-1.+h)/16.;}last=next;}
float gleam=pow(.5+.5*cos(along*5.-t*.60+shift),8.);
float width=.0018+.0022*pow(sin(along*3.14159),2.);
return (exp(-best*best/(width*width))*(.04+.58*gleam)+exp(-best*best/.00009)*.032)*smoothstep(0.,.08,along)*(1.-smoothstep(.90,1.,along));
}
float driftingMist(vec2 p){
if(p.x>.68 || p.y<.52 || p.y>.91)return 0.;
float density=0.;
for(int i=0;i<8;i++){
float seed=float(i);float age=mod(t*.038+seed/8.,1.);
float x=.645-age*.39;
float y=.688+.100*age+.009*sin(age*8.+seed*2.4);
vec2 size=vec2(.042+.065*age,.028+.025*age);
vec2 q=(p-vec2(x,y))/size;
q.y+=.28*sin(q.x*2.4-age*5.+seed);
float shape=exp(-dot(q,q)*1.6);
vec2 flow=vec2(p.x*32.+t*.44,p.y*58.-t*.045);
float coarse=noise(flow+vec2(seed*3.,0.));float fine=noise(flow*2.1+coarse*1.8);
float texture=smoothstep(.18,.78,coarse*.68+fine*.32);
float life=smoothstep(0.,.10,age)*(1.-smoothstep(.38,1.,age));
density+=shape*texture*life*.58;
}
return density*(1.-smoothstep(.60,.68,p.x))*smoothstep(.52,.61,p.y)*(1.-smoothstep(.83,.91,p.y));
}
void main(){vec2 p=crop.xy+vec2(uv.x,1.-uv.y)*crop.zw;
vec3 base=texture2D(photo,p).rgb;vec3 col=base;vec2 source=vec2(.824,.726);
float pulse=light*(1.+amount*.045*sin(t*.44));
float right=smoothstep(.44,.64,p.x);float lum=dot(base,vec3(.2126,.7152,.0722));
float dist=length((p-source)*vec2(1.77,1.));float halo=exp(-dist*dist*160.);
col+=vec3(.42,.76,1.)*halo*.08*pulse;
// Light propagation suggested along existing bright glass, radiating from source.
float sweep=pow(.5+.5*cos(dist*24.-t*.7),7.);
float glass=right*(1.-smoothstep(.765,.80,p.y));
col+=base*smoothstep(.12,.72,lum)*glass*amount*pulse*(.25*sweep);
// Calibrated pinhole camera. Horizon and source are matched to the supplied photo.
float edges=edgeLight(p,vec2(.608,.288),vec2(.672,.19),vec2(.767,.143),0.)
+edgeLight(p,vec2(.867,.373),vec2(.891,.329),vec2(.903,.272),1.7);
col+=vec3(.57,.84,1.)*edges*pulse*.44;
float coast=.773+.003*sin(p.x*17.)+.002*sin(p.x*41.+1.);
float phase=t*.64+p.x*9.+noise(vec2(p.x*8.,t*.09))*3.;
float group=.5+.5*sin(phase);float secondary=.5+.5*sin(t*.43-p.x*19.+2.1);
float surge=water*(.007+.022*pow(group,2.)+.009*secondary);
float front=coast-surge+.0025*(noise(vec2(p.x*95.,t*.28))-.5);
float foot=(smoothstep(.545,.585,p.x)*(1.-smoothstep(.80,.84,p.x)))*(1.-smoothstep(.779,.797,p.y));
float mask=smoothstep(front,front+.014,p.y)*(1.-foot);
float shoreBand=exp(-pow((p.y-front)/.025,2.))*(1.-foot);
float wetBand=smoothstep(coast-.043,coast-.021,p.y)*(1.-smoothstep(front-.008,front+.004,p.y))*(1.-foot);
col=mix(col,col*.91+vec3(.015,.033,.044)*pulse,wetBand*.5*water);
if(mask>0.){
vec3 camera=vec3(0.,1.35,0.);vec3 ray=normalize(vec3((p.x-.5)*1.77,-(p.y-.735),1.));
float distanceToPlane=-camera.y/min(ray.y,-.0001);vec3 P=camera+ray*distanceToPlane;
vec2 slopes=slope(P.xz);
float shoalPhase=(p.y-front)*370.+t*.65+noise(vec2(p.x*35.,t*.11))*5.;
slopes+=vec2(.018*sin(p.x*91.-t*.8),.048*cos(shoalPhase))*shoreBand*water;
vec3 N=normalize(vec3(-slopes.x,1.,-slopes.y));vec3 V=normalize(camera-P);
// Source positioned to project onto the luminous arch base.
vec3 S=vec3((source.x-.5)*1.77*12.,1.35-(source.y-.735)*12.,12.);
vec3 delta=S-P;float r2=dot(delta,delta);vec3 L=normalize(delta);vec3 H=normalize(L+V);
float NoV=max(dot(N,V),.001),NoL=max(dot(N,L),.001),NoH=max(dot(N,H),0.);
float rough=.09;float a2=rough*rough;float den=NoH*NoH*(a2-1.)+1.;float D=a2/(3.14159265*den*den);
float k=.08;float Gv=NoV/(NoV*(1.-k)+k);float Gl=NoL/(NoL*(1.-k)+k);
float F=fresnel(dot(V,H));float spec=D*Gv*Gl*F/(4.*NoV*NoL+.001);
vec2 offset=slopes*vec2(.035,.012)*smoothstep(front,front+.075,p.y);
vec3 floorImage=texture2D(photo,clamp(p+offset,vec2(0.),vec2(1.))).rgb;
// Reflect the photographed environment with the same normal field.
vec3 R=reflect(-V,N);vec3 E=P+R*max((12.-P.z)/max(R.z,.01),0.);
vec2 envUV=vec2(.5+E.x/(12.*1.77),.735-(E.y-1.35)/12.);
vec3 env=texture2D(photo,clamp(envUV,vec2(.0),vec2(1.,.78))).rgb;
float envMix=fresnel(NoV)*.18;
vec3 waterCol=mix(floorImage,env,envMix);
vec3 radiance=vec3(.58,.84,1.)*(20.*pulse/max(r2,.6));
waterCol+=radiance*spec*NoL;
float breakup=noise(vec2(p.x*135.+t*.06,p.y*410.-t*.32));
float crest=exp(-pow((p.y-front-.007)/.0035,2.));
float foam=crest*smoothstep(.47,.76,breakup)*(.25+.75*group)*water;
float shoreLight=.16+.84*exp(-pow((p.x-source.x)/.29,2.));
waterCol+=vec3(.30,.49,.58)*foam*shoreLight*pulse*.34;
float glint=pow(max(0.,cos(shoalPhase)),10.)*shoreBand;
waterCol+=vec3(.025,.053,.068)*glint*water*(.3+.7*shoreLight)*pulse;
col=mix(col,waterCol,mask);
}
float vapor=driftingMist(p);float opacity=1.-exp(-vapor*1.35);
float sourceFalloff=.45+.55*exp(-length((p-vec2(.67,.70))*vec2(1.4,1.))*3.);
vec3 mistLight=vec3(.19,.36,.45)*sourceFalloff*(.35+.65*pulse);
col=mix(col,mistLight,opacity);
gl_FragColor=vec4(clamp(col,0.,1.),1.);
}

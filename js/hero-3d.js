/** An original, lightweight isometric system study.
 * Real 3D coordinates projected onto Canvas 2D: no WebGL dependency, GPU gate,
 * imported model, library, or fake live metrics. Packets illustrate request paths.
 * The renderer sleeps offscreen, in hidden tabs, and when motion is paused.
 */
(() => {
  'use strict';
  const app = window.Portfolio;
  const figure = document.getElementById('system-study');
  const wrap = document.getElementById('system-canvas-wrap');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return; // The local SVG remains available.
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const nodes = [
    { id: 'app', label: 'APPLICATION', x: -3.0, y: .35, w: 1.05, d: .78, h: .16, type: 'screen' },
    { id: 'api', label: 'API', x: -.6, y: .0, w: 1.1, d: .95, h: .52, type: 'server' },
    { id: 'cloud', label: 'CLOUD', x: -.5, y: -2.25, w: .92, d: .75, h: .35, type: 'cloud' },
    { id: 'data', label: 'DATABASE', x: 2.1, y: -.45, w: 1.0, d: .9, h: .74, type: 'database' },
    { id: 'ai', label: 'AI ENGINE', x: 1.4, y: 1.9, w: 1.05, d: .9, h: .28, type: 'chip' },
    { id: 'voice', label: 'CALL AGENT', x: -1.25, y: 2.25, w: 1.05, d: .73, h: .23, type: 'voice' }
  ];
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges = [['app','api'],['api','cloud'],['api','data'],['api','ai'],['voice','api']];
  const routes = {
    api: { nodes: ['app','api','data','api','app'], text: 'App \u2192 API \u2192 Database \u2192 Response' },
    ai: { nodes: ['app','api','ai','api','app'], text: 'App \u2192 API \u2192 AI engine \u2192 Response' },
    voice: { nodes: ['voice','api','ai','api','voice'], text: 'Call \u2192 API \u2192 AI engine \u2192 Voice response' }
  };
  let route = 'api', width = 600, height = 390, unit = 60;
  let elapsed = 0, previous = 0, frame = 0, visible = true, lastPaint = 0;
  let yaw = -.04, pitch = 0, targetYaw = -.04, targetPitch = 0;
  const palette = { accent: '#ef6246', ink: '#c3b7a4', bright: '#e8dfcf', muted: '#817e74' };

  function project(x, y, z = 0) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const rx = x*c - y*s, ry = x*s + y*c;
    return { x: width * .52 + (rx - ry) * unit * .84, y: height * .46 + (rx + ry) * unit * (.4 + pitch) - z * unit * 1.05 };
  }
  function poly(points, fill, stroke, lineWidth = 1) {
    ctx.beginPath();
    points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }
  function line(points, color, lineWidth = 1) {
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
  }
  function rectOnPlane(x, y, z, w, d, fill, stroke) {
    const pts = [project(x-w/2,y-d/2,z),project(x+w/2,y-d/2,z),project(x+w/2,y+d/2,z),project(x-w/2,y+d/2,z)];
    poly(pts,fill,stroke); return pts;
  }
  function activeNode(id) { return routes[route].nodes.includes(id); }
  function edgeActive(a,b) {
    const r = routes[route].nodes;
    return r.some((id,i) => i < r.length-1 && (id===a&&r[i+1]===b || id===b&&r[i+1]===a));
  }
  function pathBetween(a,b) {
    const n1 = map[a], n2 = map[b];
    return [[n1.x,n1.y],[n2.x,n1.y],[n2.x,n2.y]];
  }
  function drawGrid() {
    const center = project(0,0);
    const glow = ctx.createRadialGradient(center.x,center.y,10,center.x,center.y,unit*4.5);
    glow.addColorStop(0,'rgba(154,108,65,.07)'); glow.addColorStop(1,'rgba(17,17,16,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
    for (let i=-4; i<=4; i+=.5) {
      const alpha = .018 + (1-Math.abs(i)/4)*.025;
      line([project(i,-3),project(i,3.5)],`rgba(195,183,164,${alpha})`,.65);
      line([project(-4,i),project(3.5,i)],`rgba(195,183,164,${alpha})`,.65);
    }
    [[-3.75,-2.8],[3,-2.8],[3,3.1],[-3.75,3.1]].forEach(([x,y]) => {
      const p=project(x,y); line([{x:p.x-3,y:p.y},{x:p.x+3,y:p.y}],'#4b473c',.8); line([{x:p.x,y:p.y-3},{x:p.x,y:p.y+3}],'#4b473c',.8);
    });
  }
  function drawTraces() {
    edges.forEach(([a,b]) => {
      const active = edgeActive(a,b), pts=pathBetween(a,b).map(([x,y])=>project(x,y,.015));
      if (active) { ctx.shadowColor=palette.accent; ctx.shadowBlur=8; }
      line(pts,active ? '#a34c36' : '#393a31',active ? 1.2 : .85);
      ctx.shadowBlur=0;
      const p=pts[1]; ctx.fillStyle=active?'#ba563b':'#46463c'; ctx.fillRect(p.x-1.5,p.y-1.5,3,3);
    });
  }
  function drawBlock(n) {
    const x=n.x,y=n.y,h=n.h,w=n.w,d=n.d, active=activeNode(n.id);
    const top=[project(x-w/2,y-d/2,h),project(x+w/2,y-d/2,h),project(x+w/2,y+d/2,h),project(x-w/2,y+d/2,h)];
    const bottom=[project(x-w/2,y-d/2),project(x+w/2,y-d/2),project(x+w/2,y+d/2),project(x-w/2,y+d/2)];
    ctx.shadowColor='rgba(0,0,0,.7)'; ctx.shadowBlur=16; ctx.shadowOffsetY=10;
    poly(bottom,'#080908',null); ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    const front=ctx.createLinearGradient(top[2].x,top[2].y,bottom[2].x,bottom[2].y);
    front.addColorStop(0,active?'#3b3a30':'#303129');front.addColorStop(1,'#151612');
    poly([top[1],top[2],bottom[2],bottom[1]],'#171a15','#44473a',.7);
    poly([top[2],top[3],bottom[3],bottom[2]],front,active?'#6e614c':'#45463b',.8);
    const fill=ctx.createLinearGradient(top[0].x,top[0].y,top[2].x,top[2].y);
    fill.addColorStop(0,active?'#42463a':'#34382e');fill.addColorStop(.5,'#2b3028');fill.addColorStop(1,'#20241e');
    poly(top,fill,active?'#9a8667':'#5b5d4f',.85);
    line([top[3],top[0],top[1]],active?'#b1a081':'#727360',.8);
    if(n.type==='screen'){
      rectOnPlane(x,y,h+.018,w*.78,d*.68,'#111b18','#6e7963');
      for(let i=0;i<3;i++)line([project(x-.3,y-.16+i*.13,h+.025),project(x+(i===1?.25:.06),y-.16+i*.13,h+.025)],i===0?palette.accent:'#697c68',1.2);
    }
    if(n.type==='server'){
      for(let i=1;i<=3;i++){
        const z=h*i/4;
        line([project(x-w/2+.07,y+d/2,z),project(x+w/2-.07,y+d/2,z)],'#72705b',.8);
        const led=project(x+w/2-.13,y+d/2,z+.015);ctx.fillStyle=i===2?palette.accent:'#bdb692';ctx.fillRect(led.x-1,led.y-1,2,2);
      }
      rectOnPlane(x,y,h+.01,w*.5,d*.52,'#242921','#686d54');
      const p=project(x,y,h+.025);ctx.fillStyle='#d0c4aa';ctx.font=`600 ${Math.max(8,unit*.17)}px Arial`;ctx.textAlign='center';ctx.fillText('API',p.x,p.y+3);
    }
    if(n.type==='chip'){
      for(let i=-2;i<=2;i++){
        line([project(x-w*.58,y+i*.13,h),project(x+w*.58,y+i*.13,h)],'#8b8766',1);
        line([project(x+i*.14,y-d*.62,h),project(x+i*.14,y+d*.62,h)],'#8b8766',1);
      }
      rectOnPlane(x,y,h+.02,w*.72,d*.7,'#171d18',active?'#c46b46':'#79795a');
      const p=project(x,y,h+.06);ctx.fillStyle=active?palette.accent:'#a5a08a';ctx.font=`700 ${Math.max(9,unit*.22)}px Arial`;ctx.textAlign='center';ctx.fillText('AI',p.x,p.y+4);
    }
    if(n.type==='voice'){
      rectOnPlane(x,y,h+.02,w*.8,d*.7,'#111b18','#4c5646');
      for(let i=0;i<11;i++){
        const amp=(.025+Math.abs(Math.sin(i*1.4+elapsed*2))*.12)*(active?1:.5),xx=x-.35+i*.07;
        line([project(xx,y-amp,h+.035),project(xx,y+amp,h+.035)],active?palette.accent:'#807d68',1.4);
      }
    }
    if(n.type==='cloud'){
      for(let i=-1;i<=1;i++)rectOnPlane(x+i*.23,y,h+.02,.13,d*.55,'#525844','#737f62');
    }
    if(n.type==='database'){
      // Three stacked cylindrical volumes, drawn in projected world space.
      const radius=.34;
      for(let layer=0;layer<3;layer++){
        const z=.12+layer*.2,zt=z+.16;
        const topCircle=[],frontCircle=[],bottomCircle=[];
        for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;topCircle.push(project(x+Math.cos(a)*radius,y+Math.sin(a)*radius,zt));}
        for(let i=0;i<=20;i++){const a=i/20*Math.PI;frontCircle.push(project(x+Math.cos(a)*radius,y+Math.sin(a)*radius,zt));bottomCircle.unshift(project(x+Math.cos(a)*radius,y+Math.sin(a)*radius,z));}
        poly([...frontCircle,...bottomCircle],'#353e30',active?'#a49b77':'#69725a',.7);
        poly(topCircle,'#535d47',active?'#b9aa84':'#8a9274',.75);
      }
    }
    // Labels remain screen-aligned, unlike the changing geometry.
    const caption=project(x,y+d/2+.22,0);
    ctx.textAlign='center';ctx.font=`500 ${width<400?8:9}px Arial`;
    ctx.fillStyle=active?palette.ink:'#7a7b6e';ctx.fillText(n.label,caption.x,caption.y+15);
  }
  function samplePath(a,b,progress) {
    const points=pathBetween(a,b), n1=points[0],n2=points[1],n3=points[2];
    const l1=Math.hypot(n2[0]-n1[0],n2[1]-n1[1]),l2=Math.hypot(n3[0]-n2[0],n3[1]-n2[1]);
    const d=progress*(l1+l2);
    if(d<=l1&&l1>0){const t=d/l1;return project(n1[0]+(n2[0]-n1[0])*t,n1[1]+(n2[1]-n1[1])*t,.06);}
    const t=l2?Math.max(0,(d-l1)/l2):0;return project(n2[0]+(n3[0]-n2[0])*t,n2[1]+(n3[1]-n2[1])*t,.06);
  }
  function drawPackets() {
    const ids=routes[route].nodes;
    for(let p=0;p<2;p++){
      const total=(elapsed*.48+p*1.7)%(ids.length-1),segment=Math.floor(total),t=total-segment;
      for(let k=9;k>=0;k--){
        const tt=t-k*.017;if(tt<0)continue;
        const point=samplePath(ids[segment],ids[segment+1],tt);
        ctx.beginPath();ctx.arc(point.x,point.y,k===0?2.3:1.3,0,Math.PI*2);
        ctx.fillStyle=k===0?'#ffd2ac':`rgba(239,98,70,${.5*(1-k/10)})`;
        if(k===0){ctx.shadowColor=palette.accent;ctx.shadowBlur=12;}
        ctx.fill();ctx.shadowBlur=0;
      }
    }
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    drawGrid();drawTraces();
    [...nodes].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawBlock);
    drawPackets();
    figure.classList.add('is-rendered');
  }
  function canAnimate(){return app.motionEnabled&&visible&&!document.hidden;}
  function loop(now) {
    frame=0;
    if(!canAnimate()) {previous=0;return;}
    if(now-lastPaint>=32){
      const dt=previous?Math.min(.065,(now-previous)/1000):.033;
      elapsed+=dt;previous=now;lastPaint=now;
      yaw+=(targetYaw-yaw)*.075;pitch+=(targetPitch-pitch)*.075;
      draw();
    }
    frame=requestAnimationFrame(loop);
  }
  function wake(){if(canAnimate()&&!frame){previous=0;frame=requestAnimationFrame(loop);}}
  function sleep(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}
  function resize(){
    const r=wrap.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    unit=Math.min(width/8.2,height/4.8);draw();wake();
  }
  wrap.addEventListener('pointermove',event=>{
    if(!app.motionEnabled||!fine.matches)return;
    const r=wrap.getBoundingClientRect();targetYaw=-.04+(event.clientX-r.left-r.width/2)/r.width*.25;targetPitch=(event.clientY-r.top-r.height/2)/r.height*.06;
  });
  wrap.addEventListener('pointerleave',()=>{targetYaw=-.04;targetPitch=0;});
  document.querySelectorAll('[data-flow]').forEach(button=>button.addEventListener('click',()=>{
    route=button.dataset.flow;if(!routes[route])return;
    elapsed=0;
    document.querySelectorAll('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.getElementById('system-route').textContent=routes[route].text;
    app.interaction('flow');draw();wake();
  }));
  document.addEventListener('portfolio:motion',()=>{if(app.motionEnabled)wake();else{sleep();draw();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sleep();else wake();});
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else sleep();},{rootMargin:'80px'});observer.observe(wrap);}
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(wrap);else window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pagehide',sleep);
  resize();
})();

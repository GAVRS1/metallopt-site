import {regions,cities} from './map-data.js?v=f46049cfcba3';
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=t=>t*t*(3-2*t);
export function mapMarkup(){
 const lines=cities.map((city,i)=>{if(city.parent<0)return '';const [x,y]=cities[city.parent].point,[tx,ty]=city.point;return `<path class="delivery-route" data-route="${i}" pathLength="1" d="M${x},${y} Q${(x+tx)/2},${(y+ty)/2-Math.min(38,Math.hypot(tx-x,ty-y)*.14)} ${tx},${ty}"/>`;}).join('');
 return `<section class="delivery-map" id="geography" aria-label="Карта регионов России"><div class="delivery-map__stage"><h2 class="delivery-map__headline">Доставим в любой<br/><span>регион России</span></h2><div class="delivery-map__viewport" tabindex="0" aria-label="Интерактивная карта регионов России."><svg class="delivery-map__svg" viewBox="35 15 1230 650" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Регионы и города"><g class="delivery-regions">${regions.map(r=>`<path data-region="${esc(r.id)}" d="${r.d}" role="button" tabindex="-1" aria-label="${esc(r.name)}"><title>${esc(r.name)}</title></path>`).join('')}</g><g class="delivery-routes" aria-hidden="true">${lines}</g><g class="delivery-cities">${cities.map((c,i)=>`<g class="delivery-city" data-map-city="${i}" transform="translate(${c.point.join(',')})" role="button" tabindex="-1" aria-label="${esc(c.name)}"><circle class="city-hit" r="15"/><circle class="city-halo" r="10"/><circle class="city-dot" r="4"/></g>`).join('')}</g></svg></div><div class="delivery-map__tooltip" aria-hidden="true" hidden></div></div></section>`;
}
export function mountMap(){
 const root=document.querySelector('.delivery-map');if(!root)return ()=>{};
 const abort=new AbortController(),options={signal:abort.signal},stage=root.querySelector('.delivery-map__stage'),viewport=root.querySelector('.delivery-map__viewport');
 const paths=[...root.querySelectorAll('[data-region]')],dots=[...root.querySelectorAll('[data-map-city]')],lines=[...root.querySelectorAll('[data-route]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,finished=reduced.matches,selected='',hovered='',progress=0,target=0,lastTime=0;
 root.classList.add('is-animated');
 const tooltip=root.querySelector('.delivery-map__tooltip');
 function tip(e,text){if(!finished||e.pointerType==='touch')return;const box=stage.getBoundingClientRect();tooltip.textContent=text;tooltip.hidden=false;tooltip.style.left=Math.max(8,Math.min(box.width-tooltip.offsetWidth-8,e.clientX-box.left+16))+'px';tooltip.style.top=Math.max(8,Math.min(box.height-tooltip.offsetHeight-8,e.clientY-box.top-40))+'px';}
 function draw(progress){
  root.style.setProperty('--map-reveal',ease(clamp(progress/.25)));
  root.style.setProperty('--headline-reveal',ease(clamp((progress-.18)/.5)));
  root.style.setProperty('--headline-shift',(1-ease(clamp((progress-.18)/.65)))*36+'px');
  if(!finished){tooltip.hidden=true;selected=hovered='';highlight('');}
  dots.forEach((dot,i)=>{const start=i===0?.12:.2+(i-1)/(cities.length-1)*.61;const v=ease(clamp((progress-start)/.16));dot.style.opacity=v;dot.style.setProperty('--dot-scale',.5+.5*v);});
  lines.forEach(line=>{const i=+line.dataset.route;const start=.22+(i-1)/(cities.length-1)*.57;const v=ease(clamp((progress-start)/.22));line.style.strokeDashoffset=1-v;line.style.opacity=Math.min(1,v*8)*.85;});
  root.classList.toggle('is-ready',finished);dots.forEach(dot=>dot.setAttribute('tabindex',finished?'0':'-1'));
 }
 function tick(time){
  frame=0;const dt=lastTime?Math.min(64,time-lastTime):16;lastTime=time;
  progress=reduced.matches?target:progress+(target-progress)*(1-Math.exp(-dt/180));
  if(Math.abs(target-progress)<.0003)progress=target;
  finished=progress>=.995;
  draw(progress);
  if(progress!==target)frame=requestAnimationFrame(tick);else lastTime=0;
 }
 function schedule(){
  const svg=root.querySelector('svg');root.style.setProperty('--dot-ratio',(svg.clientHeight/650)/(svg.clientWidth/1230)||1);
  const top=parseFloat(getComputedStyle(stage).top)||0,rect=root.getBoundingClientRect();
  target=reduced.matches?1:clamp((top-rect.top+innerHeight*.18)/Math.max(1,(root.offsetHeight-stage.offsetHeight)*.82));
  if(!frame)frame=requestAnimationFrame(tick);
 }
 function highlight(id){
  paths.forEach(path=>path.classList.toggle('is-selected',path.dataset.region===id));
  dots.forEach((dot,i)=>dot.classList.toggle('is-selected',cities[i].region===id));

 }
 function choose(id){if(!finished)return;selected=id;highlight(id);tooltip.textContent=regions.find(r=>r.id===id)?.name||'';}
 paths.forEach(path=>{
  const id=path.dataset.region;
  path.addEventListener('pointerenter',e=>{if(finished&&e.pointerType!=='touch'){hovered=id;highlight(id);}},options);
  path.addEventListener('pointermove',e=>tip(e,regions.find(r=>r.id===id).name),options);
  path.addEventListener('pointerleave',()=>{tooltip.hidden=true;if(hovered===id){hovered='';highlight(selected);}},options);
  path.addEventListener('click',()=>{if(finished)choose(id);},options);
 });
 dots.forEach((dot,i)=>{
  const city=cities[i];const show=()=>{if(finished)highlight(city.region);};
  dot.addEventListener('pointerenter',show,options);dot.addEventListener('pointermove',e=>tip(e,regions.find(r=>r.id===city.region)?.name||''),options);dot.addEventListener('pointerleave',()=>{tooltip.hidden=true;highlight(selected);},options);dot.addEventListener('focus',show,options);
  dot.addEventListener('click',()=>{if(finished)choose(city.region);},options);
  dot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(city.region);}},options);
 });
 window.addEventListener('scroll',schedule,{...options,passive:true});window.addEventListener('resize',schedule,{...options,passive:true});reduced.addEventListener('change',schedule,options);
 const resize=new ResizeObserver(schedule);resize.observe(root);schedule();
 return ()=>{abort.abort();resize.disconnect();cancelAnimationFrame(frame);};
}

// Temporary photographic preview; the original 3D renderer remains available separately.
export function createSteelPhoto(host){
  const root=host.closest('.product-showcase'),loading=host.querySelector('.stage-loading');
  const controller=new AbortController(),options={signal:controller.signal};
  host.classList.add('steel-photo-stage');
  const samples=[['0','steel-pipe-photo-test.webp','Стальная труба'],['2','steel-rebar-photo-test.webp','Стальная арматура']];
  const images=samples.map(([id,file,alt])=>{
    const frame=document.createElement('div');frame.className='steel-photo-frame';frame.dataset.sample=id;
    const image=new Image();image.alt=alt;image.draggable=false;image.decoding='async';
    image.addEventListener('load',()=>{if(id==='0')loading.hidden=true;},options);
    image.addEventListener('error',()=>{loading.hidden=false;loading.textContent='Не удалось загрузить изображение';},options);
    image.src='/assets/'+file;frame.append(image);host.append(frame);return frame;
  });
  const select=id=>{
    images.forEach(frame=>{const active=frame.dataset.sample===id;frame.classList.toggle('is-active',active);frame.setAttribute('aria-hidden',String(!active));});
    root.querySelectorAll('[data-steel]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.steel===id)));
  };
  root.querySelectorAll('[data-steel]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.steel),options));
  select('0');
  const observer=new IntersectionObserver(entries=>host.classList.toggle('is-paused',!entries[0].isIntersecting));observer.observe(host);
  return ()=>{controller.abort();observer.disconnect();images.forEach(frame=>frame.remove());host.classList.remove('steel-photo-stage','is-paused');};
}

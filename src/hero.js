export const heroMarkup=()=>`<section class="product-hero" aria-label="Металлопрокат под заказ">
  <div class="product-hero-inner">
    <div class="product-showcase">
      <div class="steel-stage" data-steel-stage aria-label="Анимированные изображения металлопроката">
        <div class="stage-loading" role="status">Загружаем изображение…</div>
      </div>
      <div class="stage-controls" aria-label="Выбрать образец">
        <button type="button" data-steel="0" aria-pressed="true">Труба</button>
        <button type="button" data-steel="2" aria-pressed="false">Арматура</button>
      </div>
    </div>
    <div class="product-hero-copy">
      <p class="product-hero-kicker">МЕТАЛЛОПТ МСК</p>
      <h1>Металлопрокат<br>под ваш заказ</h1>
      <p class="product-hero-description">Трубы, балки и арматура<br>Подберём размер и рассчитаем стоимость</p>
      <div class="product-hero-actions"><button type="button" data-request>Заказать</button><a href="/catalog/">Перейти в каталог</a></div>
    </div>
  </div>
</section>`;

// Each route owns its renderer; navigating away releases GPU resources immediately.
export function mountHero(){
  const stage=document.querySelector('[data-steel-stage]');
  if(!stage)return ()=>{};
  let cancelled=false,dispose;
  import('./steel-photo.js?v=c4ebbe273fa3').then(({createSteelPhoto})=>{
    if(!cancelled)dispose=createSteelPhoto(stage);
  }).catch(()=>{
    if(!cancelled)stage.querySelector('.stage-loading').textContent='Изображение недоступно. Товары доступны в каталоге.';
  });
  return ()=>{cancelled=true;dispose?.();};
}

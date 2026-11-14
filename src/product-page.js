import icons from './icons.js?v=aa162b052c8a';
import {escapeHtml as esc,relatedProductsMarkup} from './site-pages.js?v=aa162b052c8a';
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n);
const unitLabel=u=>({'т':'тонну','шт':'штуку','м':'метр','м²':'м²','кг':'кг','лист':'лист','рулон':'рулон'}[u]||u);
export const price=p=>p.price===null?'По запросу':`${money(p.price)} ₽ <small>за ${esc(unitLabel(p.unit))}</small>`;
export function props(p){return Object.entries(p.props).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');}
export const image=(p,loading="lazy")=>`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="${loading}" width="90" height="90">`;
export function productOrder(p,cart){return `<div class="product-order"><label class="quantity"><button data-step="-1" aria-label="Уменьшить количество">−</button><input type="number" min="1" max="99999" step="1" inputmode="numeric" value="${cart[p.id]||1}" aria-label="Количество: ${esc(p.name)}"><button data-step="1" aria-label="Увеличить количество">+</button></label><button class="button add-product" data-add="${p.id}" aria-pressed="${Boolean(cart[p.id])}" title="${cart[p.id]?'Убрать из корзины':'Добавить в корзину'}">${icons['shopping-cart']} ${cart[p.id]?'В корзине':'В корзину'}</button></div>`;}
export function singleProductBody(p,cart){
 const stock={in_stock:'В наличии',on_order:'Под заказ',out_of_stock:'Нет в наличии'};
 return `<article class="sku-layout" data-product="${esc(p.id)}">
 <button type="button" class="sku-photo" data-photo="${esc(p.id)}" aria-label="Увеличить фотографию">${image(p,"eager")}</button>
 <div class="sku-details"><h1>${esc(p.name)}</h1><div class="sku-meta"><span>Артикул ${esc(p.sku)}</span><span class="product-stock ${p.status}">${stock[p.status]}</span></div>
 <dl class="sku-specs">${props(p)}</dl><div class="product-price">${price(p)}</div>${productOrder(p,cart)}<a class="sku-cart-link" href="/cart/">Перейти в корзину</a></div></article>`;
}
export function productPageMarkup(product,categoryName,products,cart={}){
 return `<nav class="catalog-breadcrumb"><a href="/catalog/">Каталог</a> / <a href="${'/catalog/'+esc(product.category)+'/'}">${esc(categoryName)}</a></nav><div id="catalog-results" class="sku-page">${singleProductBody(product,cart)}</div>${relatedProductsMarkup(product,products)}`;
}

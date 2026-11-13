import {categories as initialCategories} from './catalog-categories.js?v=2f1b84ed4272';
export let categories=initialCategories;
export let products=[];
const project='hh8uv5g8',dataset='production';
export const query=`{"categories":*[_type=="category"]|order(order asc){"id":path,name,"parent":parent->path},"products":*[_type=="product" && defined(category->path)]|order(order asc){_id,name,sku,price,unit,status,"category":category->path,"image":image.asset->url,parameters}}`;
export function normalizeCatalog(result){
 if(!Array.isArray(result?.products)||!Array.isArray(result?.categories))throw Error('Invalid catalog response');
 const cats=result.categories.filter(c=>typeof c.id==='string'&&/^[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/.test(c.id)&&typeof c.name==='string').map(c=>({...c,parent:c.parent||''}));
 const ids=new Set(cats.map(c=>c.id));
 const rows=result.products.filter(p=>typeof p._id==='string'&&typeof p.name==='string'&&ids.has(p.category)).map(p=>({
  id:p._id.startsWith('product-')?p._id.slice(8):p._id,name:p.name,sku:p.sku||'',category:p.category,
  price:typeof p.price==='number'&&Number.isFinite(p.price)&&p.price>=0?p.price:null,
  unit:['шт','т','м','м²','кг','лист','рулон'].includes(p.unit)?p.unit:'шт',
  status:['in_stock','on_order','out_of_stock'].includes(p.status)?p.status:'on_order',inStock:p.status==='in_stock',
  image:typeof p.image==='string'&&p.image.startsWith('https://cdn.sanity.io/images/'+project+'/')?p.image+'?w=640&fit=max&auto=format':'/brand/mark-light.svg',
  props:Object.fromEntries((p.parameters||[]).filter(v=>typeof v.value==='string'&&typeof (v.name==='custom'?v.customName:v.name)==='string').map(v=>[v.name==='custom'?v.customName:v.name,v.value]))
 }));
 return {categories:cats,products:rows};
}
export async function fetchCatalog({cdn=true,request=fetch}={}){
 const url=`https://${project}.${cdn?'apicdn':'api'}.sanity.io/v2025-02-19/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`;
 const response=await request(url,{signal:AbortSignal.timeout(12000),credentials:'omit'});
 if(!response.ok)throw Error('Catalog unavailable');
 return normalizeCatalog((await response.json()).result);
}
let pending,lastLoaded=0;
export function loadCatalog(){
 if(lastLoaded&&Date.now()-lastLoaded<60000)return Promise.resolve();
 if(!pending)pending=fetchCatalog().then(data=>{categories=data.categories;products=data.products;lastLoaded=Date.now();}).finally(()=>{pending=null;});
 return pending;
}

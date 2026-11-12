const names={Moscow:'Москва',Moskva:'Москва','Saint Petersburg':'Санкт-Петербург','St Petersburg':'Санкт-Петербург',Kazan:'Казань',Yekaterinburg:'Екатеринбург',Novosibirsk:'Новосибирск','Nizhny Novgorod':'Нижний Новгород',Samara:'Самара',Krasnodar:'Краснодар',Chelyabinsk:'Челябинск','Rostov-on-Don':'Ростов-на-Дону',Krasnoyarsk:'Красноярск',Ufa:'Уфа',Perm:'Пермь',Tyumen:'Тюмень',Voronezh:'Воронеж',Omsk:'Омск',Khabarovsk:'Хабаровск',Vladivostok:'Владивосток'};
Object.assign(names,{Sochi:'Сочи',Astrakhan:'Астрахань',"Saint-Petersburg":'Санкт-Петербург'});
export function cityName(data){
 const raw=typeof data?.city==='string'?data.city.trim():'';
 if(!raw||raw.length>80||!/[\p{L}]/u.test(raw)||! /^[\p{L}\p{N} .,'’()–—-]+$/u.test(raw))return '';
 return data.country_code==='RU'?(names[raw]||raw):raw;
}
export async function lookupCity(request=fetch){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),5000);
 try{
  const response=await request('https://get.geojs.io/v1/ip/geo.json',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
  return response.ok?cityName(await response.json()):'';
 }catch{return '';}finally{clearTimeout(timer);}
}

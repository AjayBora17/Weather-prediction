const $=id=>document.getElementById(id);
let data=null, unit='C', controller=null, sequence=0;
const text=(id,value)=>{$(id).textContent=value;};
const temp=value=>Number.isFinite(value)?`${Math.round(unit==='C'?value:value*9/5+32)}°`:'—';
const number=(value,suffix='',multiplier=1)=>Number.isFinite(value)?`${Math.round(value*multiplier*10)/10}${suffix}`:'—';
const symbol=code=>code>=800?(code===800?'☀':'☁'):code>=700?'≋':code>=600?'❄':code>=500?'☂':code>=300?'☂':'ϟ';
function localDate(time){return new Date((time+data.offset)*1000);}
function timeLabel(time){return Number.isFinite(time)?localDate(time).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}):'—';}
function element(tag,content,className){const node=document.createElement(tag);node.textContent=content;if(className)node.className=className;return node;}
function render(){
 if(!data)return;
 $('empty').hidden=true;$('dashboard').hidden=false;
 text('place',`${data.city}${data.country?', '+data.country:''}`);
 text('date-line',localDate(data.updated).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}));
 text('badge',data.sample?'Sample · not live':`Observed ${timeLabel(data.updated)}`);
 text('report-label',data.sample?'SAMPLE CONDITIONS':'CURRENT CONDITIONS');
 text('local-time',`${timeLabel(data.updated)} local`);text('temperature',temp(data.temp));text('weather-symbol',symbol(data.code));text('description',data.description);text('feels-like',`Feels like ${temp(data.feelsLike)}${unit}`);
 text('sunrise',timeLabel(data.sunrise));text('sunset',timeLabel(data.sunset));text('humidity',number(data.humidity,'%'));text('wind',number(data.wind,' km/h',3.6));text('visibility',number(data.visibility,' km',.001));text('pressure',number(data.pressure,' hPa'));
 $('hourly').replaceChildren();$('daily').replaceChildren();
 if(!data.forecast.length){$('hourly').append(element('p','Forecast is currently unavailable. Current conditions are shown.','hour'));return;}
 data.forecast.slice(0,8).forEach(p=>{const card=element('article','','hour');card.append(element('p',timeLabel(p.time)),element('span',symbol(p.code),'symbol'),element('b',temp(p.temp)),element('small',`${p.rain}% rain`));card.title=p.description;$('hourly').append(card);});
 const days=new Map();
 data.forecast.forEach(p=>{const key=localDate(p.time).toISOString().slice(0,10);if(!days.has(key))days.set(key,[]);days.get(key).push(p);});
 [...days.values()].slice(0,5).forEach(points=>{const representative=points[Math.floor(points.length/2)], card=element('article','','day');const label=localDate(points[0].time).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',timeZone:'UTC'});const range=element('p',temp(Math.max(...points.map(p=>p.temp))),'range');range.append(element('span',temp(Math.min(...points.map(p=>p.temp)))));card.append(element('h3',label),element('span',symbol(representative.code),'symbol'),range,element('small',`${Math.max(...points.map(p=>p.rain))}% rain`));card.title=representative.description;$('daily').append(card);});
}
function setBusy(busy){$('search-button').disabled=busy;$('location').disabled=busy;$('search-button').textContent=busy?'Finding…':'Find weather ↗';$('dashboard').setAttribute('aria-busy',String(busy));}
function showError(message){text('error',message);$('error').hidden=false;}
async function load(params){const request=++sequence;controller?.abort();controller=new AbortController();setBusy(true);$('error').hidden=true;text('status','Looking up the latest weather…');const timeout=setTimeout(()=>controller?.abort(),15000);
 try{const response=await fetch(`/api/weather?${new URLSearchParams(params)}`,{signal:controller.signal});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to load weather.');if(request!==sequence)return;data=result;render();text('status',result.forecastAvailable?'Weather report ready · provided by OpenWeather':'Current conditions ready · forecast temporarily unavailable');}
 catch(error){if(request!==sequence)return;showError(error.name==='AbortError'?'The request timed out. Please try again.':error.message||'Check your connection and try again.');text('status',data?'Previous report remains below.':'Try another city or open the sample forecast below.');}
 finally{clearTimeout(timeout);if(request===sequence)setBusy(false);}
}
$('search-form').addEventListener('submit',event=>{event.preventDefault();const city=$('city').value.trim();if(city)load({city});});
document.querySelectorAll('[data-city]').forEach(button=>button.addEventListener('click',()=>{$('city').value=button.dataset.city;load({city:button.dataset.city});}));
$('location').addEventListener('click',()=>{if(!navigator.geolocation){showError('Your browser does not support location lookup. Search by city instead.');return;}text('status','Waiting for your location permission…');navigator.geolocation.getCurrentPosition(position=>load({lat:position.coords.latitude,lon:position.coords.longitude}),()=>{text('status','Location lookup was not completed.');showError('Couldn’t access your location. Allow location access or search for a city.');},{timeout:10000,maximumAge:300000});});
for(const [id,value] of [['celsius','C'],['fahrenheit','F']])$(id).addEventListener('click',()=>{unit=value;for(const [button,u] of [['celsius','C'],['fahrenheit','F']]){$(button).classList.toggle('active',unit===u);$(button).setAttribute('aria-pressed',String(unit===u));}render();});
$('demo-button').addEventListener('click',()=>{sequence++;controller?.abort();setBusy(false);$('error').hidden=true;const now=1789452000;data={sample:true,city:'New Delhi',country:'IN',offset:19800,updated:now,temp:28,feelsLike:30,humidity:64,pressure:1012,wind:3.2,visibility:6000,sunrise:1789432800,sunset:1789477200,description:'Partly cloudy',code:802,forecastAvailable:true,forecast:Array.from({length:40},(_,i)=>({time:now+(i+1)*10800,temp:27+Math.sin(i*.75)*5,humidity:64,rain:[10,15,20,5,0][i%5],description:'Partly cloudy',code:[800,802,803,800][i%4]}))};render();text('status','Design preview only · these are illustrative values, not current weather.');});

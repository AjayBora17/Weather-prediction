import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/weather.js';
const originalFetch=globalThis.fetch,originalKey=process.env.OPENWEATHER_API_KEY;
afterEach(()=>{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENWEATHER_API_KEY;else process.env.OPENWEATHER_API_KEY=originalKey;});
async function invoke(url='/api/weather?city=Delhi',method='GET'){const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(v){this.body=v;return this;}};await handler({url,method},res);return res;}
const current={name:'Delhi',sys:{country:'IN',sunrise:10,sunset:20},main:{temp:28,feels_like:30,humidity:50,pressure:1010},wind:{speed:3},weather:[{id:800,description:'clear sky'}],dt:100,timezone:19800,visibility:6000};
test('Rejects non-GET requests',async()=>assert.equal((await invoke(undefined,'POST')).code,405));
test('Validates missing city and invalid coordinates',async()=>{for(const q of ['', '?lat=91&lon=2','?lat=&lon=1'])assert.equal((await invoke('/api/weather'+q)).code,400);});
test('Missing credentials is actionable',async()=>{delete process.env.OPENWEATHER_API_KEY;assert.equal((await invoke()).code,503);});
test('Normalizes current and forecast without exposing key',async()=>{process.env.OPENWEATHER_API_KEY='test-secret';globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('/forecast?')?{list:[{dt:200,main:{temp:29,humidity:50},weather:[{id:800,description:'clear'}],pop:.2}]}:current});const r=await invoke();assert.equal(r.code,200);assert.equal(r.body.forecast[0].rain,20);assert.equal(JSON.stringify(r.body).includes('test-secret'),false);});
test('Forecast failure preserves current weather',async()=>{process.env.OPENWEATHER_API_KEY='test';globalThis.fetch=async url=>url.includes('/forecast?')?{ok:false,status:403}:{ok:true,json:async()=>current};const r=await invoke();assert.equal(r.code,200);assert.equal(r.body.forecastAvailable,false);});
test('Maps not found, credentials and quota errors',async()=>{process.env.OPENWEATHER_API_KEY='test';for(const [provider,expected] of [[404,404],[401,502],[429,429]]){globalThis.fetch=async()=>({ok:false,status:provider});assert.equal((await invoke()).code,expected);}});
test('Handles network failure',async()=>{process.env.OPENWEATHER_API_KEY='test';globalThis.fetch=async()=>{throw new Error('offline');};assert.equal((await invoke()).code,502);});

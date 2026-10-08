export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({error:'Use GET to request weather.'}); }
  const params = new URL(req.url, 'http://localhost').searchParams;
  const city = (params.get('city') || '').trim();
  const hasCoordinates = params.has('lat') && params.has('lon');
  const lat = Number(params.get('lat')), lon = Number(params.get('lon'));
  if (hasCoordinates ? (!params.get('lat')?.trim() || !params.get('lon')?.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180) : (!city || city.length>120)) return res.status(400).json({error:'Enter a city name or valid coordinates.'});
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return res.status(503).json({error:'Weather service is not configured. Add OPENWEATHER_API_KEY in your hosting settings.'});
  const query = new URLSearchParams({appid:key, units:'metric', ...(hasCoordinates?{lat:String(lat),lon:String(lon)}:{q:city})});
  async function fetchWeather(path) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/${path}?${query}`, {signal:AbortSignal.timeout(10000)});
    if (!response.ok) { const error=new Error('Provider error'); error.status=response.status; throw error; }
    return response.json();
  }
  try {
    const [currentResult, forecastResult] = await Promise.allSettled([fetchWeather('weather'),fetchWeather('forecast')]);
    if(currentResult.status==='rejected') throw currentResult.reason;
    const c=currentResult.value;
    if(!Number.isFinite(c.main?.temp) || !c.weather?.[0] || !c.sys || !c.wind) throw new Error('Invalid provider response');
    const forecast=forecastResult.status==='fulfilled' && Array.isArray(forecastResult.value.list) ? forecastResult.value.list : [];
    const points=forecast.filter(p=>Number.isFinite(p.main?.temp)&&p.weather?.[0]).map(p=>({time:p.dt,temp:p.main.temp,humidity:p.main.humidity,rain:Math.round((p.pop||0)*100),description:p.weather[0].description,code:p.weather[0].id}));
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({city:c.name,country:c.sys.country,offset:c.timezone||0,updated:c.dt,temp:c.main.temp,feelsLike:c.main.feels_like,humidity:c.main.humidity,pressure:c.main.pressure,wind:c.wind.speed,visibility:c.visibility,sunrise:c.sys.sunrise,sunset:c.sys.sunset,description:c.weather[0].description,code:c.weather[0].id,forecast:points,forecastAvailable:points.length>0,source:'OpenWeather'});
  } catch(error) {
    const status=error.status===404?404:error.status===429?429:502;
    const message=error.status===404?'We couldn’t find that city. Try “Delhi, IN” or another nearby city.':error.status===429?'Weather service is busy. Please try again shortly.':error.status===401?'Weather service credentials need attention. Check the API key in your hosting settings.':'Weather is temporarily unavailable. Please try again.';
    return res.status(status).json({error:message});
  }
}

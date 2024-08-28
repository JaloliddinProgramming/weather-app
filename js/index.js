const regions = {
    tashkent:  [41.2646, 69.2163],
    andijan:   [40.7500, 72.3333],
    bukhara:   [39.7747, 64.4286],
    fergana:   [40.3842, 71.7843],
    jizzakh:   [40.1158, 67.8422],
    namangan:  [40.9983, 71.6726],
    navoiy:    [40.0844, 65.3792],
    qarshi:    [38.8667, 65.8000],
    samarqand: [39.6542, 66.9597],
    guliston:  [40.4897, 68.7842],
    termez:    [37.2242, 67.2783],
    nurafshon: [41.0429, 69.3578],
    urgench:   [41.5500, 60.6333],
    nukus:     [42.4531, 59.6103],
}

const selectedRegion = "tashkent";
const regionNames = document.querySelector('.region-names');
const forecastBody = document.querySelector('.forecast-body');
const currentTemp = document.querySelector('.temperature');
const currentCondition = document.querySelector('.condition');
const currentHumidity = document.querySelector('.humidity');
const currentImg = document.querySelector('.weather-icon img');

const savedData = [];

// highlight of region name
const highlight = (event) => {
    const prevRegion = document.querySelector('.region-name-active');
    if (prevRegion) prevRegion.classList.remove('region-name-active');
    event.currentTarget.classList.add('region-name-active');
}

// Highlight of default region name
const highlightDefault = (region) => {
    const regionItems = document.querySelectorAll('.region-name');
    const selectedItem = Array.from(regionItems).find((item) => item.innerHTML == region.toUpperCase());
    selectedItem.classList.add('region-name-active');
}

// Show whole page data
async function showPage(region) {
    const localData = await JSON.parse(localStorage.getItem('weather-data'));
    const localItem = localData.filter((x) => x.region == region)[0].data;
    const data = localItem.length != 0 ? localItem : await getWeatherData(urlRegion(region));
    showBody(data.current);
    showCards(data.daily);
}

// Region menu items listeners
Object.keys(regions).map((item) => {
    const region = document.createElement('div');
    region.className = 'region-name';
    region.addEventListener("click", (event) => {
        highlight(event);
        showPage(item);
    });
    region.innerHTML = item.toUpperCase();
    regionNames.append(region);
})

// Make url from based on region name
function urlRegion(regionName) {
    const [lat, lon] = regions[regionName];
    const api = '9dd86907fe501cec50da3d087e4e9dc0';
    return `https://api.openweathermap.org/data/2.8/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${api}&units=metric&lang=ru`;
}

// Drow page of selected region
function showBody(current) {
    currentTemp.innerHTML = `${Math.round(current.temp)}&#8451;`;
    currentCondition.innerHTML = current.weather[0].main;
    currentHumidity.innerHTML = `Humidity: ${current.humidity}%`;
    currentImg.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
}

// Draw cards of selected region
function showCards(data) {
    forecastBody.innerHTML = "";
    data.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const date = new Date(item.dt * 1000);
        const time = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}`;
        const img = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        const temperature = `${Math.round(item.temp.day)}&#8451;`;
        const condition = item.weather[0].main;

        card.innerHTML =
            `<div class="forecast-time">${time}</div>
            <img src="${img}" alt="Weather Icon" />
            <div class="card-temperature">${temperature}</div>
            <div>${condition}</div>`;

        forecastBody.appendChild(card);
    });
}

// Get selected region data from api
async function getWeatherData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

// Get all data from api
async function getAllWeatherData() {
    try {
        let allData = await Promise.all(
            Object.keys(regions).map(async (region) => {
                const response = await fetch(urlRegion(region));
                const data = await response.json();
                return { region: region, data: data };
            })
        );
        return allData;
    } catch (error) {
        console.error(error);
    }
}

// Default region
getWeatherData(urlRegion(selectedRegion)).then((response) => {
    showBody(response.current);
    showCards(response.daily);
});

// Default region highlight
highlightDefault(selectedRegion);

// Save to Storage
getAllWeatherData().then((response) => {
    localStorage.setItem('weather-data', JSON.stringify(response));
});
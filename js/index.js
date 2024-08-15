const regions = {
    "tashkent": [41.2646, 69.2163],
    "andijan": [40.75, 72.3333],
    "bukhara": [39.7747, 64.4286],
    "fergana": [40.3842, 71.7843],
    "jizzakh": [40.1158, 67.8422],
    "namangan": [40.9983, 71.6726],
    "navoiy": [40.0844, 65.3792],
    "qarshi": [38.8667, 65.8],
    "samarqand": [39.6542, 66.9597],
    "guliston": [40.4897, 68.7842],
    "termez": [37.2242, 67.2783],
    "nurafshon": [41.0429, 69.3578],
    "urgench": [41.55, 60.6333],
    "nukus": [42.4531, 59.6103],
}
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const selectedRegion = "tashkent";
const regionNames = document.querySelector('.region-names');
const forecastBody = document.querySelector('.forecast-body');
let savedData = [];

let highlight = (event) => {
    const prevRegion = document.querySelector('.region-name-active');
    if (prevRegion) prevRegion.classList.remove('region-name-active');
    event.target.classList.add('region-name-active');
}

let highlightDefault = (region) => {
    let regionItems = document.querySelectorAll('.region-name');
    let selectedItem = Array.from(regionItems).find((item) => item.innerHTML == region.toUpperCase());
    selectedItem.classList.add('region-name-active');
}

Object.keys(regions).map((item) => {
    async function handler() {
        document.querySelector('.forecast-body').innerHTML = '';
        let localData = await JSON.parse(localStorage.getItem('weather-data'));
        let localItem = localData.filter((x) => x.region == item)[0].data;
        let data = localItem.length != 0 ? localItem : await getWeatherData(urlRegion(item));
        showPage(data);
        showCards(data);
    }
    let region = document.createElement('div');
    region.className = 'region-name';
    region.addEventListener("click", handler);
    region.addEventListener("click", highlight);
    region.innerHTML = item.toUpperCase();
    regionNames.append(region);
})

function urlRegion(regionName) {
    let lat = regions[regionName][0], long = regions[regionName][1];
    return "https://api.openweathermap.org/data/2.8/onecall?lat=" + lat + "&lon=" + long + "&exclude=minutely,hourly,alerts&appid=9dd86907fe501cec50da3d087e4e9dc0&units=metric&lang=ru";
}

function showPage(data) {
    const currentTemp = document.querySelector('.temprature');
    const currentCondition = document.querySelector('.condition');
    const currentHumidity = document.querySelector('.humidity');
    const currentImg = document.querySelector('.weather-icon img');
    currentTemp.innerHTML = Math.round(data.current.temp) + "&#8451";
    currentCondition.innerHTML = data.current.weather[0].main;
    currentHumidity.innerHTML = "Humidity: " + data.current.humidity + "%";
    currentImg.src = "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
}

function showCards(data) {
    data.daily.map((item) => {
        let card = document.createElement('div');
        card.classList.add('forecast-card');
        let time = document.createElement('div');
        let date = new Date(item.dt * 1000);
        time.innerHTML = month[date.getMonth()] + " " + date.getDate();
        time.classList.add("forecast-time");
        let img = document.createElement('img');
        img.src = "https://openweathermap.org/img/wn/" + item.weather[0].icon + "@2x.png";
        let temprature = document.createElement('div');
        temprature.innerHTML = Math.round(item.temp.day) + '&#8451';
        temprature.classList.add('card-temprature');
        let condition = document.createElement('div');
        condition.innerHTML = item.weather[0].main;
        card.append(time, img, temprature, condition);
        forecastBody.append(card);
    });
}

async function getWeatherData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function getAllWeatherData() {
    let allData = await Promise.all(
        Object.keys(regions).map(async (region) => {
            const response = await fetch(urlRegion(region));
            const data = await response.json();
            return { region: region, data: data };
        })
    );
    return allData;
}


// Default region
getWeatherData(urlRegion(selectedRegion)).then((response) => {
    showCards(response);
    showPage(response);
});
highlightDefault(selectedRegion);

// Save to Storage
getAllWeatherData().then((response) => {
    localStorage.setItem('weather-data', JSON.stringify(response));
});
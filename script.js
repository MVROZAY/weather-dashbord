const apiKey = process.env.API_KEY;
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const weatherInfo = document.getElementById('weather-info');

let cities = [];

function saveCityToLocalStorage(city) {
  cities.push(city);
  localStorage.setItem('cities', JSON.stringify(cities));
  updateSearchHistory();
}

function updateSearchHistory() {
  searchHistory.innerHTML = '';
  cities.forEach((city) => {
    const link = document.createElement('a');
    link.textContent = city;
    link.addEventListener('click', () => {
      fetchWeatherData(city);
    });
    searchHistory.appendChild(link);
  });
}

function showWeatherInfo(currentWeatherData, forecastData) {
  const { name, dt, main, wind, weather } = currentWeatherData;
  const date = new Date(dt * 1000).toLocaleDateString();
  const iconUrl = `https://openweathermap.org/img/w/${weather[0].icon}.png`;
  const template = `
    <h2>${name} - ${date}</h2>
    <div class="current">
      <img src="${iconUrl}" alt="${weather[0].description}">
      <p>Temperature: ${main.temp} &#8451;</p>
      <p>Humidity: ${main.humidity}%</p>
      <p>Wind Speed: ${wind.speed} m/s</p>
    </div>
  `;

  const forecastList = forecastData.list;
  const forecastHTML = forecastList.slice(0, 5).map((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
    const forecastIconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    return `
      <div class="forecast">
        <p>${forecastDate}</p>
        <img src="${forecastIconUrl}" alt="${forecast.weather[0].description}">
        <p>Temperature: ${forecast.main.temp} &#8451;</p>
        <p>Wind Speed: ${forecast.wind.speed} m/s</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      </div>
    `;
  }).join('');

  weatherInfo.innerHTML = template + forecastHTML;
  weatherInfo.style.display = 'block';
}

async function fetchWeatherData(city) {
  try {
    const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      throw new Error('City not found. Please enter a valid city name.');
    }

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    showWeatherInfo(currentWeatherData, forecastData);
    saveCityToLocalStorage(city);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city !== '') {
    fetchWeatherData(city);
  }
});

window.addEventListener('load', () => {
  const storedCities = localStorage.getItem('cities');
  if (storedCities) {
    cities = JSON.parse(storedCities);
    updateSearchHistory();
  }
});

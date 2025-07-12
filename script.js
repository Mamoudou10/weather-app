// DOM Elements
const weatherForm = document.getElementById('weatherForm');
const locationInput = document.getElementById('locationInput');
const unitToggle = document.getElementById('unitToggle');
const weatherDisplay = document.getElementById('weatherDisplay');
const locationName = document.getElementById('locationName');
const temperature = document.getElementById('temperature');
const conditions = document.getElementById('conditions');
const weatherGif = document.getElementById('weatherGif');
const currentTime = document.getElementById('currentTime');
const tempUnit = document.getElementById('tempUnit');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// API Keys
const VC_API_KEY = 'MB9GFJ6VZ28Y9W7CNVR6UXC88';
const GIPHY_API_KEY = 'EykzpJVlrFonu3IRV8QG0qujnD8pJt0C&s';

let currentUnit = 'us'; // 'us' for Fahrenheit, 'metric' for Celsius

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    if (currentTime) {
        currentTime.textContent = `${timeString} • ${dateString}`;
    }
}

// Unit toggle event listener
unitToggle.addEventListener('change', () => {
    currentUnit = unitToggle.checked ? 'metric' : 'us';
    const location = locationName.textContent;
    if (location) {
        fetchWeather(location);
    }
});

// Form submit event listener
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (location) {
        fetchWeather(location);
    }
});

// Show loading state
function showLoading() {
    weatherDisplay.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
}

// Hide loading state
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(message) {
    hideLoading();
    weatherDisplay.classList.add('hidden');
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Fetch weather data
async function fetchWeather(location) {
    showLoading();
    
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
        location
    )}?unitGroup=${currentUnit}&key=${VC_API_KEY}&include=current`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Location not found. Please check the city name and try again.');
        }
        const data = await res.json();
        updateWeatherDisplay(data);
        fetchWeatherGif(data.currentConditions.conditions);
    } catch (err) {
        showError(err.message);
    }
}

// Update weather display
function updateWeatherDisplay(data) {
    const tempUnitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    const visibilityUnit = currentUnit === 'metric' ? 'km' : 'mi';
    
    // Update location and time
    locationName.textContent = data.resolvedAddress;
    updateCurrentTime();
    
    // Update temperature
    temperature.textContent = Math.round(data.currentConditions.temp);
    tempUnit.textContent = tempUnitSymbol;
    
    // Update feels like temperature
    const feelsLikeTemp = Math.round(data.currentConditions.feelslike);
    feelsLike.textContent = `${feelsLikeTemp}${tempUnitSymbol}`;
    
    // Update conditions
    conditions.textContent = data.currentConditions.conditions;
    
    // Update additional details
    humidity.textContent = `${Math.round(data.currentConditions.humidity)}%`;
    windSpeed.textContent = `${Math.round(data.currentConditions.windspeed)} ${windUnit}`;
    
    const visibilityValue = currentUnit === 'metric' 
        ? (data.currentConditions.visibility / 1.60934).toFixed(1)
        : data.currentConditions.visibility.toFixed(1);
    visibility.textContent = `${visibilityValue} ${visibilityUnit}`;
    
    // Show weather display
    hideLoading();
    errorMessage.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
    
    // Update background based on temperature and conditions
    updateBackground(data.currentConditions);
}

// Update background based on weather conditions
function updateBackground(conditions) {
    const temp = conditions.temp;
    const condition = conditions.conditions.toLowerCase();
    
    let gradient;
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
        gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
        gradient = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        gradient = 'linear-gradient(135deg, #90a4ae 0%, #78909c 100%)';
    } else if (condition.includes('clear') || condition.includes('sunny')) {
        if (temp < 0) {
            gradient = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
        } else if (temp < 15) {
            gradient = 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)';
        } else if (temp < 25) {
            gradient = 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)';
        } else {
            gradient = 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)';
        }
    } else {
        // Default gradient
        gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.style.background = gradient;
}

// Fetch weather GIF
async function fetchWeatherGif(condition) {
    const query = condition.toLowerCase().split(',')[0].trim();
    const giphyUrl = `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_API_KEY}&s=${encodeURIComponent(query + ' weather')}`;

    try {
        const res = await fetch(giphyUrl);
        if (!res.ok) {
            throw new Error('Could not load weather GIF');
        }
        const data = await res.json();
        
        if (data.data && data.data.images) {
            weatherGif.src = data.data.images.original.url;
            weatherGif.style.display = 'block';
        } else {
            weatherGif.style.display = 'none';
        }
    } catch (err) {
        console.error('Could not load GIF:', err.message);
        weatherGif.style.display = 'none';
    }
}

// Add input focus effects
locationInput.addEventListener('focus', () => {
    locationInput.parentElement.style.transform = 'translateY(-2px)';
});

locationInput.addEventListener('blur', () => {
    locationInput.parentElement.style.transform = 'translateY(0)';
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === locationInput) {
        weatherForm.dispatchEvent(new Event('submit'));
    }
});

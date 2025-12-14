const axios = require('axios');

// Get weather for a specific city (default: Dhaka)
exports.getWeather = async (req, res) => {
  try {
    const city = req.query.city || 'Dhaka';
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      feelsLike: Math.round(response.data.main.feels_like),
      windSpeed: response.data.wind?.speed || 0
    };

    res.json(weatherData);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (err.response?.status === 401) {
      return res.status(500).json({ message: 'Invalid weather API key' });
    }
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};


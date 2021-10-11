$(document).ready(function () {
    // Search variables
    const searchBtn = $("#button-search");
    let searchTerm = $("#search-term");
    let pastSearch = $("#past-search");
    let searchCity = "";
    const clearBtn = $("#clear-search");

    // Current weather variables
    const cityHeader = $("#city-date");
    const cityIcon = $("#weather-icon-current");
    const cityTemp = $("#city-temp");
    const cityHumidity = $("#city-humidity");
    const cityWindSpeed = $("#city-wind-speed");
    const cityUVIndex = $("#city-uv-index");

    // Moment
    const todaysDate = moment();

    // Current weather function
    function buildCurrentQueryURL() {
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?";

        let queryParams = { "APPID": "77672c68786de792de20e4e44617bd62" };

        queryParams.q = searchTerm
            .val()
            .trim();
        
        return queryURL + $.param(queryParams);
    }

    // Display search results based on API
    function updateCurrentWeather(response) {
        //display weather icon
        let weatherIcon = response.weather[0].icon;
        let weatherIconURL = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
        let weatherIconDescription = response.weather[0].description;
        // Temp: Convert to fahrenheit
        let tempF = (response.main.temp - 273.15) * 1.80 + 32;

        searchCity = response.name;

        cityHeader.text(`${searchCity} (${todaysDate.format("MM/DD/YYYY")})`);
        cityHeader.append(cityIcon.attr("src", weatherIconURL).attr("alt", `${weatherIconDescription}`).attr("title", `${weatherIconDescription}`));
        cityTemp.text(`Temperature: ${tempF.toFixed(2)} ℉`);
        cityHumidity.text(`Humidity: ${response.main.humidity}%`);
        cityWindSpeed.text(`Wind Speed: ${response.wind.speed} MPH`);

        //UV Index
        let currentLat = response.coord.lat;
        let currentLong = response.coord.lon;
        let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=77672c68786de792de20e4e44617bd62&lat=${currentLat}&lon=${currentLong}`;

        $.ajax({
            url: uvQueryURL,
            method: "GET"
        })

            .then(function (response) {
                let uvValue = response.value;
                cityUVIndex.text(`UV Index: `);
                let uvSpan = $("<span>").text(uvValue).addClass("p-2");

                if (uvValue >= 0 && uvValue < 3) {
                    uvSpan.addClass("green");
                }
                else if (uvValue >= 3 && uvValue < 6) {
                    uvSpan.addClass("yellow");
                }
                else if (uvValue >= 6 && uvValue < 8) {
                    uvSpan.addClass("orange");
                }
                else if (uvValue >= 8 && uvValue < 11) {
                    uvSpan.addClass("red");
                }
                else if (uvValue >= 11) {
                    uvSpan.addClass("black");
                }

                cityUVIndex.append(uvSpan);
            });
        
        // Call 5 day forecase
        let forecastQueryUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${currentLat}&lon=${currentLong}&exclude=current,minutely,hourly&appid=77672c68786de792de20e4e44617bd62`;
        
        $.ajax({
            url: forecastQueryUrl,
            method: "GET"
        })
            .then(function (response) {
                $(".card-day").each(function (day) {
                    day = day + 1;

                    let cardDateMoment = moment.unix(response.daily[day].dt).format
                    ("MM/DD/YYYY");

                    let weatherCardIcon = response.daily[day].weather[0].icon;
                    let weatherCardIconURL = `https://openweathermap.org/img/wn/${weatherCardIcon}.png`;
                    let weatherCardIconDesc = response.daily[day].weather[0].format.description;
                    
                    let cardTempF = (response.daily[day].temp.day - 273.15) * 1.80 + 32;

                    let cardHumidity = response.daily[day].humidity;

                    $($(this)[0].children[0].children[0]).text(cardDateMoment);

                    $($(this)[0].children[0].children[1].children[0]).attr("src", weatherCardIconURL).attr("alt", `${weatherCardIconDesc}`).attr("title", `${weatherCardIconDesc}`);

                    $($(this)[0].children[0].children[2]).text(`Temp: ${cardTempF.toFixed(2)} ℉`);

                    $($(this)[0].children[0].children[3]).text(`Humidity:${cardHumidity}%`);
                });
            })
    };
})
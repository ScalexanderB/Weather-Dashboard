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

                    let cardDateMoment = moment.unix(response.daily[day].dt).format("MM/DD/YYYY");

                    let weatherCardIcon = response.daily[day].weather[0].icon;
                    let weatherCardIconURL = `https://openweathermap.org/img/wn/${weatherCardIcon}.png`;
                    let weatherCardIconDesc = response.daily[day].weather[0].description;
                    
                    let cardTempF = (response.daily[day].temp.day - 273.15) * 1.80 + 32;

                    let cardHumidity = response.daily[day].humidity;

                    $($(this)[0].children[0].children[0]).text(cardDateMoment);

                    $($(this)[0].children[0].children[1].children[0]).attr("src", weatherCardIconURL).attr("alt", `${weatherCardIconDesc}`).attr("title", `${weatherCardIconDesc}`);

                    $($(this)[0].children[0].children[2]).text(`Temp: ${cardTempF.toFixed(2)} ℉`);

                    $($(this)[0].children[0].children[3]).text(`Humidity:${cardHumidity}%`);
                });
            })
    };

    // locally store past searches
    function storeSearchTerms(searchedCity) {
        localStorage.setItem("city" + localStorage.length, searchedCity);
    }

    // Display past searches as clickable buttons
    let storedSearchList = "";
    function displaySearchTerms() {
        pastSearch.empty();

        for (let i=0; i < localStorage.length; i++) {
            storedSearchList = localStorage.getItem("city" + i);
            let pastSearchBtn = $("<button>").text(storedSearchList).addClass("btn btn-primary button-srch m-2").attr("type", "submit");
            pastSearch.append(pastSearchBtn);    
        }
    }

    // Event listeners

    searchBtn.on("click", function(event) {
        event.preventDefault();
        storeSearchTerms(searchTerm[0].value.trim());
        displaySearchTerms();

        let queryURL = buildCurrentQueryURL();

        $.ajax({
            url: queryURL,
            metohd: "GET"
        })
            .then(updateCurrentWeather);
    });

    $(document).on("click", ".button-srch", function () {
        let pastCity = $(this).text();

        storeSearchTerms(pastCity);

        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?appid=77672c68786de792de20e4e44617bd62&q=${pastCity}`,
            method: "GET"
        })
            .then(updateCurrentWeather);
    });

    // Clear past searches function
    clearBtn.on("click", function() {
        localStorage.clear();
        pastSearch.empty();
        location.reload();
    });

    // Default city
    $( document ).ready(function() {
        
        displaySearchTerms();

        let pastCity = localStorage.getItem("city" + (localStorage.length -1));

        let qurl = "";

        if (localStorage.length === 0) {
            qurl = "https://api.openweathermap.org/data/2.5/weather?appid=77672c68786de792de20e4e44617bd62&q=Toronto";
        } else {
            qurl = `https://api.openweathermap.org/data/2.5/weather?appid=77672c68786de792de20e4e44617bd62&q=${pastCity}`;
        }
        $.ajax({
            url: qurl,
            method: "GET"
        })
            .then(updateCurrentWeather);
    });
});
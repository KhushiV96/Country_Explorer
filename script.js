const countriesPerPage = 20;
let currentPage = 0;
let allCountries = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Fetch country data from API
async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    allCountries = await response.json();
    displayCountries();
    displayFavorites();
}

// Display countries in cards based on the current page
function displayCountries(countries = null) {
    const container = document.getElementById('countries-container');
    container.innerHTML = '';

    const countriesToShow = countries || allCountries.slice(0, (currentPage + 1) * countriesPerPage);

    countriesToShow.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="${country.name.common}">
            <p>${country.name.common}</p>
            <button onclick="showCountryDetails('${country.name.common}')" class="details-btn">Details</button>
            <button onclick="toggleFavorite('${country.name.common}')" class="favorite-btn">
                ${favorites.includes(country.name.common) ? '❤️ Unfavorite' : '🤍 Favorite'}
            </button>
        `;
        container.appendChild(card);
    });
}

// Show more countries when "Show More" button is clicked
async function showMoreCountries() {
    currentPage++;
    const nextCountries = allCountries.slice(currentPage * countriesPerPage, (currentPage + 1) * countriesPerPage);
    nextCountries.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="${country.name.common}">
            <p>${country.name.common}</p>
            <button onclick="showCountryDetails('${country.name.common}')" class="details-btn">Details</button>
            <button onclick="toggleFavorite('${country.name.common}')" class="favorite-btn">
                ${favorites.includes(country.name.common) ? '❤️ Unfavorite' : '🤍 Favorite'}
            </button>
        `;
        document.getElementById('countries-container').appendChild(card);
    });
}

// Show details of a selected country
function showCountryDetails(countryName) {
    const country = allCountries.find(c => c.name.common === countryName);
    if (!country) return;

    const detailPage = `
        <div class="detail-container">
            <h2>${country.name.common}</h2>
            <img src="${country.flags.png}" alt="${country.name.common}" style="width: 150px; height: auto;">
            <p><strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(', ') : 'N/A'}</p>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Population:</strong> ${country.population}</p>
            <p><strong>Area:</strong> ${country.area} km²</p>
            <p><strong>Languages:</strong> ${Object.values(country.languages || {}).join(', ')}</p>
            <button onclick="goBack()">Back</button>
        </div>
    `;
    document.body.innerHTML = detailPage;
}

// Go back to the main page
function goBack() {
    document.body.innerHTML = `
        <header>
            <h1>Country Explorer</h1>
            <input type="text" id="search" placeholder="Search for countries...">
            <div id="suggestions" class="suggestions"></div>
            <button id="favorites-btn">Favorites</button>
        </header>
        <main>
            <div id="countries-container" class="countries-container"></div>
            <button id="show-more" class="show-more">Show More</button>
        </main>
    `;
    displayCountries();
    document.getElementById('show-more').onclick = showMoreCountries;
    addSearchFunctionality();
    document.getElementById('favorites-btn').onclick = showFavoritesPage;
}

// Toggle favorite status for countries
function toggleFavorite(countryName) {
    const index = favorites.indexOf(countryName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else if (favorites.length < 5) {
        favorites.push(countryName);
    } else {
        alert("You can only have up to 5 favorites!");
        return;
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayCountries();
    displayFavorites();
}

// Show full details of favorite countries with a remove button
function showFavoritesPage() {
    const favoritesPage = `
        <header>
            <h1>Your Favorite Countries</h1>
            <button onclick="goBack()">Back</button>
        </header>
        <main>
            <div id="favorites-list" class="favorites-list"></div>
        </main>
    `;
    document.body.innerHTML = favoritesPage;

    const favoritesList = document.getElementById('favorites-list');

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>No favorites added yet.</p>';
    } else {
        favoritesList.innerHTML = ''; // Clear existing favorites
        favorites.forEach(countryName => {
            const country = allCountries.find(c => c.name.common === countryName);
            if (country) {
                const countryCard = document.createElement('div');
                countryCard.className = 'country-card';
                countryCard.innerHTML = `
                    <img src="${country.flags.png}" alt="${country.name.common}">
                    <h3>${country.name.common}</h3>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Population:</strong> ${country.population}</p>
                    <p><strong>Area:</strong> ${country.area} km²</p>
                    <p><strong>Languages:</strong> ${Object.values(country.languages || {}).join(', ')}</p>
                    <button onclick="removeFavorite('${country.name.common}')" class="favorite-btn">
                        🗑️ Remove from Favorites
                    </button>
                `;
                favoritesList.appendChild(countryCard);
            }
        });
    }
}

// Remove country from favorites
function removeFavorite(countryName) {
    const index = favorites.indexOf(countryName);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showFavoritesPage(); // Refresh favorites page
    }
}

// Add search functionality
function addSearchFunctionality() {
    const searchInput = document.getElementById('search');
    const suggestionsContainer = document.getElementById('suggestions');

    searchInput.oninput = () => {
        const query = searchInput.value.toLowerCase();
        const suggestions = allCountries.filter(country => 
            country.name.common.toLowerCase().includes(query) ||
            (country.languages && Object.values(country.languages).some(lang => lang.toLowerCase().includes(query))) ||
            country.region.toLowerCase().includes(query)
        ).slice(0, 5);

        suggestionsContainer.innerHTML = '';

        suggestions.forEach(country => {
            const suggestionItem = document.createElement('div');
            suggestionItem.innerText = country.name.common;
            suggestionItem.onclick = () => {
                document.getElementById('countries-container').innerHTML = '';
                displayCountries([country]);
                suggestionsContainer.innerHTML = '';
            };
            suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.style.display = query ? 'block' : 'none';
    };
}

// Initialize application
fetchCountries();
document.getElementById('show-more').onclick = showMoreCountries;
document.getElementById('favorites-btn').onclick = showFavoritesPage;
addSearchFunctionality();

const container = document.querySelector('.container');
const countries = document.querySelector('.countries');
const btn = document.querySelector(".btn-country");


btn.addEventListener('click', (e) => {
  whereAmI();
})


async function whereAmI() {
  try {
    const { lat, lng } = await getCurrentLocation();

    const responseLatLng = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)

    if (!responseLatLng.ok) throw new Error(`Country not found ${responseLatLng.status}`);

    const countryData = await responseLatLng.json();
    const countryName = countryData.countryName;

    const responseCountryData = await fetch(`https://restcountries.com/v2/name/${countryName}`);

    if (!responseCountryData.ok) throw new Error(`Country not found ${responseCountryData.status}`);

    const detailCountryData = await responseCountryData.json();

    btn.style.display = 'none';
    renderCountry(detailCountryData[0]);

    const neighbours = detailCountryData[0].borders;

    if (!neighbours) throw new Error('No neighbour found');

    neighbours.forEach(async (neighbour) => {
      if (neighbour === 'UNK') return;
      const responseCountryData = await fetch(`https://restcountries.com/v2/alpha/${neighbour}`)

      const detailCountryData = await responseCountryData.json();
      renderCountry(detailCountryData, 'neighbour')
    })


  } catch (err) {
    console.log(err);
  }

}


// Promisifying the Geolocation API
function getCoordinates() {
  return new Promise(function (resolve, reject) {
    const coordinates = {};
    navigator.geolocation.getCurrentPosition(
      (position) => {
        coordinates.lat = position.coords.latitude;
        coordinates.lng = position.coords.longitude;
        resolve(coordinates);
      },
      (error) => {
        reject(new Error(error.message))
      }
    );
  })
}

function getCurrentLocation() {
  // Check if geolocation is supported by the browser
  if ("geolocation" in navigator) {
    // Prompt user for permission to access their location
    return getCoordinates();

  } else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
  }
}

function renderCountry(countryData, neigbour = '') {
  const html = `
    <article class="country ${neigbour}">
      <img class="country__img" src="${countryData.flag}" alt="country image" />
      <div class="country__data">
        <h3 class="country__name">${countryData.name}</h3>
        <h4 class="country__region">${countryData.region}</h4>
        <div class="country__row">
          <p class="country__row--people"><span>👫</span>${(+countryData.population / 1000000).toFixed(1)}</p>
          <p class="country__row--lang"><span>🗣️</span>${countryData.languages[0].name}</p>
          <p class="country__row--cur"><span>💰</span>${countryData.currencies[0].name}</p>
        </div>
      </div>
  </article>
  `
  countries.insertAdjacentHTML('beforeend', html);
  countries.style.opacity = 1;
}
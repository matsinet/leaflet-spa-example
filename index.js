import { Header, Nav, Main, Footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";

import axios from "axios";

const router = new Navigo("/");
var map;

function render(state = store.Home) {
  document.querySelector("#root").innerHTML = `
    ${Header(state)}
    ${Nav(store.Links)}
    ${Main(state)}
    ${Footer()}
  `;

  router.updatePageLinks();

  afterRender(state);
}

function afterRender(state) {
  // add menu toggle to bars icon in nav bar
  document
    .querySelector(".fa-bars")
    .addEventListener("click", () =>
      document.querySelector("nav > ul").classList.toggle("hidden--mobile")
    );

  if (state.view === "Map") {
    // Initialize the map DOM element, set the focus point and zoom level
    map = L.map('map').setView([51.505, -0.09], 13);

    // Initialize the background (earth) layer so that markers appear to belong somewhere
    L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Create a group of markers so we can get their outside bounding box
    var markerArray = [];

    console.log('matsinet-state.parks:', state.parks);

    // Iterate of the parks, create a marker and add it to the marker group
    state.parks.forEach(park => {
      // console.log(`${park.name} is located at ${park.latitude}, ${park.longitude}`);

      const marker = L.marker([park.latitude, park.longitude])
        .bindPopup(`${park.name}<br>${park.addresses[0].city}, ${park.addresses[0].stateCode}`);

      markerArray.push(marker);
    });

    // Add marker group to the map so that it is displayed
    var group = L.featureGroup(markerArray).addTo(map);
    // Force the map to zoom to the bounds of the group
    map.fitBounds(group.getBounds());

  }
}

//  ADD ROUTER HOOKS HERE ...
router.hooks({
  before: (done, params) => {
    let view = "Home";

    if (params && params.data) {
      view = params.data.view ? capitalize(params.data.view) : "Home";
    }

    if (view === "Map") {
      // Verify the environment are being comsumed. Placed here as this is the first place that the environment is being consumed.
      // Since it is not always possible to console log the entire `process.env` variable, we will output each attribute required below.
      console.log('matsinet-process.env.MAPBOX_ACCESS_TOKEN:', process.env.MAPBOX_ACCESS_TOKEN);
      console.log('matsinet-process.env.NPS_API_KEY:', process.env.NPS_API_KEY);

      axios
        .get(`https://developer.nps.gov/api/v1/parks?limit=40&api_key=${process.env.NPS_API_KEY}`)
        .then(response => {
          store.Map.parks = response.data.data;
          done();
        });
    } else {
      done();
    }
  }
});

router
  .on({
    "/": () => render(),
    ":view": (params) => {
      let view = capitalize(params.data.view);
      render(store[view]);
    }
  })
  .resolve();

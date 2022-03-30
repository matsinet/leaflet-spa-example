import { Header, Nav, Main, Footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";

import axios from "axios";

const router = new Navigo("/");
var calendar;

function render(state) {
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
  // // add menu toggle to bars icon in nav bar
  // document
  //   .querySelector(".fa-bars")
  //   .addEventListener("click", () =>
  //     document.querySelector("nav > ul").classList.toggle("hidden--mobile")
  //   );

  if (state.view === "Map") {

  }
}

//  ADD ROUTER HOOKS HERE ...
router.hooks({
  before: (done, params) => {
    let view = "Home";

    if (params && params.data) {
      view = params.data.view ? capitalize(params.data.view) : "Home";
    }

    if (view === "Home") {
      done();
    } else if (view === "Map") {
      done();
    } else {
      done();
    }
  }
});

router
  .on({
    "/": () => render(store.Home),
    ":view": (params) => {
      let view = capitalize(params.data.view);
      render(store[view]);
    }
  })
  .resolve();

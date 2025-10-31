import { searchFrom, showArt } from "./lib/art.js";

const searchDiv = document.querySelector(".art-searcher");
const id = new URLSearchParams(window.location.search).get("id");

// Sýna listaverk ef það er id í url, annars sýna search bar
if (searchDiv instanceof HTMLElement) {
    if (id) {
        showArt(searchDiv, id);
    } else {
        searchFrom(searchDiv);
    }
}
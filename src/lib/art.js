import { search, getArtworkById } from "./api.js";
import { el, empty } from "./elements.js";
import { sleep, error } from "./helpers.js";

/**
 * Kemur leitarstiku fyrir inn í container sem er gefinn.
 * Sér um input notanda, sækir úr api og sýnir
 * 
 * @param {HTMLElement} artSearcher - Container sem geymir leitarstiku og niðurstöður.
 */
export function searchFrom(artSearcher) {
    const statusElement = el("p", {}, "Sláðu inn leitarorð til að byrja.");
    const resultsElement = el("ul");
    const resultElement = el("div", {}, statusElement, resultsElement);

    const inputElement = document.createElement("input");
    inputElement.setAttribute("name", "query");

    /**
     *
     * @param {Event} e Form submit event.
     */
    async function onSubmitHandler(e) {
        e.preventDefault();
        empty(resultsElement);

        const query = inputElement.value;
        statusElement.textContent = "Leita að " + query + "...";
        await sleep(0.5);

        let results;
        try {
            results = await search(query);
            if (!results) error("Villa við leit!");
        } catch (err) {
            statusElement.textContent = "Villa við að sækja niðurstöður!";
            console.error(err);
            return;
        }

        statusElement.textContent = 'Leitarniðurstöður fyrir "' + query + '":';

        const data = results.data;

        for (const item of data) {
            const text = item.title;
            const id = item.id;

            const resultItem = el("li", {}, el("a", { href: "/?id=" + id }, text));
            resultsElement.appendChild(resultItem);
        }
    }

    const formElement = el(
        "form",
        { submit: onSubmitHandler },
        el("label", {}, "Leitarorð"),
        inputElement,
        el("button", { type: "submit" }, "Leita")
    );

    artSearcher?.appendChild(formElement);
    artSearcher?.appendChild(resultElement);
}

/**
 * Sýnir upplýsingar um eitt listaverk í container
 * 
 * @param {HTMLElement} container - hvar á að sýna upplýsingar
 * @param {number|string} id - id úr api
 */
export async function showArt(container, id) {
    try {
        container.innerHTML = "Er að sækja gögn!";
        await sleep(1);

        const data = await getArtworkById(id);
        if (!data || !data.title) error("Engin gögn til staðar");

        let image_url = null;
        if (data.image_id) {
            image_url = "https://www.artic.edu/iiif/2/" + data.image_id + "/full/843,/0/default.jpg";
        }

        container.innerHTML = "";

        container.appendChild(el("h2", {}, data.title));
        container.appendChild(el("p", {}, "Höfundur: " + (data.artist_title || "Óþekktur")));
        if (image_url) container.appendChild(el("img", { src: image_url, alt: data.title || "", style: "max-width:100%" }));
        container.appendChild(el("p", {},
            (data.thumbnail && data.thumbnail.alt_text) || data.description || "Engin lýsing til staðar."
        ));

        // Bætir við hlekk til baka í leit
        const backLink = el("a", { href: "/" }, "<- Til baka í leit");
        container.appendChild(backLink);

        console.log("Displayed artwork:", data.title);

    } catch (err) {
        container.textContent = "Villa við að sækja listaverk!";
        console.error(err);
    }
}
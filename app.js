

let currentLanguage = "PL";
const texts = [
    {
        lang: "PL",
        translations: {
            firstName: "Imię",
            lastName: "Nazwisko",
            findGrave: "Znajdź grób",
            home: "Indeks"
        }
    },
    {
        lang: "EN",
        translations: {
            firstName: "Name",
            lastName: "Last Name",
            findGrave: "Find grave",
            home: "Home"

        }
    }
];



$(document).ready(changeLanguage())
//const texts = definedTexts;

function changeLanguage() {
    currentLanguage = currentLanguage === "PL" ? "EN" : "PL";
    const languageButton = document.querySelector("#language");
    if (currentLanguage === "PL") {
        languageButton.innerText = "ENGLISH";
    } else {
        languageButton.innerText = "POLSKI";
    }

    changeTranslations();
}

function changeTranslations() {
    const elements = document.querySelectorAll("[app-lang]");
    let textId;
    elements.forEach(item => {
        textId = item.getAttribute("app-lang");
        //  console.log(texts.find(lang => lang.lang === currentLanguage).translations);
        const text = texts.find(
            lang => lang.lang === currentLanguage
        ).translations[textId];

        if (item.nodeName === 'INPUT') {
            item.setAttribute("placeholder", text);
        } else {
            item.textContent = text;
        }

    });
}



$('#menu-items').load('menu.html').then(() => {
    changeLanguage();
});
$('#search-graves').load('search-graves.html').then(() => {
    changeLanguage();
});



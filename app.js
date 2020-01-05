
const elements = document.querySelectorAll("[app-lang]");

let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
    currentLanguage = "PL";
}

const texts = [
    {
        lang: "PL",
        translations: {
            firstName: "Imię",
            lastName: "Nazwisko",
            findGrave: "Znajdź grób",
            home: "Indeks",
            buttonLanguage: "ENGLISH",
        }
    },
    {
        lang: "EN",
        translations: {
            firstName: "Name",
            lastName: "Last Name",
            findGrave: "Find grave",
            home: "Home",
            buttonLanguage: "POLSKI",

        }
    }
];



$(document).ready(changeTranslations())
//const texts = definedTexts;

function changeLanguage() {
    currentLanguage = currentLanguage === "PL" ? "EN" : "PL";
    localStorage.setItem('language', currentLanguage);
    changeTranslations();
}



function changeTranslations() {

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


function doSomething() {
    console.log(window.navigator);
}


$('#menu-items').load('menu.html').then(() => {
    changeLanguage();
});
$('#search-graves').load('search-graves.html').then(() => {
    changeLanguage();
});



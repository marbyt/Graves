
const elements = document.querySelectorAll("[app-lang]");

let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
    currentLanguage = "PL";
}

const getTranslations = async () => {
    const response = await fetch('/data/translations.json');
    const data = await response.json();
    return data;

};

let texts;
getTranslations().then(data => {
    texts = data;
    changeTranslations();
});

function changeLanguage() {
    currentLanguage = currentLanguage === "PL" ? "EN" : "PL";
    localStorage.setItem('language', currentLanguage);
    changeTranslations();
}

function changeTranslations() {

    let textId;
    elements.forEach(item => {
        textId = item.getAttribute("app-lang");
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

const showSearch = () =>{
    window.location.hash = "banner";
    document.getElementById("banner").focus();
}

function doSomething() {
    console.log(window.navigator);
}
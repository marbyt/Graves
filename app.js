
const elements = document.querySelectorAll("[app-lang]");
const graveForm = document.querySelector('.grave-form');
const graveRows = document.querySelector('#graveRows');

const results = document.querySelector('#results');
results.setAttribute('style', 'display:none');


let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
    currentLanguage = "PL";
}

const getTranslations = async () => {
    const response = await fetch('/data/translations.json');
    const data = await response.json();
    return data;

};

const getGraves = async () => {
    const response = await fetch('/data/graves.json');
    const data = await response.json();
    return data;
};



let texts;
getTranslations().then(data => {
    texts = data;
    changeTranslations();
});

let graves;
getGraves().then(data => {
    graves = data;
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


graveForm.addEventListener('submit', e => {
    e.preventDefault();
    let filteredGraves;
    if (graves) {
        filteredGraves = graves.filter(grave => {
            const result = grave.lastName.toLowerCase().includes(graveForm.lastName.value.toLowerCase()) && grave.names.toLowerCase().includes(graveForm.firstName.value.toLowerCase());
            return result;

        });

        if (filteredGraves) {
            graveRows.innerHTML = '';
            filteredGraves.forEach(grave => {
                const row = `<tr><td>${grave.lastName}</td><td>${grave.names}</td><td>${grave.dateOfDeath}</td><td>${grave.age}</td><td>${grave.names}</td></tr>`;
                graveRows.innerHTML += row;
            });
        };
    }
    results.setAttribute('style', 'display:block');
});

const isFormEmpty = () => {
    const disabled = !Array.from(graveForm.elements).filter(x => x.type === 'text').some(x => x.value);
    return disabled;
}


graveForm.addEventListener('keyup', e => {
    graveForm.submitButton.disabled = isFormEmpty();

});

graveForm.addEventListener('reset', e => {
    graveForm.submitButton.disabled = true;
    graveRows.innerHTML = '';
    results.setAttribute('style', 'display:none');

});


graveRows.addEventListener('click', e => {
    const currentRow = e.target.parentElement;
    const detailRow = document.querySelector('.details');
    if (detailRow) {
        detailRow.classList.remove('details');
        detailRow.parentNode.removeChild(detailRow.nextElementSibling);
    }
    if (!currentRow.classList.contains('details')) {
        currentRow.classList.add('details');
        currentRow.insertAdjacentHTML('afterend', `<tr><td colspan="4"><div id="contact" class="graveCard">
        <div class="inner">
           
                <h2>Arcue ut vel commodo</h2>
                <p>Aliquam ut ex ut augue consectetur interdum endrerit imperdiet amet eleifend fringilla.</p>
      
        </div>
    </div></td></tr>`)
    }
    // let details = document.createElement("tr");
    //details.innerHTML+="<div> jest ejst jest </div>";

    //graveRows.insertBefore(e.target.parentElement.nextElementSibling, details);


})


//Array.from(graveForm.elements).filter(x=>x.type==='text').foreach
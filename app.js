const elements = document.querySelectorAll("[app-lang]");
const graveForm = document.querySelector('.grave-form');
const graveRows = document.querySelector('#graveRows');
const gravesNumber = document.querySelector('#gravesNumber');
const results = document.querySelector('#results');
results.setAttribute('style', 'display:none');
const pictureHTTP = 'https://jri-poland.org/imagedata/JRI-IMG/BEDZIN-CZELADZ/';

let filteredGraves;


let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
    currentLanguage = "PL";
}

let lastNumberFound = 0;

const setGravesNumberText = number => {
    let text = GetTextById('gravesFound');
    text = text.replace('{0}', number);
    gravesNumber.textContent = text;
}

const getTranslations = async () => {
    const response = await fetch('./data/translations.json');
    const data = await response.json();
    return data;

};

const getGraves = async () => {
    const response = await fetch('./data/graves3.json');
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

function GetTextById(textId) {
    const text = texts.find(
        lang => lang.lang === currentLanguage
    ).translations[textId];

    return text;
}

function changeTranslations() {

    let textId;
    elements.forEach(item => {
        textId = item.getAttribute("app-lang");
        const text = GetTextById(textId);

        if (item.nodeName === 'INPUT') {
            item.setAttribute("placeholder", text);
        } else {
            item.textContent = text;
        }

    });

    setGravesNumberText(lastNumberFound);
}

const searchHandler = () => {

    if (graves) {
        filteredGraves = graves.filter(grave => {
            if (!grave.Surname) {
                grave.Surname = '';
            }
            if (!grave.Givenname) {
                grave.Givenname = '';
            }

            let result = grave.Surname.toLowerCase().indexOf(graveForm.lastName.value.toLowerCase()) > -1 && grave.Givenname.toLowerCase().indexOf(graveForm.firstName.value.toLowerCase()) > -1;

            if (graveForm.deathYearFrom.value) {
                let yearFromSearch = grave.Year >= graveForm.deathYearFrom.value;
                if(grave.YearTo){
                    yearFromSearch = yearFromSearch || grave.YearTo >= graveForm.deathYearFrom.value
                }
                result = result & yearFromSearch;
            }

            if (graveForm.deathYearTo.value) {
                let yearToSearch = grave.Year <= graveForm.deathYearTo.value;
                if(grave.YearTo){
                    yearToSearch = yearToSearch || grave.YearTo  <= graveForm.deathYearTo.value;
                }


                result = result & yearToSearch;
            }



            return result;
        });

        if (filteredGraves) {
            graveRows.innerHTML = '';
            let innerHTML = '';
            filteredGraves.forEach(grave => {
                const row = `<tr class='graveRow' data-id='${grave.Id}'>
                                <td>${grave.Surname ? grave.Surname : ''}</td>
                                <td>${grave.Givenname ? grave.Givenname : ''}</td>
                                <td>${(grave.Year || '') + (grave.YearTo ? ' - ' + grave.YearTo : '')}</td>
                                <td class="bigscreen">${grave.Age ? grave.Age : ''}</td></tr>`;
                innerHTML += row;
            });
            graveRows.innerHTML = innerHTML;
        };
    }

    const number = filteredGraves ? filteredGraves.length : 0;
    setGravesNumberText(number);
    lastNumberFound = number;

    results.setAttribute('style', 'display:block');
    results.scrollIntoView();

}

graveForm.addEventListener('submit', e => {
    e.preventDefault();
    graveForm.submitButton.disabled = true;
    searchHandler();

});

const isFormEmpty = () => {
    const disabled = !Array.from(graveForm.elements).filter(x => x.type === 'text').some(x => x.value);
    return disabled;
}


graveForm.addEventListener('input', e => {
    graveForm.submitButton.disabled = isFormEmpty() || !graveForm.checkValidity();
  

});

// graveForm.addEventListener('paste', e => {
//     let paste = (e.clipboardData || window.clipboardData).getData('text');
//     if (paste) {
//         graveForm.submitButton.disabled = false;
//     }
// });

graveForm.addEventListener('reset', e => {
    graveForm.submitButton.disabled = true;
    graveRows.innerHTML = '';
    results.setAttribute('style', 'display:none');

});

const getPiece = (label, information) => {
    const data = `<p><span class='cardLabel'>${label} </span><span>${information || ''}</span></p>`
    return data;
}

const getCardHtml = graveData => {
    const startHtml = `<tr class="graveCardRow">
    <td colspan="4">
    <div class="flexWraper">
    <img src='${pictureHTTP + graveData.Image}' class='cardPicture'>
    <div class="cardInformation">
        <h1>${(graveData.Givenname || '') + ' ' + (graveData.Surname || '')}</h1>`

    let dataHtml = '';
    if (graveData.HebrewDate) {
        dataHtml += getPiece('Hebrew date of death:', graveData.HebrewDate);
    }
    dataHtml += `<p><span>Age: </span><span>${graveData.Age || ''}</span></p>
        <p><span>Spouse name: </span><span>${graveData.Spouse || ''}</span></p>
        <p><span>Father's name: </span><span>${graveData.Father || ''}</span></p>
        <p><span>Notes: </span><span>${graveData.Comments || ''}</span></p>
        <p><span>Reference: </span><span>${graveData.Reference || ''}</span></p>
        <p><span>Row: </span><span>${graveData.Row || ''}</span></p>`;
    const endHtml = `
    </div>
    </div>
    </td>
    </tr>`;
    const cardHtml = startHtml + dataHtml + endHtml;
    return cardHtml;
}


graveRows.addEventListener('click', e => {
    if (e.target.tagName === 'TD') {
        const currentRow = e.target.parentElement;

        if (currentRow.classList.contains('details')) {
            currentRow.classList.remove('details');
            currentRow.parentNode.removeChild(currentRow.nextElementSibling);

        } else {
            if (!currentRow.classList.contains('details') && !currentRow.classList.contains('graveCardRow')) {
                const detailRow = document.querySelector('.details');
                if (detailRow) {
                    detailRow.classList.remove('details');
                    detailRow.parentNode.removeChild(detailRow.nextElementSibling);
                }
                const dataId = currentRow.getAttribute('data-id');
                const graveData = filteredGraves.find(grave => grave.Id == dataId);

                currentRow.classList.add('details');
                currentRow.insertAdjacentHTML('afterend', getCardHtml(graveData));
            }
        }
    }
});
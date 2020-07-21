
const graveForm = document.querySelector('.grave-form');
const graveRows = document.querySelector('#graveRows');
const gravesNumber = document.querySelector('#gravesNumber');
const results = document.querySelector('#results');
results.setAttribute('style', 'display:none');
//const pictureHTTP = 'https://jri-poland.org/imagedata/JRI-IMG/BEDZIN-CZELADZ/';
const pictureHTTP = './graveimages/';
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


function getFuzzyFactor(text1, text2) {
    let fuzzyFactor = 0;
    if (text1 && text2) {
        const score1 = getScore(text1, text2);
        const score2 = getScore(text2, text1);
        const w1 = text1.length || 0;
        const w2 = text2.length || 0;
        fuzzyFactor = (w1 * score1 + w2 * score2) / (w1 + w2);
    }
    return fuzzyFactor;
}



function getScore(text1, text2) {
    let score = 0;
    if (text1 && text2) {
        score = 0;

        const input = text1.toLowerCase();
        const comparedText = text2.toLowerCase();

        let comparedPosition = 0;
        for (let index = 0; index < input.length; index++) {
            const letter = input[index];
            for (let position = comparedPosition; position < comparedText.length; position++) {
                const element = comparedText[position];
                if (element === letter) {
                    comparedPosition = position + 1;
                    score++;
                    break;
                }
            }
        }
        console.log(score);
        score = score / input.length;
    }

    return score;
}

function GetTextById(textId) {
    const text = texts.find(
        lang => lang.lang === currentLanguage
    ).translations[textId];

    return text;
}

function changeTranslations() {
    const elementsToTranslate = document.querySelectorAll("[app-lang]");
    changeTranslationsForElements(elementsToTranslate);
    changeTranslationsForAppData();
}

function changeTranslationsForAppData() {
    const elementsToTranslate = document.querySelectorAll("[app-data]");
    elementsToTranslate.forEach(item => {
        const data = item.getAttribute("app-data");
        const textId = data.substring(data.length - 1).toLowerCase();
        const text = GetTextById(textId);
        const dataToDisplay = data.replace(textId.toUpperCase(), ' ' + text);
        item.textContent = dataToDisplay;
    });

}

function changeTranslationsForElements(elementsToTranslate) {

    let textId;
    elementsToTranslate.forEach(item => {
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
    const fuzzyNumber = 0.7;
    if (graves) {
        filteredGraves = graves.filter(grave => {
            if (!grave.Surname) {
                grave.Surname = '';
            }
            if (!grave.Givenname) {
                grave.Givenname = '';
            }

            let result = (grave.Surname.toLowerCase().indexOf(graveForm.lastName.value.toLowerCase()) > -1 || getFuzzyFactor(graveForm.lastName.value, grave.Surname) > fuzzyNumber)
                && (grave.Givenname.toLowerCase().indexOf(graveForm.firstName.value.toLowerCase()) > -1 || getFuzzyFactor(graveForm.firstName.value, grave.Givenname) > fuzzyNumber);

            // let result = (grave.Surname.toLowerCase().indexOf(graveForm.lastName.value.toLowerCase()) > -1 || compareText(graveForm.lastName.value, grave.Surname, 2))
            //     && (grave.Givenname.toLowerCase().indexOf(graveForm.firstName.value.toLowerCase()) > -1 || compareText(graveForm.firstName.value, grave.Givenname, 2));

            if (graveForm.deathYearFrom.value) {
                let yearFromSearch = grave.Year >= graveForm.deathYearFrom.value;
                if (grave.YearTo) {
                    yearFromSearch = yearFromSearch || grave.YearTo >= graveForm.deathYearFrom.value
                }
                result = result & yearFromSearch;
            }

            if (graveForm.deathYearTo.value) {
                let yearToSearch = grave.Year <= graveForm.deathYearTo.value;
                if (grave.YearTo) {
                    yearToSearch = yearToSearch || grave.YearTo <= graveForm.deathYearTo.value;
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
                              <td class="arrow"></td>
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

const getPiece = (label, information, layout) => {
    const data = `<p><span class='cardLabel' app-lang='${label}'></span><span>${information || ''}</span></p>`
    return data;
}

const fieldToDisplay = [
    { label: "dateOfDeath", information: "DateDied" },
    { label: "hebrewDate", information: "HebrewDate" },
    { label: "age", information: "Age" },
    { label: "spouseName", information: "Spouse" },
    { label: "fatherName", information: "Father" },
    { label: "notes", information: "Comments" },
    { label: "reference", information: "Reference" }
    //  { label: "row", information: "Row", layout:"graveLocation" }
]

const getCardHtml = graveData => {
    const startHtml = `<tr class="graveCardRow">
    <td colspan="5">
    <div class="flexWraper">
    <img src='${pictureHTTP + graveData.Image}' class='cardPicture'>
    <div class="cardInformation">
        <h1>${(graveData.Givenname || '') + ' ' + (graveData.Surname || '')}</h1>`

    let dataHtml = '';
    fieldToDisplay.forEach(field => {
        if (graveData[field.information]) {
            dataHtml += getPiece(field.label, graveData[field.information], field.layout);
        }

    });

    const textId = graveData.Row.substring(graveData.Row.length - 1).toLowerCase();
    const text = GetTextById(textId);
    const dataToDisplay = graveData.Row.replace(textId.toUpperCase(), ' ' + text);
    const row = `<p class='graveLocation'><span class='cardLabel' app-lang='row' ></span><span app-data="${graveData.Row}">${dataToDisplay}</span></p>`
    dataHtml += row;
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
            currentRow.firstElementChild.classList.remove('active');

        } else {
            if (!currentRow.classList.contains('details') && !currentRow.classList.contains('graveCardRow')) {
                const detailRow = document.querySelector('.details');
                if (detailRow) {
                    detailRow.classList.remove('details');
                    detailRow.parentNode.removeChild(detailRow.nextElementSibling);
                    detailRow.firstElementChild.classList.remove('active');
                }
                const dataId = currentRow.getAttribute('data-id');
                const graveData = filteredGraves.find(grave => grave.Id == dataId);

                currentRow.classList.add('details');
                currentRow.firstElementChild.classList.add('active');

                currentRow.insertAdjacentHTML('afterend', getCardHtml(graveData));


                changeTranslationsForElements(currentRow.nextElementSibling.querySelectorAll("[app-lang]"));
            }
        }
    }
});
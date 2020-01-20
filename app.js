
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

const searchHandler =  () => {
 
        let filteredGraves;
        if (graves) {
            filteredGraves = graves.filter(grave => {
                if (!grave.Surname) {
                    grave.Surname = '';
                }
                if (!grave.Givenname) {
                    grave.Givenname = '';
                }

                const result = grave.Surname.toLowerCase().indexOf(graveForm.lastName.value.toLowerCase()) > -1 && grave.Givenname.toLowerCase().indexOf(graveForm.firstName.value.toLowerCase() > -1);
                return result;

            });

            if (filteredGraves) {
                graveRows.innerHTML = '';
                let innerHTML = '';
                filteredGraves.forEach(grave => {
                    const row = `<tr class='graveRow'><td>${grave.Surname}</td><td>${grave.Givenname}</td><td>${grave.DateDied}</td><td>${grave.age}</td></tr>`;
                    innerHTML += row;
                });
                graveRows.innerHTML = innerHTML;
            };
        }

        results.setAttribute('style', 'display:block');
        results.scrollIntoView();
       
    }

    graveForm.addEventListener('submit', e => {
        e.preventDefault();
        
        searchHandler();
        
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
                    currentRow.classList.add('details');
                    currentRow.insertAdjacentHTML('afterend',
                        `<tr class="graveCardRow">
                        <td colspan="5">
                        <h2 class="naglowek">Arcue ut vel commodo</h2>
                        <p>Aliquam ut ex ut augue consectetur interdum endrerit imperdiet amet eleifend fringilla.</p>
                    </td>
                    </tr>`);

                }
            }
        }
        // let details = document.createElement("tr");
        //details.innerHTML+="<div> jest ejst jest </div>";

        //graveRows.insertBefore(e.target.parentElement.nextElementSibling, details);


    });


//Array.from(graveForm.elements).filter(x=>x.type==='text').foreach
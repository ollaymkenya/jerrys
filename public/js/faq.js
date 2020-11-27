const qandaListItemTitle = document.querySelectorAll('.qanda-list__item-title');
const qandaListItemChevronDown = document.querySelectorAll('ion-icon[name="chevron-down-outline"]');
const faqNavList = document.getElementsByClassName('faq-nav__list-item');
const faqandaList = document.getElementsByClassName('faqandacontainer');
const faqSearch = document.querySelector('#faq-search');
const faqNavListContainer = document.querySelector('.faq-nav__list');
const faqQandaListContainer = document.querySelector('.faq-qanda__list');
let lis = faqNavListContainer.getElementsByTagName('li');

let invisibleUls = [faqNavListContainer, faqQandaListContainer];

window.onload = () => {
    if(faqSearch.value !== '') {
        searchMode(faqSearch.value);
    }
}

fullyNormal();

faqSearch.addEventListener('input', (e) => {
    let searchTerm = e.target.value;
    if (searchTerm !== '') {
        searchMode(searchTerm);
    } else {
        normalMode();
     }
});

function searchMode(searchTerm) {
    invisibleUls[0].style.display = 'none';
    const filter = searchTerm.toUpperCase() 
    for (i = 0; i < faqandaList.length; i++) {
        const quiz = faqandaList[i].getElementsByTagName("h4")[0];
        const answer = faqandaList[i].getElementsByTagName("p")[0];
       const txtValue = [quiz.textContent || quiz.innerText, answer.textContent || answer.innerText];
        if (txtValue[0].toUpperCase().indexOf(filter) > -1 || txtValue[1].toUpperCase().indexOf(filter) > -1) {
            faqandaList[i].style.display = "";
        } else {
            faqandaList[i].style.display = "none";
        }
    }
}

function normalMode() {
    console.log('normalMode');
    invisibleUls[0].style.display = 'flex';
    fullyNormal();
}

function fullyNormal(){
    for(let i = 0; i < lis.length; i++) {
        if(lis[i].classList.contains('active')){
            [...faqandaList].forEach(faqanda => {
                if (faqanda.dataset.categoryid !== lis[i].firstElementChild.dataset.categoryid) {
                    faqanda.style.display = 'none';
                } else {
                    faqanda.style.display = 'block';
                }
            })
        }
    }
}

// making the selected nav item to be active and to display the active lists
for (let i = 0; i < lis.length; i++) {
    lis[i].addEventListener('click', (e) => {
        console.log(e.target.firstElementChild);
        [...lis].forEach(li => {
            li.classList.remove('active');
        });
        e.target.classList.add('active');
        [...faqandaList].forEach(faqanda => {
            if (faqanda.dataset.categoryid !== e.target.firstElementChild.dataset.categoryid) {
                faqanda.style.display = 'none';
            } else {
                faqanda.style.display = 'block';
            }
        })
    })
}

for (let i = 0; i < qandaListItemTitle.length; i++) {
    toggelActive(qandaListItemTitle, i);
    toggelActive(qandaListItemChevronDown, i);
}

function toggelActive(elements, i) {
    elements[i].addEventListener('click', () => {
        elements[i].parentElement.parentElement.classList.toggle('active');
        const p = elements[i].parentElement.parentElement.querySelector('p')
        if (!elements[i].parentElement.parentElement.classList.contains('active')) {
            p.style.maxHeight = 0 + 'px';
        } else {
            p.style.maxHeight = p.scrollHeight + 'px';
        }
    })
} 
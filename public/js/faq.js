const qandaListItemTitle = document.querySelectorAll('.qanda-list__item-title');
const qandaListItemTrashIcon = document.querySelectorAll('ion-icon[name="chevron-down-outline"]');
const faqNavList = document.getElementsByClassName('faq-nav__list-item');
const faqandaList = document.getElementsByClassName('faqandacontainer');

for(let i = 0; i < faqandaList.length; i++) {
    let category = 'General Iinformation';
    if(faqandaList[i].dataset.categoryid !== category){
        faqandaList[i].style.display = 'none';
    }else{
        faqandaList[i].style.display = 'block';
    }
}

for (let i = 0; i < faqNavList.length; i++) {
    faqNavList[i].addEventListener('click', (e) => {
        [...faqNavList].forEach(faqNavItem => {
            faqNavItem.classList.remove('active');
        });
        console.log(e.target.parentElement);
        e.target.parentElement.classList.add('active');
        [...faqandaList].forEach(faqanda => {
            if(faqanda.dataset.categoryid !==  e.target.parentElement.dataset.categoryid){ 
                faqanda.style.display = 'none';
            }else{
                faqanda.style.display = 'block';
            }
        })
    })
 }
 


for (let i = 0; i < qandaListItemTitle.length; i++) {
    toggelActive(qandaListItemTitle, i);
    toggelActive(qandaListItemTrashIcon, i);
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







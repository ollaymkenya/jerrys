const qandaListItemTitle = document.querySelectorAll('.qanda-list__item-title');
const qandaListItemChevronDown = document.querySelectorAll('.chevy-down');

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
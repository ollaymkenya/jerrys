const qandaListItemTitle = document.querySelectorAll('.qanda-list__item-title');

for(let i = 0; i < qandaListItemTitle.length; i++){
    qandaListItemTitle[i].addEventListener('click', () => {
        qandaListItemTitle[i].parentElement.classList.toggle('active');
        const p = qandaListItemTitle[i].parentElement.querySelector('p')
        if(!qandaListItemTitle[i].parentElement.classList.contains('active')){
            p.style.maxHeight = 0 + 'px';
        }else{
            p.style.maxHeight = p.scrollHeight + 'px';
        }
    })
}
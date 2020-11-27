const editParams = document.getElementsByClassName("editParam");
const modalBg = document.querySelector('.modal-bg');
const modalClose = document.querySelector('.modal-close');
const paramNavList = document.getElementsByClassName('param-nav__list__item');
const pmli = document.getElementsByClassName('pmli');

modalClose.addEventListener('click', (e) => {
    modalBg.classList.remove('active')
})

for (let i = 0; i < paramNavList.length; i++) {
    paramNavList[i].addEventListener('click', (e) => {
        [...paramNavList].forEach(paramNavItem => {
            paramNavItem.classList.remove('active');
        });
        e.target.classList.add('active');
        [...pmli].forEach(pmli => {
            if(pmli.dataset.categoryid !== e.target.dataset.categoryid){
                pmli.style.display = 'none';
            }else{
                pmli.style.display = 'block';
            }
        })
    })
}

for (let i = 0; i < editParams.length; i++) {
    editParams[i].addEventListener('click', (e) => {
        modalBg.classList.add('active');
        let param = e.target.dataset.param;
        param = JSON.parse(param)
        document.getElementById('paramId').value = param._id;
        document.getElementById('paramName').value = param.name;
        document.getElementById('paramPrice').value = param.price;
    })
}
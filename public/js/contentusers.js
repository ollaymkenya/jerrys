
const modalClose = document.querySelector('.modal-close');
const modalClose1 = document.querySelector('.modal-close1');
const modalBg = document.querySelector('.modal-bg');
const commentForm = document.querySelector('.user-form');
const ulitoggle = document.getElementsByClassName('ulitoggle');
const uli = document.getElementsByClassName('uli');

for (let i = 0; i < ulitoggle.length; i++) {
    ulitoggle[i].addEventListener('click', (e) => {
        [...uli].forEach(uli => {
            if (uli.dataset.accouttypeid !== e.target.dataset.accouttypeid) {
                uli.style.display = 'none';
            }else{
                uli.style.display = 'block';
            }
        })
    })
}

document.querySelector("#toggleUser").addEventListener("click", () => {
    modalBg.classList.add('bg-active');
})

modalClose.addEventListener('click', () => {
    modalBg.classList.remove('bg-active');
})

modalClose1.addEventListener('click', () => {
    modalBg.classList.remove('bg-active');
})

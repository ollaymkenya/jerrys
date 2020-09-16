//Create function to select elements
const selectElement = (element) => document.querySelector(element)

selectElement('.menu-bar').addEventListener('click', () => {
    selectElement('header').classList.toggle('menu-open');
    selectElement('.menu-bar').classList.toggle('active');
})
//Open and close nav on click
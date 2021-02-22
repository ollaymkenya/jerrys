let counter = 10;

window.onload = () => {
    setTimeout(function deductOne() {
        setTimeout(() => {
            if (counter > 0) {
                document.querySelector('#counter').innerHTML = counter
                deductOne();
            } else {
                redirect();
            }
            counter--;
        }, 1000)
    }, 1000)
}

document.querySelector("#redirect-button").addEventListener('click', () => redirect());

function redirect() {
    counter = 0;
    window.location.replace("https://jerrythewriter.com/projects");
}
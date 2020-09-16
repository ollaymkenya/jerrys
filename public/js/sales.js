const profiles = document.querySelectorAll(".profile");
const FirstNav = document.querySelector(".categorise-first__nav");
const FirstNavItems = Array.from(FirstNav.querySelectorAll(".categorise-first__nav-item"));
let FirstImages = Array.from(document.querySelectorAll(".categorise-first__image-container"));

function changeImage() {
    let theCurrent = this;
    FirstNavItems.forEach(FirstNavItem => {
        if (theCurrent == FirstNavItem) {
            let theActive = FirstImages[FirstNavItems.indexOf(theCurrent)];
            FirstImages.forEach(FirstImage =>{
                if (theActive == FirstImage) {
                    theActive.classList.remove("none");
                    return;
                }FirstImage.classList.add("none");
            })
        }
    });
}

FirstNavItems.forEach(FirstNavItem => FirstNavItem.addEventListener('mouseover', changeImage));


profiles.forEach(profile => {
    profile.addEventListener("mouseover", e => {
        if (e.target.parentNode.tagName == "DIV") {
            e.target.parentNode.classList.add("show");
        }
    });
});

// Remove class show from parentnode

profiles.forEach(profile => {
    profile.addEventListener("mouseleave", e => {
        e.target.parentNode.classList.remove("show");
    });
});

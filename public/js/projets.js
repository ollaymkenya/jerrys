let search = document.getElementById("search");
document.getElementById("search").addEventListener("input", (e) => Search(e));
let projects = Array.from(document.querySelectorAll(".order-number"));
let projectsContainer = document.querySelector(".projects-list");

function Search(e) {
    let term = e.target.value;
    let newProjects = projects.filter((value) => {
        return value.innerText.toUpperCase().includes(term.toUpperCase());
    })
    projectsContainer.innerHTML = '';
    newProjects.map(project => {
        return projectsContainer.appendChild(project.parentElement.parentElement.parentElement.parentElement.parentElement);
    })
}
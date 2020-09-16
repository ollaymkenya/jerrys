const profiles = document.querySelectorAll(".profile");

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

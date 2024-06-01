if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");
} else {
  document.documentElement.classList.remove("dark");
  localStorage.setItem("theme", "light");
}

// Auto loggout on logout any any tab

window.addEventListener(
  "storage",
  () => {
    const loggedIn = localStorage.getItem("loggedin-xpandio");
    const reloadCounter = localStorage.getItem("reloadcounter-xpandio");
    if ((!loggedIn || loggedIn !== "Yes") && !reloadCounter) {
      localStorage.setItem("reloadcounter-xpandio", 1);
      window.location.reload();
    }
  },
  false,
);

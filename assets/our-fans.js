window.addEventListener("load", function () {

  function scrollList(classNames) {
    const sliders = document.querySelectorAll(classNames);
    let isDown = false;
    let startX;
    let scrollLeft;

    sliders.forEach((slider) => {
      slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
        stop();
      });
    });
  } 
  scrollList(".block__our-fans-nav-list");

  function loadMore() {
    let showMoreBtn = document.querySelector(".loadMore");
    if (!showMoreBtn) return; 
    showMoreBtn.removeEventListener("click", handleLoadMore);
    showMoreBtn.addEventListener("click", handleLoadMore);
}

function handleLoadMore() {
    let showMoreItems = document.querySelectorAll(".block__our-fans-item:not(.hidden)");
    let hiddenItems = Array.from(showMoreItems).filter(item => item.style.display === "none");
    hiddenItems.slice(0, 10).forEach(item => {
        item.style.display = "block";
        item.style.opacity = 0;
        setTimeout(() => item.style.opacity = 1, 50);
    });
    if (hiddenItems.length <= 10) {
        document.querySelector(".loadMore").style.display = "none";
    }
}

function filterItems() {
    document.querySelectorAll(".block__our-fans-nav-list li").forEach((item) => {
        item.addEventListener("click", function () {
            document.querySelectorAll(".block__our-fans-nav-list li").forEach((li) => {
                li.classList.remove("active");
            });
            this.classList.add("active");
            let dataTag = this.getAttribute("data-tag") || "All";
            let showMoreBtn = document.querySelector(".loadMore");
            document.querySelectorAll(".block__our-fans-item").forEach((item) => {
                let itemTag = item.getAttribute("id");
                if (dataTag === "All" || itemTag === dataTag) {
                    item.style.display = "block";
                    item.classList.remove("hidden");
                } else {
                    item.classList.add("hidden");
                    item.style.display = "none";
                }
            });
            let showMoreItems = document.querySelectorAll(".block__our-fans-item:not(.hidden)");
            showMoreItems.forEach((item, index) => {
                if (index >= 20) { // Change the number of items to show
                    item.style.display = "none";
                }
            });
            let hiddenItems = Array.from(showMoreItems).filter(item =>
                window.getComputedStyle(item).display === "none"
            );
            showMoreBtn.style.display = hiddenItems.length > 0 ? "block" : "none";
        });
    });
}
filterItems();
loadMore();

});

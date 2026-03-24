
  function blogpagination(event, datHref) {
    let nextPage = event.target.getAttribute("data-currentpage");
    let maxPage = event.target.getAttribute("data-totalpage");
    let dataurl = `${datHref}?page=${nextPage}`;
  
    fetch(dataurl)
      .then((response) => response.text())
      .then((responseText) => {
        let html = new DOMParser().parseFromString(responseText, "text/html");
        let targetElement = document.querySelector(".blog-articles");
        let sourceElement = html.querySelectorAll(".blog-articles__article");
        for (html of sourceElement) {
          if (targetElement && sourceElement) {
            targetElement.appendChild(html);
          }
        }
        event.target.setAttribute("data-currentpage", Number(nextPage) + 1);
      })
      .finally(() => {
        if (nextPage == maxPage) {
          event.target.remove();
        }
      });
  }
  

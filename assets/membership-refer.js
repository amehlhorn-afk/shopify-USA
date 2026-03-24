document.addEventListener("DOMContentLoaded", function() {
    let elementFind = setInterval(() => {
        let element = document.querySelector('.block__membership-refer-main').querySelector('.yotpo-title-text[role="heading"]');
        if (element) {  
            console.log("element1", element);
            element.innerText = element.innerText
            .toLowerCase() 
            .replaceAll(" off", "") // Remove " OFF" (case-sensitive issue fixed)
            .replace(/g/g, "G"); // Replace all occurrences of "g" with "G"
            console.log("element", element);
            clearInterval(elementFind);;
        }
    }, 500); 
});
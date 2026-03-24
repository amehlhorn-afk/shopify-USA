document.addEventListener("DOMContentLoaded", (event) => {
    var custom_date = document.querySelector(".block__sale-countdown-right-inner").getAttribute("data-date");
    let count_days =  document.getElementById("days");
    let count_hours =  document.getElementById("hours");
    let count_mins = document.getElementById("mins"); 
    let count_secs = document.getElementById("secs"); 
    
    if (custom_date !== null && custom_date !== "") {
        var countDownDate = new Date(custom_date).getTime();

        function formatWithSpans(number) {
            return number
                .toString()
                .split("")
                .map((digit) => `<span>${digit}</span>`)
                .join("");
        }

        // Run myfunc every second
        var myfunc = setInterval(function () {
            var now = new Date().getTime();
            var timeleft = countDownDate - now;

            var days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
            var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

            if (days < 10) {
                days = "0" + days;
            }
            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }

           if(count_days){
             count_days.innerHTML = formatWithSpans(days);
           }
           if(count_hours){
            count_hours.innerHTML = formatWithSpans(hours);
           }
           if(count_mins){
            count_mins.innerHTML = formatWithSpans(minutes);
           }
           if(count_secs){
            count_secs.innerHTML = formatWithSpans(seconds);
           }  
            
            if (timeleft < 0) {
                clearInterval(myfunc);
                document
                    .querySelectorAll(".block__timer--announcement,.block__timer--dots")
                    .forEach((timer_announcement) => {
                        timer_announcement.style.display = "none";
                    });
                document.getElementById("days").innerHTML = "";
                document.getElementById("hours").innerHTML = "";
                document.getElementById("mins").innerHTML = "";
                document.getElementById("secs").innerHTML = "";
                document.getElementById("end").innerHTML = "TIME UP!!";
            }
        }, 1000);
    }
});

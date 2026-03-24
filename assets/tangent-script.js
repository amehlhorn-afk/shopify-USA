function updateProgressBar(present, total) {
  console.log(total, "total");
  let progressBar = document.getElementById("progress-bar");
  if (present != 0) {
    progressBar.style.width = (present / total) * 100 + "%";
  }
}
function addQuestionBars(count) {
  console.log(count, "count");
  const barsContainer = document.getElementById("bars-container");
  for (let i = 0; i < count - 1; i++) {
    let bar = document.createElement("div");
    bar.classList.add("bars");
    bar.innerHTML = "&nbsp;";
    barsContainer.appendChild(bar);
  }
}

function getVideoUrl(questionId) {
  const videoUrls = {
    "67ea5343a5f62bd5bac85338":
      "https://cdn.shopify.com/videos/c/o/v/68d306d098144b73970b557c080e1e3a.mp4",
    "67ea5496a5f62bd5bac85acd":
      "https://cdn.shopify.com/videos/c/o/v/68d306d098144b73970b557c080e1e3a.mp4",
    "67ea52f3a5f62bd5bac84f87":
      "https://cdn.shopify.com/videos/c/o/v/166a4b41f648442494e2f494d0127c17.mp4",
    "67ea5317a5f62bd5bac85155":
      "https://cdn.shopify.com/videos/c/o/v/c44aefeae43840a28b5f33f63bfcc9ff.mp4",
    "67ea54aaa5f62bd5bac85ae3":
      "https://cdn.shopify.com/videos/c/o/v/d19d4197216442eb8f1fbf901532e63c.mp4",
    "67ea52f3a5f62bd5bac84f89":
      "https://cdn.shopify.com/videos/c/o/v/066964c0dc794d1f992ed33bac2252fc.mp4",
    "67ea5d50a5f62bd5bac886a8":
      "https://cdn.shopify.com/videos/c/o/v/6ded0d2e3c9346f989a894fe5d902d42.mp4",
    "67ea5d38a5f62bd5bac88687":
      "https://cdn.shopify.com/videos/c/o/v/5768fa193a844e83a57e4287a9c3e2a6.mp4",
  };

  return videoUrls[questionId] || null;
}

function updateVideoUrl(id) {
  let url = getVideoUrl(id);
  let videoTag = document.querySelector("#video-container > video");
  videoTag.src = url;
  // let source = videoTag.querySelector("source");
  // source.setAttribute("src", url);
}

window.addEventListener("quiz_progress", (event) => {
  let progressData = event.detail.split("_");
  let presentQuestion = Number(progressData[0]); //current question index
  let totalQuestion = Number(progressData[1]); // total number of questions
  console.log(event.detail, progressData[3], "event detail");
  let progressBar = document.getElementById("progress-bar-block");
  let quiz = document.getElementById("tangent-main-container");
  let questionIndex = document.querySelector(".question-index-status");
  let floatingIndex = document.querySelector(".floating-index-status");
  questionIndex.innerHTML = `${presentQuestion} out of ${totalQuestion}`;
  floatingIndex.innerHTML = `${presentQuestion} out of ${totalQuestion}`;
  updateVideoUrl(progressData[3]);
  updateProgressBar(presentQuestion, totalQuestion);

  if (presentQuestion != "0") {
    progressBar.style.display = "block";
  }
  if (presentQuestion == "0") {
    progressBar.style.display = "none";
  }

  // Check if dots are already added, otherwise add them
  let dotElement = document.getElementsByClassName("bars");
  if (dotElement.length == 0) {
    addQuestionBars(totalQuestion);
  }
  // Update active dot based on the present question
});

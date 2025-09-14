let songs;
let currSong = new Audio();

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
  let x = await fetch("http://127.0.0.1:5500/songs/");
  let response = await x.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}

const playMusic = (audiotrack, pause = false) => {
  //   let audio = new Audio("/songs/" + audiotrack);
  currSong.src = "/songs/" + audiotrack;
  if (!pause) {
    currSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(audiotrack);
  document.querySelector(".songduration").innerHTML = "00:00 / 00:00";
};

async function main() {
  let songs = await getSongs();
  playMusic(songs[0], true);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
        <img class="invert" src="music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Kishore</div>
        </div>
        <div class="playnow">
          <img class="invert" src="play.svg" alt="" />
        </div>
      </li>`;
  }

  //EL each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  //EL PPN
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "pause.svg";
    } else {
      currSong.pause();
      play.src = "play.svg";
    }
  });

  currSong.addEventListener("timeupdate", () => {
    // console.log(currSong.currentTime, currSong.duration);

    document.querySelector(
      ".songduration"
    ).innerHTML = `${secondsToMinutesSeconds(
      currSong.currentTime
    )} / ${secondsToMinutesSeconds(currSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currSong.currentTime =
      (e.offsetX / e.target.getBoundingClientRect().width) * currSong.duration;
  });

  //Hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".right").classList.add("dimmed");
  });

  document.querySelector(".closebtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".right").classList.remove("dimmed");
  });

  //prev next
  prev.addEventListener("click", () => {
    currSong.pause();
    // console.log("Prev clicked");
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currSong.pause();
    // console.log("Next clicked");
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= 0) {
      playMusic(songs[index + 1]);
    }
  });
}

main();

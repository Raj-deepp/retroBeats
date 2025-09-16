let songs;
let currSong = new Audio();
let currFolder;

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

async function getSongs(folder) {
  currFolder = folder;
  let x = await fetch(`${folder}/`);
  let response = await x.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    let cleanSong = song.replaceAll("%20", " ").replace(".mp3", "");
    let [title, artist] = cleanSong.split(" - ");
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
        <img class="invert" src="img/music.svg" alt="" />
        <div class="info">
          <div class = "title">${title}</div>
        <div class = "artist">${artist}</div>
        </div>
        <div class="playnow">
          <img class="invert" src="img/play.svg" alt="" />
        </div>
      </li>`;
  }

  //EL each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      //   console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (audiotrack, pause = false) => {
  //   let audio = new Audio("/songs/" + audiotrack);
  currSong.src = `/${currFolder}/` + audiotrack;
  if (!pause) {
    currSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(audiotrack).replace(
    ".mp3",
    ""
  );
  document.querySelector(".songduration").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let url = new URL(e.href);
      let parts = url.pathname.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];

      if (folder === "songs") continue;

      try {
        let res = await fetch(`/songs/${folder}/info.json`);
        let info = await res.json();

        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
              <div class="play">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                          stroke-linejoin="round" />
                  </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h2>${info.title}</h2>
              <p>${info.description}</p>
          </div>`;
      } catch (err) {
        console.error(`Could not load info.json for ${folder}`, err);
      }
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/cs");
  playMusic(songs[0], true);

  displayAlbums();

  //EL P P N
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "img/pause.svg";
    } else {
      currSong.pause();
      play.src = "img/play.svg";
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

  //volume
  const volumeSlider = document.querySelector(".volume input");
  const volumeIcon = document.querySelector(".volume img");
  let lastVolume = volumeSlider.value / 100 || 1;

  function updateVolumeIcon(vol) {
    if (vol === 0) {
      volumeIcon.src = "img/mute.svg";
    } else if (vol > 0 && vol <= 0.3) {
      volumeIcon.src = "img/volume1.svg";
    } else if (vol > 0.3 && vol <= 0.6) {
      volumeIcon.src = "img/volume2.svg";
    } else {
      volumeIcon.src = "img/volume3.svg";
    }
  }

  volumeSlider.addEventListener("input", (e) => {
    currSong.volume = e.target.value / 100;
    if (currSong.volume > 0) {
      lastVolume = currSong.volume;
    }
    updateVolumeIcon(currSong.volume);
  });

  volumeIcon.addEventListener("click", () => {
    if (currSong.volume > 0) {
      lastVolume = currSong.volume;
      currSong.volume = 0;
      volumeSlider.value = 0;
    } else {
      currSong.volume = lastVolume;
      volumeSlider.value = lastVolume * 100;
    }
    updateVolumeIcon(currSong.volume);
  });

  currSong.volume = volumeSlider.value / 100;
  updateVolumeIcon(currSong.volume);
}

main();

async function getSongs() {
  let x = await fetch("http://127.0.0.1:5500/songs/");
  let response = await x.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}

async function main() {
  let songs = await getSongs();

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
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="" />
        </div>
      </li>`;
  }
}

main();

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
      songs.push(element.href);
    }
  }
  return songs;
}

async function main() {
  let songs = await getSongs();
  console.log(songs);

  var audio = new Audio(songs[0]);
  audio.play();
}

main();

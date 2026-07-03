console.log("hello there");

async function getData() {
    let response = await fetch("/data.json");
    let data = await response.json();
    return data.playlists;
}

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    secs = secs < 10 ? "0" + secs : secs;
    return `${minutes}:${secs}`;
}

let audio = new Audio();
let currentIndex = 0;
let currentFolder = "";
let currentSongs = [];

const PlayMusic = (track, folder, pause = false) => {
    currentFolder = folder;
    audio.src = `/songs/${folder}/${track}.mp3`;
    if (!pause) {
        audio.play();
        Play.src = "SVGs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
}

async function librarycreater(playlist) {
    let songs = playlist.songs;
    let SongUL = document.querySelector(".Songlist").getElementsByTagName("ul")[0];
    SongUL.innerHTML = "";
    for (const e of songs) {
        SongUL.innerHTML += `<li>
            <img src="SVGs/Music.svg" alt="">
            <div class="songname">
                <div>${e}</div>
                <div>${playlist.name}</div>
            </div>
            <div class="Playnow flex">
                <span>Play Now</span>
                <img src="SVGs/play.svg" alt="">
            </div>
        </li>`;
    }
    return songs;
}

function attachSongListeners(songs, PlaylistName) {
    Array.from(document.querySelector(".Songlist").getElementsByTagName("li"))
        .forEach((li, index) => {
            li.addEventListener("click", () => {
                currentIndex = index;
                currentSongs = songs;
                let track = li.querySelector(".songname").firstElementChild.innerHTML;
                PlayMusic(track, PlaylistName);
            });
        });
}

async function main() {
    let playlists = await getData();
    let currentPlaylistName = playlists[0].name;

    let cards = document.querySelector(".cards");
    cards.innerHTML = "";
    playlists.forEach(playlist => {
        cards.innerHTML += `
        <div class="titleofcard" data-playlist="${playlist.name}">
            <img class="img1" src="Imgs/${playlist.name}.png" onerror="this.src='Imgs/cards.png'" alt="${playlist.name}">
            <div class="title">${playlist.name}</div>
            <p>Playlist</p>
        </div>`;
    });

    currentSongs = await librarycreater(playlists[0]);
    attachSongListeners(currentSongs, currentPlaylistName);
    PlayMusic(currentSongs[0], currentPlaylistName, true);
    document.querySelector(".songinfo").innerHTML = currentSongs[0];

    Array.from(document.querySelector(".cards").getElementsByClassName("titleofcard"))
        .forEach(card => {
            card.addEventListener("click", async () => {
                currentPlaylistName = card.getAttribute("data-playlist");
                let playlist = playlists.find(p => p.name === currentPlaylistName);
                currentIndex = 0;
                currentSongs = await librarycreater(playlist);
                attachSongListeners(currentSongs, currentPlaylistName);
                PlayMusic(currentSongs[0], currentPlaylistName);
            });
        });

    Play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            Play.src = "SVGs/pause.svg";
        } else {
            audio.pause();
            Play.src = "SVGs/play.svg";
        }
    });

    Previous.addEventListener("click", () => {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentSongs.length - 1;
        PlayMusic(currentSongs[currentIndex], currentFolder);
    });

    Next.addEventListener("click", () => {
        if (currentIndex < currentSongs.length - 1) currentIndex++;
        else currentIndex = 0;
        PlayMusic(currentSongs[currentIndex], currentFolder);
    });

    audio.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(audio.currentTime)}/${formatTime(audio.duration)}`;
        document.querySelector(".circle").style.left =
            (audio.currentTime / audio.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        audio.currentTime = (audio.duration * percent) / 100;
    });

    document.querySelector("#Hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("open");
    });
}

let islibraryview = false;
let leftsection1 = document.querySelector("#sectionleft1");
let leftsection2 = document.querySelector("#sectionleft2");
let legals = document.querySelector("#legals");
let sectionlefttoggle = document.querySelector("#sectionlefttoggle");

const toggleFunction = (e) => {
    e.preventDefault();
    islibraryview = !islibraryview;

    if (islibraryview) {
        leftsection1.classList.add("hide");
        leftsection2.classList.add("hide");
        legals.classList.add("hide");
        sectionlefttoggle.classList.add("active");
        requestAnimationFrame(() => {
            sectionlefttoggle.classList.add("show");
        });
    } else {
        sectionlefttoggle.classList.remove("show");
        setTimeout(() => {
            sectionlefttoggle.classList.remove("active");
            leftsection1.classList.remove("hide");
            leftsection2.classList.remove("hide");
            legals.classList.remove("hide");
        }, 400);
    }
};

document.querySelector("#MyLibraryToggle").addEventListener("click", toggleFunction);
document.querySelector("#leftheader").getElementsByTagName("h3")[0].addEventListener("click", toggleFunction);
main();
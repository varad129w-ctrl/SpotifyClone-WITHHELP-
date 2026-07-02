console.log("hello there");

//! GET PLAYLISTS
async function getplaylist() {
    let folder = await fetch("http://127.0.0.1:5500/songs/");
    let Response = await folder.text();

    let div = document.createElement("div");
    div.innerHTML = Response;

    let as = div.getElementsByTagName("a");
    let Playlist = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        // only folders: must contain /songs/, end with /, but NOT be the /songs/ folder itself
        if (element.href.includes("/songs/") && 
            element.href.endsWith("/") && 
            !element.href.endsWith("/songs/")) {
            // split and remove trailing slash so name is clean e.g "Ncs" not "Ncs/"
            let name = element.href.split("/songs/")[1].replace("/", "");
            Playlist.push(name);
        }
    }
    return Playlist;
}

//! GET SONGS 
async function getsongs(PlaylistName) {
    let song = await fetch(`http://127.0.0.1:5500/songs/${PlaylistName}/`);
    let Response = await song.text();

    let div = document.createElement("div");
    div.innerHTML = Response;

    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            // now PlaylistName has no trailing slash so split works correctly
            songs.push(
                element.href
                    .split(`/songs/${PlaylistName}/`)[1]
                    .split(".mp3")[0]
                    .replace("%20", " ")
            );
        }
    }
    return songs;
}

//! TIME FORMATTING
const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    secs = secs < 10 ? "0" + secs : secs;
    return `${minutes}:${secs}`;
}

//! AUDIO STATE 
let audio = new Audio();
let currentIndex = 0;
let currentFolder = "";
let currentSongs = [];

//! PLAY MUSIC
const PlayMusic = (track, folder, pause = false) => {
    currentFolder = folder; // always update currentFolder when playing
    audio.src = `http://127.0.0.1:5500/songs/${folder}/${track}.mp3`;
    if (!pause) {
        audio.play();
        Play.src = "../SVGs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
}

//! library Adder
async function librarycreater(PlaylistName) {
    let songs = await getsongs(PlaylistName);
    let SongUL = document.querySelector(".Songlist").getElementsByTagName("ul")[0];

    SongUL.innerHTML = ""; 
    for (const e of songs) {
        SongUL.innerHTML += `<li>
            <img src="../SVGs/Music.svg" alt="">
            <div class="songname">
                <div>${e}</div>
                <div>${PlaylistName}</div>
            </div>
            <div class="Playnow flex">
                <span>Play Now</span>
                <img src="../SVGs/play.svg" alt="">
            </div>
        </li>`;
    }
    return songs; 
}

//! songlistener
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

//! MAIN FUNCTION
async function main() {
    let playlists = await getplaylist();
    let currentPlaylistName = playlists[0]; 
    
    currentSongs = await librarycreater(currentPlaylistName);
    attachSongListeners(currentSongs, currentPlaylistName);

    PlayMusic(currentSongs[0], currentPlaylistName, true);
    document.querySelector(".songinfo").innerHTML = currentSongs[0];

    Array.from(document.querySelector(".cards").getElementsByClassName("titleofcard"))
        .forEach(card => {
            card.addEventListener("click", async () => {
                currentPlaylistName = card.querySelector(".title").innerHTML.trim();
                currentIndex = 0;
                // fix bug 5: rebuild song list and re-attach listeners
                currentSongs = await librarycreater(currentPlaylistName);
                attachSongListeners(currentSongs, currentPlaylistName);
                PlayMusic(currentSongs[0], currentPlaylistName);
            });
        });

    // play/pause
    Play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            Play.src = "../SVGs/pause.svg";
        } else {
            audio.pause();
            Play.src = "../SVGs/play.svg";
        }
    });

    // previous
    Previous.addEventListener("click", () => {
        if (currentIndex > 0) currentIndex--;
        else currentIndex = currentSongs.length - 1;
        PlayMusic(currentSongs[currentIndex], currentFolder);
    });

    // next
    Next.addEventListener("click", () => {
        if (currentIndex < currentSongs.length - 1) currentIndex++;
        else currentIndex = 0;
        PlayMusic(currentSongs[currentIndex], currentFolder);
    });

    // seekbar time update
    audio.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(audio.currentTime)}/${formatTime(audio.duration)}`;
        document.querySelector(".circle").style.left =
            (audio.currentTime / audio.duration) * 100 + "%";
    });

    // seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        audio.currentTime = (audio.duration * percent) / 100;
    });

    // hamburger
    document.querySelector("#Hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("open");
    });
}

//! LIBRARY TOGGLE
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
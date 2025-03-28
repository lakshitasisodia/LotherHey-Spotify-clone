console.log("let us write js");

// ✅ Ensure JavaScript is linked correctly
if (!document.querySelector(".playbar")) {
    console.error("⚠️ Playbar not found! Make sure it's included in index.html");
}

let cards = document.querySelectorAll('.card');
const links = [
    "playlist.html",
    "https://open.spotify.com/playlist/37i9dQZF1E4oJSdHZrVjxD",
    "https://open.spotify.com/playlist/37i9dQZF1E4AnYVmEEo8ws",
    "https://open.spotify.com/playlist/37i9dQZF1E4ES9yDEP9j0Y",
    "https://open.spotify.com/playlist/37i9dQZF1E4vqXjPu7Hg0z",
    "https://open.spotify.com/playlist/37i9dQZEVXbNG2KDcFcKOF",
    "https://open.spotify.com/playlist/37i9dQZEVXbMWDif5SCBJq"
];

// ✅ Clicking on playlist cards redirects instantly
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        window.location.href = links[index];
    });
});

let songs = [];
let rewind = document.querySelector(".rewind");
let audio = new Audio();
let isPlaying = false;
let forward = document.querySelector(".forward");
let pause = document.querySelector('.pausebutton img'); // ✅ Select the <img>, not the div

async function getsongs() {
    try {
        let a = await fetch("./songs/");
        let response = await a.text();
        let divs = document.createElement("div");
        divs.innerHTML = response;
        let value = divs.getElementsByTagName("a");

        for (let index = 0; index < value.length; index++) {
            const element = value[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split("/songs/")[1])); // ✅ Properly decode spaces
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

// ✅ Play Music Function
const playmusic = (track) => {
    if (audio.src !== `/songs/${track}`) {
        audio.src = `/songs/${track}`; // ✅ Set source first
        audio.play().then(() => {
            pause.src = "./images/pause.png";
            isPlaying = true;
        }).catch(err => console.log("Playback Error:", err));
    } else {
        if (!isPlaying) {
            audio.play();
            pause.src = "./images/pause.png";
            isPlaying = true;
        }
    }

    // ✅ Properly extract and display the song name
    let songTitle = track.replaceAll("%20", " ").replace(".mp3", "");  
    document.querySelector(".songinfo").innerHTML = songTitle;
};

// ✅ Main Function
async function main() {
    songs = await getsongs();
    if (songs.length === 0) {
        console.log("No songs found");
        return;
    }

    audio.src = `/songs/${songs[0]}`; // ✅ Load first song but don't autoplay
    document.querySelector(".songinfo").innerHTML = songs[0].replaceAll("%20", " ").replace(".mp3", "");

    let songul = document.querySelector(".songList").getElementsByTagName('ol')[0];
    songul.innerHTML = ""; // ✅ Clear existing list

    songs.forEach((i) => {
        let i2 = i.replaceAll("%20", " ");
        let li = document.createElement("li");
        li.setAttribute("role", "button");
        li.classList.add("flex", "align", "justify");

        li.innerHTML = `
            <div class="songList flex align">
                <div class="imageofhead">
                    <img class="flex align jcentre" src="./images/music.png" alt="">
                </div>
                <div class="info flex align column justify">
                    <div class="songname"><h1>${i2.split(" - ")[0]}</h1></div>
                    <div class="artistname">${i2.split(" - ")[1].replace(".mp3", " ")}</div>
                </div>
            </div>
        `;

        li.addEventListener("click", () => {
            playmusic(i);
        });

        songul.appendChild(li);
    });

    // ✅ Play/Pause Toggle
    pause.parentElement.addEventListener("click", () => {
        if (audio) {
            if (isPlaying) {
                audio.pause();
                pause.src = "./images/play-button-arrowhead.png"; // ✅ Change to play image
            } else {
                audio.play();
                pause.src = "./images/pause.png"; // ✅ Change to pause image
            }
            isPlaying = !isPlaying;
        }
    });

    // ✅ Update Playbar
    audio.addEventListener("timeupdate", () => {
        let currentTime = formatTime(audio.currentTime);
        let duration = isNaN(audio.duration) ? "00:00" : formatTime(audio.duration);
        document.querySelector('.songtime').innerHTML = `${currentTime} / ${duration}`;

        document.querySelector(".seekbarball").style.left = (((audio.currentTime / audio.duration) * 90) + 4.5) + "%";
    });

    // ✅ Seekbar Functionality
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbar = e.target.getBoundingClientRect();
        let clickPosition = e.offsetX / seekbar.width; // Get percentage clicked
        let newTime = clickPosition * audio.duration; // Calculate new time

        audio.currentTime = newTime; // Update audio position
        document.querySelector(".seekbarball").style.left = (clickPosition * 90 + 4.5) + "%"; // Move ball accurately
    });

    // ✅ Time Formatting
    function formatTime(seconds) {
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }

    // ✅ Previous Button Fix
    document.querySelector(".rewind").addEventListener("click", () => {
        let currentSong = decodeURIComponent(audio.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong);

        if (index > 0) {
            playmusic(songs[index - 1]); // ✅ Move to the previous song correctly
        } else {
            playmusic(songs[songs.length -2 ]); // ✅ If at first song, go to the last one
        }
    });

    // ✅ Next Button Fix
    document.querySelector(".forward").addEventListener("click", () => {
        let currentSong = decodeURIComponent(audio.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong);

        if (index < songs.length - 2) {
            playmusic(songs[index + 1]); // ✅ Move to the next song correctly
        } else {
            playmusic(songs[0]); // ✅ If at last song, go back to the first one
        }
    });
}

main();

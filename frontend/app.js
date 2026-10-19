const video =
    document.getElementById("camera");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


const predictionEl =
    document.getElementById("prediction");

const confidenceEl =
    document.getElementById("confidence");

const handsEl =
    document.getElementById("hands");

const textOutput =
    document.getElementById("textOutput");

const statusDot =
    document.getElementById("statusDot");

const statusText =
    document.getElementById("statusText");


const clearBtn =
    document.getElementById("clearBtn");

const speakBtn =
    document.getElementById("speakBtn");

const spaceBtn =
    document.getElementById("spaceBtn");

const backspaceBtn =
    document.getElementById("backspaceBtn");


const numberSymbols =
    document.getElementById("numberSymbols");

const letterSymbols =
    document.getElementById("letterSymbols");


let socket = null;

let sentence = "";

const STABLE_FRAMES = 5;

const RELEASE_FRAMES = 6;

let predictionHistory = [];

let characterLocked = false;

let noSignFrames = 0;


/* =====================================================
   SYMBOL GUIDE
   ===================================================== */

const numbers = [
    "0", "1", "2", "3", "4",
    "5", "6", "7", "8", "9"
];


const letters = [
    "A", "B", "C", "D", "E", "F",
    "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R",
    "S", "T", "U", "V", "W", "X",
    "Y", "Z"
];


function createSymbolCard(symbol) {

    const card =
        document.createElement("div");

    card.className =
        "symbol-card";


    const image =
        document.createElement("img");

    image.src =
        `/symbols/${symbol}.png`;

    image.alt =
        `Indian Sign Language ${symbol}`;


    const label =
        document.createElement("div");

    label.className =
        "symbol-label";

    label.textContent =
        symbol;


    card.appendChild(image);

    card.appendChild(label);

    return card;
}


numbers.forEach(
    symbol => {

        numberSymbols.appendChild(
            createSymbolCard(symbol)
        );
    }
);


letters.forEach(
    symbol => {

        letterSymbols.appendChild(
            createSymbolCard(symbol)
        );
    }
);


/* =====================================================
   TEXT
   ===================================================== */

function updateText() {

    textOutput.textContent =
        sentence ||
        "Start making signs...";
}


/* =====================================================
   CAMERA
   ===================================================== */

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({
                    video: {
                        width: 640,
                        height: 480
                    },
                    audio: false
                });


        video.srcObject =
            stream;

    } catch (error) {

        alert(
            "Camera access failed. Please allow webcam access."
        );

        console.error(error);
    }
}


/* =====================================================
   WEBSOCKET
   ===================================================== */

function connectWebSocket() {

    const protocol =
        location.protocol === "https:"
            ? "wss:"
            : "ws:";


    socket = new WebSocket(
        `${protocol}//${location.host}/ws`
    );


    socket.binaryType =
        "arraybuffer";


    socket.onopen = () => {

        statusDot.style.background =
            "#22c55e";

        statusText.textContent =
            "Connected";

        sendFrame();
    };


    socket.onclose = () => {

        statusDot.style.background =
            "#ef4444";

        statusText.textContent =
            "Disconnected";

        setTimeout(
            connectWebSocket,
            1500
        );
    };


    socket.onerror = () => {

        statusDot.style.background =
            "#ef4444";

        statusText.textContent =
            "Connection error";
    };


    socket.onmessage = event => {

        const data =
            JSON.parse(event.data);

        handlePrediction(data);
    };
}


/* =====================================================
   PREDICTION
   ===================================================== */

function handlePrediction(data) {

    const prediction =
        data.prediction ||
        "NO SIGN";


    const confidence =
        Number(
            data.confidence || 0
        );


    predictionEl.textContent =
        prediction;


    confidenceEl.textContent =
        `Confidence: ${
            (confidence * 100).toFixed(0)
        }%`;


    handsEl.textContent =
        data.hands || 0;


    if (
        prediction ===
        "NO SIGN"
    ) {

        noSignFrames++;

        predictionHistory = [];


        if (
            noSignFrames >=
            RELEASE_FRAMES
        ) {

            characterLocked = false;
        }

        return;
    }


    noSignFrames = 0;


    predictionHistory.push(
        prediction
    );


    if (
        predictionHistory.length >
        STABLE_FRAMES
    ) {

        predictionHistory.shift();
    }


    if (
        predictionHistory.length ===
        STABLE_FRAMES
        &&
        !characterLocked
    ) {

        const same =
            predictionHistory.every(
                value =>
                    value ===
                    predictionHistory[0]
            );


        if (same) {

            sentence +=
                predictionHistory[0];

            predictionHistory = [];

            characterLocked = true;

            updateText();
        }
    }
}


/* =====================================================
   SEND CAMERA FRAME
   ===================================================== */

function sendFrame() {

    if (
        !socket ||
        socket.readyState !==
        WebSocket.OPEN
    ) {

        setTimeout(
            sendFrame,
            100
        );

        return;
    }


    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        setTimeout(
            sendFrame,
            100
        );

        return;
    }


    canvas.width = 640;

    canvas.height = 480;


    ctx.drawImage(
        video,
        0,
        0,
        640,
        480
    );


    canvas.toBlob(
        blob => {

            if (
                blob &&
                socket.readyState ===
                WebSocket.OPEN
            ) {

                socket.send(
                    blob
                );
            }


            setTimeout(
                sendFrame,
                70
            );

        },

        "image/jpeg",

        0.65
    );
}


/* =====================================================
   BUTTONS
   ===================================================== */

clearBtn.addEventListener(
    "click",
    () => {

        sentence = "";

        predictionHistory = [];

        characterLocked = false;

        updateText();
    }
);


spaceBtn.addEventListener(
    "click",
    () => {

        sentence += " ";

        characterLocked = false;

        updateText();
    }
);


backspaceBtn.addEventListener(
    "click",
    () => {

        sentence =
            sentence.slice(
                0,
                -1
            );

        updateText();
    }
);


speakBtn.addEventListener(
    "click",
    async () => {

        if (!sentence.trim()) {
            return;
        }


        speakBtn.disabled =
            true;

        speakBtn.textContent =
            "Speaking...";


        try {

            const response =
                await fetch(
                    "/speak",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            text: sentence
                        })
                    }
                );


            const data =
                await response.json();


            if (
                data.success &&
                data.audio_url
            ) {

                const audio =
                    new Audio(
                        data.audio_url
                    );

                await audio.play();
            }


        } catch (error) {

            console.error(
                "Speech error:",
                error
            );

        } finally {

            speakBtn.disabled =
                false;

            speakBtn.textContent =
                "🔊 Speak";
        }
    }
);


/* =====================================================
   START
   ===================================================== */

startCamera();

connectWebSocket();

updateText();
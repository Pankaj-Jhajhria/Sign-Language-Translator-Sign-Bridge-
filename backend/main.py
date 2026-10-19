import base64
import json
import uuid
from pathlib import Path

import cv2
import numpy as np
import edge_tts

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.inference import SignLanguageInference


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = BASE_DIR / "audio"

AUDIO_DIR.mkdir(exist_ok=True)

FRONTEND_DIR = BASE_DIR / "frontend"
SYMBOLS_DIR = BASE_DIR / "symbols"
# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Indian Sign Language Translator"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve generated audio files
app.mount(
    "/audio",
    StaticFiles(directory=str(AUDIO_DIR)),
    name="audio"
)

app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static"
)
app.mount(
    "/symbols",
    StaticFiles(directory=str(SYMBOLS_DIR)),
    name="symbols"
)
# =========================================================
# INFERENCE ENGINE
# =========================================================

inference = SignLanguageInference()


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
async def root():
    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


@app.get("/health")
async def health():

    return {
        "status": "ok"
    }


# =========================================================
# WEBSOCKET
# =========================================================

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):

    await websocket.accept()

    print("WebSocket client connected.")

    try:

        while True:

            # Browser sends JPEG bytes
            data = await websocket.receive_bytes()

            # -------------------------------------------------
            # Decode image
            # -------------------------------------------------

            image_array = np.frombuffer(
                data,
                dtype=np.uint8
            )

            frame = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR
            )

            if frame is None:

                await websocket.send_json({
                    "prediction": "NO SIGN",
                    "confidence": 0.0,
                    "hands": 0
                })

                continue


            # -------------------------------------------------
            # AI inference
            # -------------------------------------------------

            result = inference.predict(
                frame
            )


            # -------------------------------------------------
            # Send result to browser
            # -------------------------------------------------

            await websocket.send_json(
                result
            )


    except WebSocketDisconnect:

        print("WebSocket client disconnected.")

    except Exception as e:

        print(
            "WebSocket error:",
            repr(e)
        )


# =========================================================
# TEXT TO SPEECH
# =========================================================

VOICE = "en-IN-PrabhatNeural"


@app.post("/speak")
async def speak(payload: dict):

    text = str(
        payload.get(
            "text",
            ""
        )
    ).strip()

    if not text:

        return {
            "success": False,
            "message": "No text provided"
        }


    filename = (
        f"speech_{uuid.uuid4().hex}.mp3"
    )

    output_path = AUDIO_DIR / filename


    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate="+0%",
        volume="+0%"
    )

    await communicate.save(
        str(output_path)
    )


    return {
        "success": True,
        "audio_url": f"/audio/{filename}"
    }


# =========================================================
# SHUTDOWN
# =========================================================

@app.on_event("shutdown")
def shutdown():

    inference.close()

    print(
        "Inference engine closed."
    )
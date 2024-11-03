let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fruitLabels = ["banana", "orange", "apple", "dragon fruit", "grape", "lemon"];

// Load model function
async function loadModel() {
    const modelURL = `${URL}model.json`;
    console.log("Loading model from:", modelURL);
    try {
        model = await tmImage.load(modelURL);
        console.log("Model successfully loaded:", model);
        result.innerText = "Model is ready. Please place the produce in front of the camera.";
    } catch (error) {
        console.error("Error loading model:", error);
        result.innerText = "Cannot load the model!";
    }
}

// Setup camera function
async function setupCamera(deviceId = null) {
    try {
        const constraints = {
            video: deviceId ? { deviceId: { exact: deviceId } } : true
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Error setting up the camera:", error);
        result.innerText = "Cannot access the camera!";
    }
}

// Prediction function
async function predict() {
    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = tf.browser.fromPixels(canvas);
        const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
        const normalizedImage = resizedImage.div(255.0).expandDims(0);
        const predictions = await model.predict(normalizedImage).data();
        let maxProbability = 0;
        let predictedClass = "";
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClass = model.getClassLabels()[i];
            }
        }
        if (fruitLabels.includes(predictedClass.toLowerCase())) {
            const message = `Đây là ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
            result.innerText = message;
            speak(message);  // Speak out when identification is correct
        } else {
            const message = "Đây không phải là trái cây!";
            result.innerText = message;
            speak(message);  // Speak out when identification is incorrect
        }
    } catch (error) {
        console.error("Prediction error:", error);
        result.innerText = "Prediction error. Please check the console.";
    }
}

// Text-to-Speech function
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    } else {
        console.error("Speech Synthesis not supported in this browser.");
    }
}

// Initialize application
async function init() {
    await loadModel();
    const videoDevices = await getVideoDevices();
    if (videoDevices.length === 0) {
        console.log("No video devices found.");
        result.innerText = "No video devices found!";
    } else if (videoDevices.length === 1) {
        await setupCamera(videoDevices[0].deviceId);
    } else {
        const select = document.createElement('select');
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${videoDevices.indexOf(device) + 1}`;
            select.appendChild(option);
        });
        select.addEventListener('change', async () => {
            await setupCamera(select.value);
        });
        document.body.appendChild(select);
        await setupCamera(videoDevices[0].deviceId);
    }
}
// Run initialization when page loads
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof tmImage === "undefined") {
        console.error("tmImage is not defined. Please check the library script.");
        result.innerText = "An error occurred. Please try again later.";
    } else {
        await init();
    }
});

// Translate English to Vietnamese function
async function translateToVietnamese(text) {
    const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with your actual API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            q: text,
            target: "vi"
        })
    });
    const data = await response.json();
    return data.data.translations[0].translatedText;
}

// Get list of video devices (cameras)
async function getVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
}

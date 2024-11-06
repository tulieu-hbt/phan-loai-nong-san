// script.js

let model;
const URL = "model/";

// Lấy các phần tử từ DOM
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById("camera");
const canvas = document.createElement("canvas");
const capturedImage = document.getElementById("capturedImage");
const preservationInfo = document.getElementById("preservationInfo");
const plantingPlanContainer = document.getElementById("plantingPlanContainer");
const marketInfoContainer = document.getElementById("marketInfoContainer");

// Thiết lập kích thước canvas giống với video
video.addEventListener('loadedmetadata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
});

// Hàm tải mô hình
async function loadModel() {
    const modelURL = `${URL}model.json`;
    try {
        model = await tf.loadLayersModel(modelURL);
        if (result) result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        if (result) result.innerText = "Không thể tải mô hình! " + error.message;
    }
}

// Hàm khởi tạo camera với cấu hình phù hợp
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        if (result) result.innerText = "Không thể sử dụng camera!";
    }
}

// Hàm lưu ảnh chụp vào thẻ img có id="capturedImage"
function saveCapturedImage() {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (capturedImage) {
        capturedImage.src = canvas.toDataURL("image/png");
    } else {
        console.error("Element with ID 'capturedImage' not found.");
    }
}

// Hàm dự đoán
async function predict() {
    if (!model) return;

    saveCapturedImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
    const preservationTexts = {
        "thanh long": "Bảo quản thanh long ở nơi thoáng mát...",
        "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng...",
        "cà chua": "Cà chua nên được bảo quản ở nhiệt độ phòng...",
        "nho": "Nho nên được bảo quản trong tủ lạnh...",
        "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng..."
    };

    let maxProbability = 0, predictedClass = "";
    for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] > maxProbability) {
            maxProbability = predictions[i];
            predictedClass = classLabels[i];
        }
    }

    if (maxProbability < 0.7) {
        if (result) result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        return;
    }

    if (result) result.innerText = `Kết quả: ${predictedClass}`;
    if (preservationInfo) preservationInfo.innerText = preservationTexts[predictedClass];
    speak(preservationTexts[predictedClass]);
    displayPlantingPlan(predictedClass, plantingPlanContainer);
    displayMarketData(predictedClass, marketInfoContainer);
}

// Hàm Text-to-Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    }
}

// Khởi tạo
async function init() {
    await loadModel();
    await setupCamera();
}

document.addEventListener("DOMContentLoaded", async () => {
    await init();
    if (captureButton) captureButton.addEventListener("click", predict);
});

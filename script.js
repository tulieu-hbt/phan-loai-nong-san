// script.js

let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById("camera");
const canvas = document.createElement("canvas");
const imageContainer = document.getElementById("imageContainer");
const preservationInfo = document.getElementById("preservationInfo");

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
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình! " + error.message;
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
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Hàm lưu ảnh chụp vào vùng imageContainer
function saveCapturedImage() {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    imageContainer.innerHTML = ""; 
    imageContainer.appendChild(img);
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
        result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        return;
    }

    result.innerText = `Kết quả: ${predictedClass}`;
    preservationInfo.innerText = preservationTexts[predictedClass];
    speak(preservationTexts[predictedClass]);
    displayPlantingPlan(predictedClass, document.getElementById("plantingPlanContainer"));
    displayMarketData(predictedClass, document.getElementById("marketInfoContainer"));
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
    captureButton.addEventListener("click", predict);
});

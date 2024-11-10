let model;
const URL = "model/";

const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById("camera");
const canvas = document.createElement("canvas");
const capturedImage = document.getElementById("capturedImage");
const preservationInfo = document.getElementById("preservationInfo");
const plantingPlanContainer = document.getElementById("plantingPlanContainer");
const marketInfoContainer = document.getElementById("marketInfoContainer");

// Định nghĩa biến introContainer
const introContainer = document.getElementById("introductionContainer");

// Khởi tạo camera
async function setupCamera() {
    try {
        // Kiểm tra các quyền truy cập camera trên các thiết bị khác nhau
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        video.srcObject = stream;
        return new Promise(resolve => {
            video.onloadedmetadata = () => resolve(video);
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}


// Tải mô hình TensorFlow
async function loadModel() {
    const modelURL = `${URL}model.json`;
    try {
        model = await tf.loadLayersModel(modelURL);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Chụp ảnh từ video camera
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage.src = canvas.toDataURL("image/png");
}

// Dự đoán nông sản
async function predict() {
    if (!model) return;

    captureImage();
    const image = tf.browser.fromPixels(canvas);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const inputTensor = tf.expandDims(normalizedImage, 0);

    const predictions = await model.predict(inputTensor).data();
    const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
    const preservationTexts = {
        "thanh long": "Bảo quản thanh long ở nơi thoáng mát...",
        "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng sau khi thu hoạch.",
        "cà chua": "Cà chua nên được bảo quản ở nhiệt độ phòng sau khi thu hoạch.",
        "nho": "Nho nên được bảo quản trong tủ lạnh...",
        "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng..."
    };

    let maxProbability = 0;
    let predictedClass = "";
    predictions.forEach((prob, i) => {
        if (prob > maxProbability) {
            maxProbability = prob;
            predictedClass = classLabels[i];
        }
    });

    if (maxProbability < 0.7) {
        result.innerText = "Không nhận diện được nông sản.";
        speak("Không nhận diện được nông sản.");
        preservationInfo.innerText = "";
        plantingPlanContainer.innerHTML = "";
        marketInfoContainer.innerHTML = "";
        return;
    }

    result.innerText = `Kết quả: ${predictedClass}`;
    preservationInfo.innerText = preservationTexts[predictedClass];
    speak(preservationTexts[predictedClass]);

    // Hiển thị dữ liệu kế hoạch trồng cây và chi phí
    await fetchAndDisplayPlanData(predictedClass, introContainer, plantingPlanContainer, marketInfoContainer);
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

// Chạy khi trang đã tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});

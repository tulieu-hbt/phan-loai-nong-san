let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const imageContainer = document.getElementById('imageContainer');
const preservationInfo = document.getElementById('preservationInfo');
const plantingPlanContainer = document.getElementById('plantingPlanContainer');
let ctx;

// Khởi tạo context cho canvas khi DOM được tải
window.addEventListener("DOMContentLoaded", () => {
    if (canvas) {
        ctx = canvas.getContext('2d');
    } else {
        console.error("Canvas không tồn tại. Vui lòng kiểm tra lại phần tử canvas trong HTML.");
    }
});

// Hàm tải mô hình
async function loadModel() {
    const modelURL = `${URL}model.json`;
    console.log("Đang tải mô hình từ:", modelURL);
    try {
        model = await tf.loadLayersModel(modelURL);
        console.log("Mô hình đã được tải thành công:", model);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình! " + error.message;
    }
}

// Hàm thiết lập camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        video.srcObject = stream;
        video.style.display = "block";
        return new Promise((resolve) => {
            video.onloadedmetadata = () => resolve(video);
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Hàm Text-to-Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        synthesis.speak(utterance);
    } else {
        console.error("Trình duyệt không hỗ trợ Speech Synthesis.");
    }
}

// Hàm dự đoán loại nông sản
async function predict() {
    try {
        if (!ctx) {
            console.error("Không thể lấy context của canvas.");
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = tf.browser.fromPixels(canvas);
        const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
        const normalizedImage = resizedImage.div(255.0);
        const inputTensor = tf.expandDims(normalizedImage, 0);

        const predictions = await model.predict(inputTensor).data();
        const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh", "cải xanh", "bầu", "mướp", "đu đủ", "ổi", "ớt"];

        const preservationTexts = { /* chứa thông tin bảo quản */ };
        const plantingPlans = { /* chứa kế hoạch trồng cây */ };

        let maxProbability = 0, predictedClass = "";
        let secondMaxProbability = 0, secondPredictedClass = "";

        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                secondMaxProbability = maxProbability;
                secondPredictedClass = predictedClass;
                maxProbability = predictions[i];
                predictedClass = classLabels[i];
            } else if (predictions[i] > secondMaxProbability) {
                secondMaxProbability = predictions[i];
                secondPredictedClass = classLabels[i];
            }
        }

        if (maxProbability < 0.7) {
            result.innerText = "Không nhận diện được nông sản. Vui lòng thử lại.";
            speak("Không nhận diện được nông sản. Vui lòng thử lại.");
            return;
        }

        if (maxProbability - secondMaxProbability < 0.2) {
            result.innerText = `Kết quả không chắc chắn. Có thể là: ${predictedClass} hoặc ${secondPredictedClass}`;
            speak(`Kết quả không chắc chắn. Có thể là: ${predictedClass} hoặc ${secondPredictedClass}`);
            return;
        }

        result.innerText = `Kết quả dự đoán: ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
        speak(`Kết quả dự đoán: ${predictedClass}`);
        
        const preservationText = preservationTexts[predictedClass];
        preservationInfo.innerText = `Cách bảo quản: ${preservationText}`;
        speak(preservationText);

        plantingPlanContainer.innerHTML = plantingPlans[predictedClass] || `<p>Chưa có kế hoạch trồng cho loại cây này.</p>`;
        
    } catch (error) {
        console.error("Lỗi khi dự đoán:", error);
        result.innerText = "Lỗi khi dự đoán: " + error.message;
    }
}

// Khởi tạo ứng dụng
async function init() {
    await loadModel();
    await setupCamera();
}

// Chạy khi trang web được tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});

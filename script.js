// script.js

let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const imageContainer = document.getElementById('imageContainer');
const preservationInfo = document.getElementById('preservationInfo');

// Kiểm tra nếu canvas tồn tại trước khi lấy context
let ctx;
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

// Hàm khởi tạo camera với cấu hình phù hợp
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        video.srcObject = stream;
        video.style.display = "block";
        video.style.width = "100%";
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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = "Hình chụp từ camera";
    img.classList.add('captured-image');
    imageContainer.innerHTML = ''; // Xóa ảnh cũ trước khi thêm ảnh mới
    imageContainer.appendChild(img);
}

// Hàm dự đoán
// Hàm dự đoán
async function predict() {
    try {
        if (!ctx) {
            console.error("Không thể lấy context của canvas. Vui lòng kiểm tra lại phần tử canvas.");
            return;
        }

        // Chụp ảnh từ video và lưu ảnh
        saveCapturedImage();

        // Tiền xử lý ảnh để dự đoán
        const image = tf.browser.fromPixels(canvas);
        const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
        const normalizedImage = resizedImage.div(255.0);
        const inputTensor = tf.expandDims(normalizedImage, 0);

        const predictions = await model.predict(inputTensor).data();

        // Thay thế bằng nhãn của mô hình của bạn
        const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];
        const preservationTexts = {
            "thanh long": "Bảo quản thanh long ở nơi thoáng mát, tránh ánh nắng trực tiếp, tốt nhất ở nhiệt độ 10-12 độ C.",
            "chuối": "Chuối nên được bảo quản ở nhiệt độ phòng, tránh nơi có ánh nắng mặt trời và độ ẩm cao.",
            "cà chua": "Cà chua nên được bảo quản ở nhiệt độ phòng, tránh lạnh để giữ hương vị tốt nhất.",
            "nho": "Nho nên được bảo quản trong tủ lạnh và giữ trong hộp kín để tránh mất nước.",
            "chanh": "Chanh nên được bảo quản ở nhiệt độ phòng hoặc trong ngăn mát tủ lạnh để giữ độ tươi lâu hơn."
        };

        let maxProbability = 0;
        let predictedClass = "";

        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClass = classLabels[i];
            }
        }

        if (maxProbability < 0.7) {
            result.innerText = "Không nhận diện được nông sản. Vui lòng thử lại.";
            speak("Không nhận diện được nông sản. Vui lòng thử lại.");
            return;
        }

        const predictedText = `Kết quả dự đoán: ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
        result.innerText = predictedText;
        speak(predictedText);

        const preservationText = preservationTexts[predictedClass];
        preservationInfo.innerText = `Cách bảo quản: ${preservationText}`;
        speak(preservationText);

        // Gọi hàm displayPlantingPlan từ kehoach.js để hiển thị kế hoạch trồng cây
        displayPlantingPlan(predictedClass);

    } catch (error) {
        console.error("Lỗi khi dự đoán:", error);
        result.innerText = "Lỗi khi dự đoán: " + error.message;
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

// Hàm khởi tạo ứng dụng
async function init() {
    await loadModel();
    await setupCamera();
}

// Chạy khi trang web được tải
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    captureButton.addEventListener("click", predict);
});

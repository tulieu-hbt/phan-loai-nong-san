let model;
const URL = "model/"; // Thay thế bằng đường dẫn đến mô hình của bạn
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('imageContainer');

// Hàm tải mô hình
async function loadModel() {
    try {
        model = await tmImage.load(`${URL}model.json`);
        console.log("Model loaded successfully");
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Error loading model:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Hàm thiết lập camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo camera:", error);
        if (error.name === "NotAllowedError") {
            result.innerText = "Bạn đã từ chối truy cập camera hoặc camera đang được sử dụng bởi ứng dụng khác.";
        } else if (error.name === "NotFoundError") {
            result.innerText = "Không tìm thấy camera trên thiết bị.";
        } else {
            result.innerText = "Không thể truy cập camera!";
        }
    }
}

// Hàm chụp ảnh và dự đoán
async function predict() {
    try {
        // Chụp ảnh
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataURL = canvas.toDataURL();

        // Hiển thị ảnh đã chụp
        const capturedImage = document.createElement('img');
        capturedImage.src = imageDataURL;
        capturedImage.style.maxWidth = "100%";
        capturedImage.style.maxHeight = "100%";
        imageContainer.innerHTML = '';
        imageContainer.appendChild(capturedImage);

        // Xử lý và dự đoán
        const image = tf.browser.fromPixels(canvas);
        const resized = tf.image.resizeBilinear(image, [224, 224]);
        const normalized = resized.div(255);
        const batched = normalized.expandDims(0);

        console.log("Image processed for prediction:");
        console.log(batched);

        const predictions = await model.predict(batched).data();
        console.log("Predictions:", predictions);

        // Lấy nhãn dự đoán (thay thế bằng nhãn của bạn)
        const classLabels = ["dragon fruit", "banana", "tomato", "grape", "lemon"]; 
        let maxProbability = 0;
        let predictedClass = "";
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClass = classLabels[i];
            }
        }

        // Hiển thị kết quả và đọc bằng tiếng Việt
        if (maxProbability > 0.6) { // Điều chỉnh ngưỡng nếu cần
            const message = `Dự đoán: ${predictedClass} - ${(maxProbability * 100).toFixed(2)}%`;
            result.innerText = message;
            speak(message);
        } else {
            const message = "Không nhận ra nông sản này.";
            result.innerText = message;
            speak(message);
        }

    } catch (error) {
        console.error("Prediction error:", error);
        result.innerText = "Lỗi khi dự đoán!";
    }
}

// Hàm chuyển văn bản thành giọng nói
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

// Khởi tạo ứng dụng
async function init() {
    await loadModel();
    await setupCamera();
    captureButton.addEventListener("click", predict);
}

// Chạy ứng dụng khi trang web được tải
document.addEventListener('DOMContentLoaded', init);

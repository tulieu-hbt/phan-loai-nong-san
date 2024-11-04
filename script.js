et model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const   
 imageContainer = document.getElementById('imageContainer');

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

// Hàm khởi tạo camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;   

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Lỗi   
 khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera! " + error.message; // Hiển thị thông báo lỗi chi tiết
    }
}
// Hàm dự đoán
async function predict() {
    try {
        // Chụp ảnh từ video
        const imageDataURL = canvas.toDataURL();
        const capturedImage = document.createElement('img');
        capturedImage.src = imageDataURL;

        // Điều chỉnh kích thước khung hình chụp
        capturedImage.style.maxWidth = "100%";
        capturedImage.style.maxHeight = "100%";

        imageContainer.innerHTML = '';
        imageContainer.appendChild(capturedImage)

        // Tiếp tục xử lý phân loại
        const image = tf.browser.fromPixels(canvas);
        const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
        const normalizedImage = resizedImage.div(255.0);
        const inputTensor = tf.expandDims(normalizedImage, 0);

        const predictions = await model.predict(inputTensor).data();

        // Thay thế bằng nhãn của mô hình của bạn
        const classLabels = ["dragon fruit", "banana", "tomato", "grape", "lemon","carrot"];

        let maxProbability = 0;
        let predictedClass = "";
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClass = classLabels[i];
            }
        }

        // Kiểm tra độ chính xác (điều chỉnh ngưỡng nếu cần)
        if (maxProbability < 0.6) {
            result.innerText = "Không đúng nông sản";
            speak("Không đúng nông sản");
            return;
        }

        let predictedText = `Kết quả dự đoán: ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
        let messageVi = await translateToVietnamese(predictedText); // Dịch sang tiếng Việt
        result.innerText = messageVi;
        speak(messageVi);

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

// Hàm dịch tiếng Anh sang tiếng Việt (sử dụng Google Translate API)
async function translateToVietnamese(text) {
    const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Thay API key của bạn vào đây
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    try {
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
    } catch (error) {
        console.error("Lỗi khi dịch:", error);
        return text;
    }
}

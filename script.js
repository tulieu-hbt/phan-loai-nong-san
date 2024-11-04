let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('imageContainer');

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
                facingMode: "environment", // Sử dụng camera sau trên điện thoại
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        video.srcObject = stream;
        video.style.display = "block"; // Hiển thị video
        video.style.width = "100%"; // Đảm bảo video được hiển thị toàn bộ trong khung hình
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

// Hàm phát hiện vùng sản phẩm và dự đoán
async function predict() {
    try {
        // Chụp ảnh từ video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Kiểm tra xem canvas có hình ảnh hay không
        if (ctx.getImageData(0, 0, canvas.width, canvas.height).data.every(value => value === 0)) {
            result.innerText = "Không thể chụp được hình ảnh từ camera. Vui lòng kiểm tra lại.";
            return;
        }

        // Hiển thị ảnh chụp trên canvas
        const imageDataURL = canvas.toDataURL();
        const capturedImage = document.createElement('img');
        capturedImage.src = imageDataURL;
        capturedImage.style.maxWidth = "100%";
        imageContainer.innerHTML = ''; // Xóa nội dung cũ trong imageContainer
        imageContainer.appendChild(capturedImage); // Hiển thị ảnh

        // Phát hiện vùng sản phẩm nổi bật nhất (ví dụ sử dụng kỹ thuật tính toán trọng số của các vùng ảnh)
        const image = tf.browser.fromPixels(canvas);
        const grayscaleImage = image.mean(2).toFloat();
        const [height, width] = grayscaleImage.shape;

        // Áp dụng threshold để phát hiện vùng sản phẩm
        const binaryMask = grayscaleImage.greater(127);
        const totalNonZero = binaryMask.sum().arraySync();

        if (totalNonZero < 1000) {
            result.innerText = "Không tìm thấy sản phẩm rõ ràng. Vui lòng thử lại.";
            return;
        }

        // Tiền xử lý ảnh để dự đoán
        const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
        const normalizedImage = resizedImage.div(255.0);
        const inputTensor = tf.expandDims(normalizedImage, 0);

        const predictions = await model.predict(inputTensor).data();

        // Thay thế bằng nhãn của mô hình của bạn
        const classLabels = ["thanh long", "chuối", "cà chua", "nho", "chanh"];

        let maxProbability = 0;
        let predictedClass = "";
        let secondMaxProbability = 0;
        let secondPredictedClass = "";

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

        // Điều chỉnh ngưỡng dự đoán
        if (maxProbability < 0.7) {
            result.innerText = "Không nhận diện được nông sản. Vui lòng thử lại.";
            speak("Không nhận diện được nông sản. Vui lòng thử lại.");
            return;
        }

        // Cảnh báo khi kết quả không chắc chắn
        if (maxProbability - secondMaxProbability < 0.2) {
            result.innerText = `Kết quả không chắc chắn. Có thể là: ${predictedClass} hoặc ${secondPredictedClass}`;
            speak(`Kết quả không chắc chắn. Có thể là: ${predictedClass} hoặc ${secondPredictedClass}`);
            return;
        }

        let predictedText = `Kết quả dự đoán: ${predictedClass} (${(maxProbability * 100).toFixed(2)}%)`;
        result.innerText = predictedText;
        speak(predictedText);

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

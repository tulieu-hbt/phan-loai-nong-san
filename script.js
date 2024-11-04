let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');

// Kiểm tra nếu canvas tồn tại trước khi lấy context
let ctx;
if (canvas) {
    ctx = canvas.getContext('2d');
} else {
    console.error("Canvas không tồn tại. Vui lòng kiểm tra lại phần tử canvas trong HTML.");
}

const imageContainer = document.getElementById('imageContainer');
const preservationInfo = document.getElementById('preservationInfo');

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

// Hàm dự đoán
async function predict() {
    try {
        if (!ctx) {
            console.error("Không thể lấy context của canvas. Vui lòng kiểm tra lại phần tử canvas.");
            return;
        }

        // Chụp ảnh từ video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Kiểm tra xem canvas có hình ảnh hay không
        if (ctx.getImageData(0, 0, canvas.width, canvas.height).data.every(value => value === 0)) {
            result.innerText = "Không thể chụp được hình ảnh từ camera. Vui lòng kiểm tra lại.";
            return;
        }

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

        // Hiển thị thông tin bảo quản
        const preservationText = preservationTexts[predictedClass];
        preservationInfo.innerText = `Cách bảo quản: ${preservationText}`;
        speak(preservationText);

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

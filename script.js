let model;
const URL = "model/";
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fruitLabels = ["banana", "orange", "apple", "dragon fruit", "grape", "lemon"];

// Hàm tải mô hình
async function loadModel() {
    const modelURL = `${URL}model.json`;
    console.log("Đang tải mô hình từ:", modelURL);
    try {
        model = await tmImage.load(modelURL);
        console.log("Mô hình đã được tải thành công:", model);
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Lỗi khi tải mô hình:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Hàm khởi tạo camera
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
        console.error("Lỗi khi khởi tạo camera:", error);
        result.innerText = "Không thể sử dụng camera!";
    }
}

// Hàm dự đoán
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
            speak(message);  // Phát âm giọng nói khi nhận diện đúng
        } else {
            const message = "Đây không phải là trái cây!";
            result.innerText = message;
            speak(message);  // Phát âm giọng nói khi nhận diện không đúng
        }
    } catch (error) {
        console.error("Lỗi khi dự đoán:", error);
        result.innerText = "Lỗi khi dự đoán. Vui lòng kiểm tra console.";
    }
}

// Hàm phát âm giọng nói
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

// Hàm khởi tạo ứng dụng
async function init() {
    await loadModel();
    const videoDevices = await getVideoDevices();
    if (videoDevices.length === 0) {
        console.log("Không tìm thấy thiết bị video nào.");
        result.innerText = "Không tìm thấy thiết bị video!";
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

// Gọi hàm init khi trang web được tải
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof tmImage === "undefined") {
        console.error("tmImage is not defined. Please check the library script.");
        result.innerText = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
    } else {
        await init();
    }
});

// Hàm dịch tiếng Anh sang tiếng Việt
async function translateToVietnamese(text) {
    const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Thay bằng API Key thực tế của bạn
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
    return

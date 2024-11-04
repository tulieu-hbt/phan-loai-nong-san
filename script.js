let model;
const URL = "model/"; // Replace with the path to your model
const result = document.getElementById("result");
const captureButton = document.getElementById("captureButton");
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('imageContainer');

// Load model function
async function loadModel() {
    try {
        model = await tmImage.load(`${URL}model.json`); // Correctly load the model
        console.log("Model loaded successfully");
        result.innerText = "Mô hình đã sẵn sàng. Hãy đưa nông sản vào camera.";
    } catch (error) {
        console.error("Error loading model:", error);
        result.innerText = "Không thể tải mô hình!";
    }
}

// Setup camera function
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
        result.innerText = "Không thể truy cập camera!";
    }
}

// Capture and predict function
async function predict() {
    try {
        // Capture the image
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataURL = canvas.toDataURL();

        // Display the captured image
        const capturedImage = document.createElement('img');
        capturedImage.src = imageDataURL;
        capturedImage.style.maxWidth = "100%";
        capturedImage.style.maxHeight = "100%";
        imageContainer.innerHTML = '';
        imageContainer.appendChild(capturedImage);

        // Process and predict
        const image = tf.browser.fromPixels(canvas);
        const resized = tf.image.resizeBilinear(image, [224, 224]);
        const normalized = resized.div(255);
        const batched = normalized.expandDims(0);

        const predictions = await model.predict(batched).data();
        console.log("Predictions:", predictions);

        // Get prediction label (replace with your labels)
        const classLabels = ["dragon fruit", "banana", "tomato", "grape", "lemon"];
        let maxProbability = 0;
        let predictedClass = "";
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxProbability) {
                maxProbability = predictions[i];
                predictedClass = classLabels[i];
            }
        }

        // Display the result and read out in Vietnamese
        if (maxProbability > 0.6) { // Adjust threshold if needed
            const message = `Dự đoán: ${predictedClass} - ${(maxProbability * 100).toFixed(2)}%`;
            result.innerText = message;
            speak(message);  // Speak out when identification is correct
        } else {
            const message = "Không nhận ra nông sản này.";
            result.innerText = message;
            speak(message);  // Speak out when identification is incorrect
        }

    } catch (error) {
        console.error("Prediction error:", error);
        result.innerText = "Lỗi khi dự đoán!";
    }
}

// Text-to-Speech function
function speak(text) {
    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance

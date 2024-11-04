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
        result.innerText = "The model is ready. Please position the produce in front of the camera.";
    } catch (error) {
        console.error("Error loading model:", error);
        result.innerText = "Unable to load the model!";
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
        console.error("Error setting up the camera:", error);
        result.innerText = "Unable to access the camera!";
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

        // Display the result (add translation function if needed)
        if (maxProbability > 0.6) { // Adjust threshold if needed
            result.innerText = `Prediction: ${predictedClass} - ${(maxProbability * 100).toFixed(2)}%`;
        } else {
            result.innerText = "Cannot recognize this produce.";
        }

    } catch (error) {
        console.error("Prediction error:", error);
        result.innerText = "Error making prediction!";
    }
}

// Initialize the application
async function init() {
    await loadModel();
    await setupCamera();
    captureButton.addEventListener("click", predict);
}

// Run the application when the web page is loaded
document.addEventListener('DOMContentLoaded', init);

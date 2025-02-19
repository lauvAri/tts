<template>
  <div class="container">
    <div class="audio-recorder">
      <div class="header">
        <h2>录音</h2>
        <p>你可以选择回答下列问题，或着谈论你喜欢的话题</p>
      </div>
      <div class="question">
        <p><b>你是谁？你生活在哪？你的爱好是什么？</b></p>
      </div>
      <div class="main">
        <canvas id="visualizer" v-if="isVisualizing"></canvas>
      </div>
      <div class="buttons">
        <v-btn class="record-button" icon="mdi-radiobox-marked" @click="startRecording" v-if="!isRecording"></v-btn>
        <v-btn v-if="isRecording" icon="mdi-radiobox-blank" @click="stopRecording" class="stop-button"></v-btn>
        <input type="file" accept="audio/*" @change="handleFileUpload" />
      </div>
    </div>
    <div class="result-display">
      <h2>生成结果</h2>
      <div class="main">
        <div class="record-result">
          <audio controls :key="audioUrl">
            <source v-bind:src="audioUrl" :type="audioType">
          </audio>
        </div>
        <div class="clone-result">
          this is the clone result.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const audioUrl = ref(null);
const audioBlob = ref(null);
const isRecording = ref(false);
const isVisualizing = ref(false);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const audioContext = ref(null);
const analyser = ref(null);

const audioType = computed(() => {
  if (audioBlob.value) {
    return audioBlob.value.type || 'audio/wav';
  }
  return 'audio/wav';
});

const handleRecordingComplete = (audioBlob) => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value); // 释放旧的 URL
  }
  
  audioBlob.value = audioBlob;
  audioUrl.value = URL.createObjectURL(audioBlob); // 更新 audioUrl
  console.log(audioUrl.value);
};

const drawVisualizer = () => {
  requestAnimationFrame(drawVisualizer);
  const visualizer = document.getElementById("visualizer");
  if (visualizer && analyser.value) {
    const bufferLength = analyser.value.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.value.getByteFrequencyData(dataArray);
    const width = visualizer.width;
    const height = visualizer.height;
    const barWidth = 10;
    const canvasContext = visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width, height);
    let x = 0;

    dataArray.forEach((item) => {
      const y = item / 255 * height * 1.1;
      canvasContext.strokeStyle = `blue`;
      x += barWidth;
      canvasContext.beginPath();
      canvasContext.lineCap = "round";
      canvasContext.lineWidth = 2;
      canvasContext.moveTo(x, height);
      canvasContext.lineTo(x, height - y);
      canvasContext.stroke();
    });
  }
};

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder.value = new MediaRecorder(stream);

  audioContext.value = new AudioContext();
  analyser.value = audioContext.value.createAnalyser();
  const mediaStreamSource = audioContext.value.createMediaStreamSource(stream);

  mediaStreamSource.connect(analyser.value);
  analyser.value.fftSize = 256;

  isVisualizing.value = true; // 启动可视化效果

  nextTick(() => {
    const visualizer = document.getElementById("visualizer");
    if (visualizer) {
      visualizer.width = visualizer.clientWidth;
      visualizer.height = visualizer.clientHeight;
      drawVisualizer();
    }
  });

  mediaRecorder.value.ondataavailable = (e) => {
    audioChunks.value.push(e.data);
  };

  mediaRecorder.value.onstop = () => {
    const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
    audioChunks.value = [];
    handleRecordingComplete(audioBlob);
  };

  mediaRecorder.value.start();
  isRecording.value = true;
};

const stopRecording = () => {
  mediaRecorder.value.stop();
  isRecording.value = false;
  isVisualizing.value = false; // 停止可视化效果
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    audioBlob.value = file;
    handleRecordingComplete(file); // 调用 handleRecordingComplete
    console.log('File uploaded:', audioBlob.value);
  }
};
</script>

<style scoped>
div.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 60px;
  margin-top: 15vh;
}

div.audio-recorder, div.result-display {
  background-color: #fff;
  width: 40%;
  aspect-ratio: 2 / 1.5;
  border-radius: 26px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 6px;
  position: relative;
}

div.header {
  text-align: center;
}

div.question {
  background-color: #cecaca;
  padding: 6px;
  width: 80%;
  margin: 0 auto;
}

canvas {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

div.buttons {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

.record-button {
  background-image: linear-gradient(45deg, #a52a2a, #cd5c5c, #dc143c);
  color: #fff;
}

.stop-button {
  color: #000;
}
</style>
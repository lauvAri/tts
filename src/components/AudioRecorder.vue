<template>
    <div id="recorder">
        
    </div>
</template>

<style scoped>
div#recorder {
    background-color: #fff;
    width: 50%;
    aspect-ratio: 2 / 1;
    border-radius: 26px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    margin: 15vh auto;
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
    text-align: center;
    position: absolute;
    bottom: 0;
}
</style>

<script>
export default {
    name: 'AudioRecorder',
    data() {
        return {
            isRecording: false,
            mediaRecorder: null,
            audioChunks: [],
            audioContext: null,
            analyser: null
        };
    },
    methods: {
        drawVisualizer() {
            requestAnimationFrame(this.drawVisualizer);
            if (visualizer && this.analyser) {
                const visualizer = document.getElementById("visualizer");
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // Updating the analyzer with the new generated data visualization
                this.analyser.getByteFrequencyData(dataArray);
                const width = visualizer.width;
                const height = visualizer.height;
                const barWidth = 10;
                const canvasContext = visualizer.getContext('2d');
                canvasContext.clearRect(0, 0, width, height);
                let x = 0;

                dataArray.forEach((item) => {
                    // This formula decides the height of the vertical lines for every item in dataArray
                    const y = item / 255 * height * 1.1;
                    canvasContext.strokeStyle = `blue`;

                    // This decides the distances between the vertical lines
                    x += barWidth;
                    canvasContext.beginPath();
                    canvasContext.lineCap = "round";
                    canvasContext.lineWidth = 2;
                    canvasContext.moveTo(x, height);
                    canvasContext.lineTo(x, height - y);
                    canvasContext.stroke();
                });
            }
            
        },
        async startRecording() {
            // 获取用户的音频输入权限
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 创建MediaRecorder实例
            this.mediaRecorder = new MediaRecorder(stream);

            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

            // 连接媒体流和分析器
            mediaStreamSource.connect(this.analyser);
            this.analyser.fftSize = 256;

            // 初始化 canvas 尺寸
            const visualizer = document.getElementById("visualizer");
            visualizer.width = visualizer.clientWidth;
            visualizer.height = visualizer.clientHeight;

            // 开始绘制可视化效果
            this.drawVisualizer();

            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
                // Blob: Binary Large Object 用来 表示要被传输到服务器或者从服务器接收下来的数据
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.$emit('recording-complete', audioBlob);
                this.audioChunks = [];
            };

            this.mediaRecorder.start();
            this.isRecording = true;
        },
        stopRecording() {
            this.mediaRecorder.stop();
            this.isRecording = false;
        },
    },
    mounted() {
        // 初始化 canvas 尺寸
        const visualizer = document.getElementById("visualizer");
        if (visualizer) {
            visualizer.width = visualizer.clientWidth;
            visualizer.height = visualizer.clientHeight;
        }
      
    }
}
</script>

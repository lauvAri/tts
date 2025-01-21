<!-- src/views/TextToSpeech.vue -->
<template>
    <div class="container">
        <div id="text-to-speech">
            <div class="sound">
                <div class="sound-select">
                    <v-combobox width="160px" label="选择声音" :items=voices
                        variant="outlined"></v-combobox>
                    <button type="button" @click="goToClone" id="goto-clone-btn">克隆自己的声音</button>
                </div>
                <div>
                    <v-dialog max-width="500">
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-btn v-bind="activatorProps" text="声音设置"></v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                            <v-card width="500" height="500">
                                <p>进行音色，语言等设置......</p>
                                <div class="text-caption">
                                    音量
                                </div>
                                <v-slider v-model="soundSlider" thumb-label="always" :max="100" :min="0"></v-slider>
                                <div class="text-caption">
                                    语速
                                </div>
                                <!-- 0.5 0.75 1.25 1.5 2 -->
                                <v-slider :max="5" :ticks="speedLabels" show-ticks="always" step="1"
                                    tick-size="6" v-model="speed"></v-slider>
                            </v-card>

                        </template>
                    </v-dialog>
                </div>
            </div>
            <div class="text">
                <v-textarea label="输入文本"
                    row-height="20"
                    rows="16"
                    bg-color="#fff"
                    v-model="text"></v-textarea>
            </div>
            <div class="play">
                <button class="gradient-btn"
                    @click="generateAudio"
                    :disabled="isGenerating">{{ buttonText }}</button>
                <v-btn  @click="translateDialog = true" 
                        color="green" 
                        prepend-icon="mdi-translate-variant"
                        >{{ translateButtonText }}</v-btn> <!-- 翻译按钮 -->
                <v-dialog v-model="translateDialog">
                    <v-card>
                        <v-card-title>
                            <span class="headline">翻译</span>
                        </v-card-title>
                        <v-card-text>
                           <v-radio-group v-model="sourceLang"
                           inline label="源文">
                                <v-radio label="中文" value="zh"></v-radio>
                                <v-radio label="英文" value="en"></v-radio>
                                <v-radio label="日文" value="ja"></v-radio>
                                <v-radio label="韩文" value="ko"></v-radio>
                            </v-radio-group>
                            <v-radio-group v-model="targetLang"
                            inline label="译文">
                                <v-radio label="中文" value="zh"></v-radio>
                                <v-radio label="英文" value="en"></v-radio>
                                <v-radio label="日文" value="ja"></v-radio>
                                <v-radio label="韩文" value="ko"></v-radio>
                            </v-radio-group>
                        </v-card-text>
                    </v-card>
                    <v-btn text="确定" @click="translateText"></v-btn>
                </v-dialog>
                
            </div>
        </div>
        <div id="audio-list">
            <div>
                <p>生成结果</p>
                <div id="audio-result">
                    <div v-for="(audio, index) in audioFiles" :key="index">
                        <p>Option {{ index+1 }}</p>
                        <audio controls>
                            <source :src="audio.url" type="audio/mpeg">
                        </audio>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.container {
    width: 90%;
    margin: 0 auto;
    margin-top:100px;
    display: flex;
    flex-direction: row;
    gap: 10px;
}

#text-to-speech {
    flex: 3;
    background: #fff;
    padding: 20px;
    border-radius: 30px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

#audio-list {
    flex: 1;
    padding: 20px;
    background: #fff;
    height: 588px;
    border-radius: 26px;
}

#audio-result {
    max-height:400px;
    overflow: auto;
}

div.sound-select {
    display: flex;
    flex-direction: row;
}

#goto-clone-btn {
    padding: 6px;
    border-radius: 10px;
    color: #22c55e;
    font-weight: bold;
}
.sound {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.v-card {
    padding: 20px;
}

div.play {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.gradient-btn {
    background: linear-gradient(90deg, #0027eb, #4ade80);
    color: #fff;
    padding: 6px 14px;
    border-radius: 16px;
}

.v-slider {
    width: 300px;
    margin-top: 10px;
}

</style>

<script>
import axios from 'axios';  
export default {
    name: 'TextToSpeech',
    data() { 
        return {
            voices: ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming'],
            selectedVoice: null,
            soundSlider: 50,
            speed: 2,
            speedLabels: {
                0: '0.5x',
                1: '0.75x',
                2: '1x',
                3: '1.25x',
                4: '1.5x',
                5: '2x'
            },
            text:'',
            audioFiles: [],
            isGenerating: false,
            translateDialog: false,
            translateButtonText: '翻译',
            buttonText: '生成语音', // 控制按钮文字内容
            translatedText: '', // 用于存储翻译后的文本
            sourceLang: 'zh', // 源语言，默认为中文
            targetLang: 'en', // 目标语言，默认为英文
        }
    },
    methods: {
        goToClone() {
            window.location.href = 'voice-cloning';
        },
        async generateAudio() {
            this.isGenerating = true; // 添加: 设置生成状态为true
            this.buttonText = '生成中.......'; // 添加: 设置按钮文字内容为“生成中.......”
            try {
                const response = await axios.post('http://localhost:5000/api/generate-audio', { text: this.text, source_lang: this.sourceLang, target_lang: this.targetLang }, {
                responseType: 'blob'
                });
                console.log(response);

                // 创建Blob对象并生成URL
                const blob = new Blob([response.data], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(blob);

                // 记录文本和时间戳
                const timestamp = new Date().toISOString();
                this.audioFiles.push({ url: audioUrl, text: this.text, timestamp });

                // // 可选：清理文本框
                // this.text = '';
            } catch (error) {
                console.error('Error generating audio:', error);
            } finally {
                this.isGenerating = false; // 重置生成状态为false
                this.buttonText = '生成语音'; // 重置按钮文字内容为“生成语音”
            }
        },
        async translateText() { // 翻译方法
            this.translateDialog = false;
            this.translateButtonText = '翻译中......';
            if (!this.text) {
                alert('请输入要翻译的文本');
                return;
            }
            try {
                const response = await axios.post('http://localhost:5000/api/translate', { text: this.text, source_lang: this.sourceLang, target_lang: this.targetLang });
                this.translatedText = response.data.translatedText;
                // alert('翻译结果: ' + this.translatedText);
                this.text = this.translatedText;
            } catch (error) {
                console.error('Error translating text:', error);
                alert('翻译失败，请重试');
            } finally { 
                this.translateButtonText = "翻译";
            }

        }
    }
}
</script>
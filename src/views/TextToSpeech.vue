<template>
    <div class="text2speech">
        <v-sheet class="reference"
            border rounded
            elevation="4"
        >
            <div class="models">
                <p>模型选择</p>
                <v-combobox
                    label="GPT模型"
                    :items="GPTModels"
                    v-model="GPTModel"
                    @update:model-value="GPTModelChange"
                ></v-combobox>
                <v-combobox
                    label="SoVITS模型"
                    :items="SoVITSModels"
                    v-model="SoVITSModel"
                    @update:model-value="SoVITSModelChange"
                ></v-combobox>

            </div>
            <div class="refrence-audio">
                <v-file-input label="参考音频"
                    accept=".wav,.mp3,.m4a,.ogg,.flac,.wma,.aac,.wavpack,.wv,.opus,.mp4,.m4a,.m4b,.m4p,.m4r,.m4v,.mp3,.mp4,.mpeg,.mpga,.mpg,.mp2,.mp1,.mpa,.m2a,.m3a,.oga,.ogg,.spx,."
                    v-model="referenceAudio"
                    chips
                    @update:model-value="uploadRefAudio"
                ></v-file-input>
            </div>
            <div class="reference-language">
                <v-combobox
                    label="参考语言语种"
                    :items="referenceLanguages"
                    v-model="referenceLanguage"
                ></v-combobox>
            </div>
        </v-sheet>

        <v-sheet class="text"
            border rounded
            elevation="4"
        >
            <div class="text-content">
                <v-textarea
                    label="文本内容"
                    row-height="10"
                    rows="16"
                    variant="outlined"
                    v-model="text"
                ></v-textarea>
            </div>
            <div class="text-language">
                <v-combobox
                    label="文本语种"
                    :items="textLanguages"
                    v-model="textLanguage"
                ></v-combobox>
            </div>
            <div class="btns">
                <v-btn text="参数调节"></v-btn>
                <v-btn text="生成音频" @click="generateAudio"></v-btn>
                <v-btn text="测试按键" @click="foo"></v-btn>
            </div>
        </v-sheet>

        <v-sheet class="result"
            border rounded
            elevation="4"
        >
            <p>生成音频</p>
            <audio :src="resultAudio" controls></audio>
        </v-sheet>
    </div>
</template>

<script setup>
import { ref, onMounted} from 'vue';

const serverURL = 'http://127.0.0.1:9880';
const flaskURL = 'http://127.0.0.1:5000';
// 数据
let GPTModels = ref([]);
let SoVITSModels = ref([]);
const referenceLanguages = ['中文', '英文', '日文', '韩文', '粤语', '中英混合', '日英混合', '粤英混合', '韩英混合', '多语种混合', '多语种混合(粤语)'];
const textLanguages = ['中文', '英文', '日文', '韩文', '粤语', '中英混合', '日英混合', '粤英混合', '韩英混合', '多语种', '多语种混合(粤语)'];
const languageTable = {
    '中文': 'all_zh',
    '英文': 'en',
    '日语': 'all_ja',
    '韩语': 'all_ko',
    '粤语': 'all_yue',
    '中英混合': 'zh',
    '日英混合': 'ja',
    '粤英混合': 'yue',
    '韩英混合': 'ko',
    '多语种': 'auto'
}


// 请求参数
let GPTModel = ref(null);
let SoVITSModel = ref(null);
let referenceAudio = ref(null);
let text = ref('');
let referenceLanguage = ref(referenceLanguages[0])
let textLanguage = ref(textLanguages[0]);

let referenceAudioPath = ref(null);
// 返回结果
let resultAudio = ref(null);


function foo() {
    fetch(`${flaskURL}/api/get_tts_wav`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ref_wav_path: referenceAudioPath.value,
            prompt_text: '',
            prompt_language: referenceLanguage.value,
            text: text.value,
            text_language: textLanguage.value,
            how_to_cut: '凑四句一切',
            top_k: 15,
            top_p: 1,
            temperature: 1,
            ref_free: false,
            speed: 1,
            if_freeze: false,
            inp_refs: null,
         })
    })
        .then(response => {
            console.log(response);
            return response.blob()
        })
        .then(blob => {
            const audioUrl = URL.createObjectURL(blob);
            resultAudio.value = audioUrl;
            console.log(audioUrl);
        })
        .catch(error => {
            console.error('获取音频文件失败', error);
        });
}

// 获取模型列表
function fetchModels() {
    fetch(`${flaskURL}/api/change_choices`)
        .then(response => response.json())
        .then(data => {
            let GPT = data[1].choices.map(m => m[0]);
            GPTModels.value = GPT;
            let SoVITS = data[0].choices.map(m => m[0]);
            SoVITSModels.value = SoVITS;

            GPTModel.value = GPTModels.value[0];
            SoVITSModel.value = SoVITSModels.value[0];
    })
}

// 修改GPT模型
function GPTModelChange() { 
    // fetch(`${serverURL}/set_gpt_weights?weights_path=${GPTModel.value}`
    // ).catch(error => {
    //     console.error("切换GPT模型错误", error)
    // })
    fetch(`${flaskURL}/api/change_gpt_weights?weights_path=${GPTModel.value}`
    )
        .then(response => {
            if (response.ok) {
                console.log('切换GPT模型成功');
            } else {
                console.error('切换GPT模型失败');
            }
        })
        .catch(error => {
        console.error("切换GPT模型错误", error)
    })
}

// 修改SoVITS模型
function SoVITSModelChange() { 
    // fetch(`${serverURL}/set_sovits_weights?weights_path=${SoVITSModel.value}`,
    // ).catch(error => {
    //     console.error("切换SoVITS模型错误", error)
    // })
    fetch(`${flaskURL}/api/change_sovits_weights?weights_path=${SoVITSModel.value}`,
    )
        .then(response => {
            if (response.ok) {
                console.log('切换SoVITS模型成功');
            } else {
                console.error('切换SoVITS模型失败');
            }
        })
        .catch(error => {
        console.error("切换SoVITS模型错误", error)
    })
}
// 上传参考音频
function uploadRefAudio() { 
    const formData = new FormData();
    formData.append('audio_file', referenceAudio.value);
    fetch(`${flaskURL}/api/upload_ref_audio`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('上传文件失败');
            }
            return response.json();
        })
        .then(data => { 
            referenceAudioPath.value = data.file_path;
        })
        .catch(error => { 
            console.error('上传文件失败: ', error);
        })
}

// 修改语种

function getLanguageFromTable(lan) {
    return languageTable[lan];
}


// 生成音频
function generateAudio() {
    const data = {
        text: text.value,
        text_lang: getLanguageFromTable(textLanguage.value),
        ref_audio_path: referenceAudioPath.value,
        aux_ref_audio_paths: [],
        prompt_text: '',
        prompt_lang: getLanguageFromTable(referenceLanguage.value),
        top_k: 15,
        top_p: 1,
        temperature: 1.0,
        text_split_method: 'cut0',
        batch_size: 1,
        batch_threshold: 0.75,
        split_bucket: true,
        return_fragment: false,
        speed_factor: 1.0,
        steaming_mode: false,
        seed: -1,
        parallel_infer: true,
        repetition_penalty: 1.35
    }
    console.log(data);
    fetch(`${serverURL}/tts`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        } 
    }).then(response => {
        console.log(response);
        return response.blob(); // 后端返回的文件（Binary Large Object）
    }).then(data => {
        const url = URL.createObjectURL(data);
        console.log(url);
        resultAudio.value = url;
    }).catch(error => {
         console.error("生成音频失败，请重试", error);
    })
}

onMounted(() => {
    fetchModels();
    GPTModel.value = GPTModels.value[0];
    SoVITSModel.value = SoVITSModels.value[0];
})

</script>

<style scoped>
.text2speech {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    height: 75vh;
}
.reference {
    width: 30%;
    height: 100%;
    
}

.text {
    width: 40%;
    height: 100%;

}

.result {
    width: 30%;
    height: 100%;

}

.v-sheet {
    margin: 10px;
    padding: 10px;
}
</style>
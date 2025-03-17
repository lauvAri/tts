<template>
  <div class="pdf-viewer">
    <div class="left-view">
      <div v-for="page in pdf_pages_data">
        <img :src="page.image_data" 
          :key="page.current_page" 
          width="100%"
          class="pdf-page"
          @click="() => {
            console.log(page.current_page);
            imageData = page.image_data;
            currentPage = page.current_page;
          }">
        <p>{{ page.current_page }}</p>
      </div>
    </div>
    <div class="main">
      <div class="pdf">
        <h1>上传文档，制作有声课件</h1>
        <input type="file" 
          accept="application/pdf" 
          @change="handleFileUpload" 
          hidden
          ref="fileInput"/>
        <div id="pdf-info">
          <v-btn @click="triggerFileInput">选择文件</v-btn>
          <p v-if="imageData">{{ currentPage }}</p>
        </div>
        <div v-if="imageData">
          <img :src="imageData" alt="PDF Page" width="50%">
          <div class="controls">
            <v-btn @click="prevPage" :disabled="currentPage === 1">previous</v-btn>
            <v-btn @click="nextPage" >next</v-btn>
            <v-btn @click="getSummary">summary</v-btn>
          </div>
        </div>
        <div class="summary" v-if="summary">
          <v-textarea
              label="摘要"
              row-height="10"
              rows="5"
              variant="outlined"
              v-model="summary"
          ></v-textarea>
          <v-btn @click="getSummaryAudio">获取音频</v-btn>

          <v-dialog :max-width="200">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                text="选择数字人"
              ></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
              <div v-if="humanList" class="digital-human">
                <v-carousel show-arrows="hover"
                  style="padding: 26px;
                  background-color: #ecfccb;
                  border-radius: 10px;">
                  <v-carousel-item v-for="human in humanList">
                    <figure class="person">
                      <p style="font-weight: bold;
                        text-align: center;">{{ human.id }}</p>
                      <p style="font-weight: bold;
                        text-align:center;">{{ human.sceneName }}</p>
                      <p style="text-align: center; margin-top: 12px;">
                        <v-btn @click="() => {handlePersonChange(human.id, human.sceneName)}">use</v-btn>
                      </p>
                      <div style="margin-top:36px">
                        <img :src="human.coverUrl" alt="" width="240px"
                          style="border-radius: 10px;">
                      </div>
                      
                    </figure>
                  </v-carousel-item>
                </v-carousel>
            </div>
            </template>
          </v-dialog>

          <v-btn text="获取视频" @click="handleGetVideo"></v-btn>

          <div class="audio">
            <audio v-if="summaryAudio" :src="summaryAudio" controls></audio>
          </div>
          
        </div>
      </div>

      <div >
        <!-- <h2>数字人</h2>
        <div v-if="humanList" class="digital-human">
          <div>
            <div v-for="human in humanList" class="human">
              <figure className="person">
                <img :src="human.coverUrl" alt="" width="240px">
                <p>id: {{ human.id }}</p>
                <p>name: {{ human.sceneName }}</p>
                <v-btn @click="() => {handlePersonChange(human.id, human.sceneName)}">use</v-btn>
              </figure>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <div class="right-video">
      <video
        :src=videoUrl
        controls
        width="200px"></video>
    </div>
    
  </div>
</template>

<script setup>
import { ref , onMounted} from 'vue';
import { MD5 } from 'crypto-js';


const flaskURL = 'http://localhost:5000';

// 初始化状态
const pages = ref(0);
const currentPage = ref(1);
const pdfPath = ref("upload/pdf/test.pdf");
const imageData = ref(null);
const summary = ref('this is the summary');
const summaryAudio = ref(null);
const pdf_pages_data = ref([]);
const fileInput = ref(null);

//guiji pageList
const humanList = ref([]);
// chosen personid
const personid = ref(0);

//videoid
const videoid = ref(0);

// video url 
const videoUrl = ref('https://gy.cdn.guiji.cn/vpp/vpp/2025/03/16/1218414180902772736_ff_1.mp4');
// access tocken
const access_token = ref('');

function handlePersonChange(id, name) {
  personid.value = id;
  alert(`你选择了${name}`);
}

const triggerFileInput = () => {
  fileInput.value.click();
}

// 获取某一页pdf的图片
const fetchPdfPage = (pageNum) => {
  currentPage.value = pageNum;
  imageData.value = pdf_pages_data.value[pageNum - 1].image_data;
  console.log(`showing the ${pageNum}`);
}

// 获取所有页面的数据
const fetchPdfPages = () => {
  fetch(`${flaskURL}/api/get_pdf_pages?pdf_path=${pdfPath.value}`)
    .then(response => response.json())
    .then(data => {
      pdf_pages_data.value = data;
      imageData.value = pdf_pages_data.value[0].image_data;
      pages.value = data.length;
    })
    .catch((error) => {
      alert("获取pdf文件失败");
    })
}

// // 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  fetch(`${flaskURL}/api/upload_pdf`, {
    method: "POST",
    body: formData,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("文件上传失败")
    }
  }).then(data => {
    console.log(data);
    pdfPath.value = data.pdf_path;
    fetchPdfPages();
  })
};

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchPdfPage(currentPage.value);
  }
};

// 下一页
const nextPage = () => {
  if (currentPage.value < pages.value) {
    currentPage.value++;
    console.log("current page: ", currentPage.value);
    fetchPdfPage(currentPage.value);
  }
};

const getSummary = () => {
  fetch(`${flaskURL}/api/get_summary`, {
    method: "POST",
    body: JSON.stringify(
      {
        img_data: imageData.value
      }
    ),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error: could not fetch summary");
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      summary.value = data.summary;
    })
    .catch(error => {
      console.error("error fetching summary: ", error);
    })
}

const getSummaryAudio = () => {
  fetch(`${flaskURL}/api/summary2audio`, {
    method: "post",
    body: JSON.stringify({
      summary: summary.value
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    alert("生成音频文件失败")
    throw new Error("生成音频文件失败");
  }).then(data => {
    console.log(data);
    const url = data.url;
    summaryAudio.value = url;
  }).catch(error => {
    console.error("生成音频文件失败，请稍后重试", error);
  })
}

// 获取视频

function handleGetVideo() {
  const data = {
    "sceneId": personid.value,
    "audioUrl": summaryAudio.value,
  }
  fetch(`/api/openapi/video/v2/simpleCreate?access_token=${access_token.value}`, {
    method: 'post',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        alert("视频生成已开始");
        videoid.value = data.data.videoId;
        console.log("视频任务ID:", videoid.value);
        
        // 第二步：开始轮询查询状态
        const intervalId = setInterval(() => {
          fetch(`/api/openapi/video/v2/get/${videoid.value}?access_token=${access_token.value}`)
            .then(resp => resp.json())
            .then(data => {
              if (data.success && data.data.videoUrl) {
                // 成功获取视频URL
                clearInterval(intervalId); // 停止轮询
                alert("视频生成成功！");
                videoUrl.value = data.data.videoUrl;
                console.log("视频URL:", videoUrl.value);
              } else {
                console.log("视频正在生成中...");
              }
            })
            .catch(error => {
              console.error("查询视频状态失败:", error);
              clearInterval(intervalId); // 出错时停止轮询
              alert("视频生成失败，请重试");
            });
        }, 2000); // 每2秒查询一次
        
      } else {
        alert("视频任务创建失败");
        console.error("创建视频任务失败:", data);
      }
    })
    .catch((error) => {
      alert("视频生成出错");
      console.error("创建视频任务失败:", error);
    });
}

onMounted(() => {

  // 获取样本ppt
  fetchPdfPages();
  //
  const time = Date.now();
  const apiKey = import.meta.env.dh_key;
  const apiSecret = import.meta.env.dh_secret;
  const hash = MD5(apiKey+time+apiSecret).toString();
  
  console.log(hash);
  // 获取access_tocken
  fetch(`/api/openapi/oauth/token?grant_type=sign&timestamp=${time}&sign=${hash}&appId=OzxyZbbSXnLcc3Qk6g6LYtrA`)
    .then(response => response.json())
    .then(data => {
      access_token.value = data.data.access_token;
      console.log(access_token.value);

      const body = {
        page: 1,
        size: 5
      };
      const url = `api/openapi/robot/v2/fastPublicPageList?access_token=${access_token.value}`;
      // 获取数字人信息 
      fetch(url, {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), 
      })
        .then(resp => {
          return resp.json()})
        .then(data => {
          console.log(data);
          humanList.value = data.data.records;
          console.log(humanList.value);
        })
        .catch(error => {
          console.log("获取数字人资源出错", error);
        })
        }).catch((err)=>{
          console.error(err);
        })
  
})
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  gap: 10px;
}

.left-view {
  padding: 12px;
  width: 400px;
  height: 100%;
  overflow-y: auto;
  background-color: bisque;
  /* 隐藏滚动条（适用于 Webkit 浏览器：Chrome/Safari） */
  &::-webkit-scrollbar { 
    width: 0;
    height: 0;
  }
  /* 隐藏滚动条（适用于 Firefox） */
  scrollbar-width: none;
  /* 隐藏滚动条（适用于 IE/Edge） */
  -ms-overflow-style: none;
}

.pdf-page {
  border-radius: 12px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  transition: all ease-in-out .2s;
}

.pdf-page:hover {
  scale: 1.05;
}

.main {
  height: 100%;
  background-image: linear-gradient(#fefce8, #ecfccb, #bbf7d0);
  flex-grow: 1;
  display: flex;
}

.pdf {
  flex: 1;
}

.digital-human {
  height: 100%;
  width: fit-content;
  overflow: auto;
  /* 隐藏滚动条（适用于 Webkit 浏览器：Chrome/Safari） */
  &::-webkit-scrollbar { 
    width: 0;
    height: 0;
  }
  /* 隐藏滚动条（适用于 Firefox） */
  scrollbar-width: none;
  /* 隐藏滚动条（适用于 IE/Edge） */
  -ms-overflow-style: none;
}

.human {
  display: flex;
  gap: 10px;
}

.person {
  background-color: #f8fafc;
  /* margin: 12px; */
  padding: 12px;
  transition: all ease .5s;
}

.person:hover {
  scale: 1.05;
}

.placeholder {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}

.controls {
  margin-top: 20px;
}

div.summary {
  background: rgba(0, 0, 0, 0.05);
  margin: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 50%;
  transform: translateX(50%);
  /* 隐藏滚动条（适用于 Webkit 浏览器：Chrome/Safari） */
  &::-webkit-scrollbar { 
    width: 0;
    height: 0;
  }
}
</style>
<template>
  <div class="pdf-viewer">
    <h1>PDF Viewer and Summarizer</h1>
    <input type="file" accept="application/pdf" @change="handleFileUpload" />
    <div id="pdf-info">
      <v-btn v-on:click="fetchPdfPage(currentPage)">上传</v-btn>
      <p>{{currentPage}} / {{ pages }}</p>
    </div>
    <img v-if="imageData" :src="imageData" alt="PDF Page" width="50%">
    <div class="controls" v-if="imageData">
      <v-btn @click="prevPage" :disabled="currentPage === 1">previous</v-btn>
      <v-btn @click="nextPage" :disabled="currentPage === pages">next</v-btn>
      <v-btn @click="getSummary">summary</v-btn>
    </div>
    <div class="summary">
      <p>{{ summary }}</p>
      <v-btn>播放</v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import '@tato30/vue-pdf/style.css';
import { VPdfViewer } from '@vue-pdf-viewer/viewer'

const flaskURL = 'http://localhost:5000';

// 初始化状态
const pages = ref(0);
const currentPage = ref(1);
const pdfPath = ref("upload/pdf/test.pdf");
const imageData = ref(null);
const summary = ref(null);

// 获取某一页pdf的图片
const fetchPdfPage = (pageNum) => {
  fetch(`${flaskURL}/api/get_pdf_page?pdf_path=${pdfPath.value}&page_num=${currentPage.value}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Could not fetch pdf page");
        }
        return response.json();
      })
      .then(data => {
        pages.value = data.total_pages;
        currentPage.value = data.current_page;
        imageData.value = data.image_data;
        console.log(imageData);
      })
      .catch(error => {
        console.error("error fetching pdf page: ",error);
      })
}

// 处理文件上传
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
    fetchPdfPage(1);
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
  // fetch(`${flaskURL}/api/get_summary?pdf_path=${pdfPath.value}&page_num=${currentPage.value}`)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error("Error: could not fetch summary");
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       console.log("summary data: ", data);

  //     })
}
</script>

<style scoped>
.pdf-viewer {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
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
}
</style>
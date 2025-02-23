<template>
  <div class="pdf-viewer">
    <h1>PDF Viewer and Summarizer</h1>
<!--    &lt;!&ndash; 文件上传 &ndash;&gt;-->
<!--    <input type="file" accept="application/pdf" @change="handleFileUpload" />-->
<!--    <VuePDF-->
<!--      v-if="pdf"-->
<!--      :pdf="pdf"-->
<!--      text-layer-->
<!--      annotation-layer-->
<!--      :page="currentPage"-->
<!--    />-->
<!--    <div v-else class="placeholder">请上传一个 PDF 文件以查看内容。</div>-->

<!--    <div class="controls" v-if="pdf">-->
<!--      <v-btn @click="prevPage" :disabled="currentPage === 1">上一页</v-btn>-->
<!--      <span> {{ currentPage }} / {{ pages }} </span>-->
<!--      <v-btn @click="nextPage" :disabled="currentPage === pages">下一页</v-btn>-->
<!--    </div>-->
    <input type="file" accept="application/pdf" @change="handleFileUpload" />
    <div id="pdf-info">
      <v-btn v-on:click="fetchPdfPage(currentPage)">click me</v-btn>
      <p>{{pdfPath}}</p>
      <p>Total Pages: {{pages}}</p>
      <p>Current Page: {{currentPage}}</p>
    </div>
    <img v-if="imageData" :src="imageData" alt="PDF Page">
    <div class="controls" v-if="imageData">
      <v-btn @click="prevPage" :disabled="currentPage === 1">previous</v-btn>
      <v-btn @click="nextPage" :disabled="currentPage === pages">next</v-btn>
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
const pdf = ref(null);
const pages = ref(0);
const currentPage = ref(1);
const pdfPath = ref("upload/pdf/test.pdf");
const imageData = ref(null);

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

// // 动态加载 PDF
// const loadPDF = async (fileURL) => {
//   const { pdf: loadedPDF, pages: totalPages } = usePDF(fileURL, {
//     onError: (error) => {
//       console.error("Failed to load PDF:", error);
//     }
//   }); // 使用 usePDF 加载 PDF
//   pdf.value = loadedPDF;
//   pages.value = totalPages;
//   currentPage.value = 1; // 重置当前页码
// };
//
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
</style>
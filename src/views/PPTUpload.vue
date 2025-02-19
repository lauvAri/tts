<!-- <template>
<h2>PPT上传</h2>
<input type="file" @change="onFileChange" accept=".pdf">
<button @click="uploadFile">Upload</button>

<div v-if="pdfUrl">
    <h3>Preview PDF</h3> -->
    <!-- 使用 <embed> 标签预览 -->
    <!-- <embed :src="pdfUrl" type="application/pdf" width="100%" height="" />
</div>
</template> -->

<!-- <script>
import axios from 'axios';

export default {
    name: 'PPTUpload',
    data() {
        return {
            pdfUrl: null,
            selectedFile: null,
        }
    },
    methods: {
        onFileChange(event) {
            this.selectedFile = event.target.files[0];
        }
        ,
        async uploadFile() {
            if (!this.selectedFile) {
                alert('请选择一个文件');
                return;
            }

            const formData = new FormData();
            formData.append('file', this.selectedFile);

            try {
                const response = await axios.post('http://localhost:5000/api/upload_pdf', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                this.pdfUrl = response.data.file_url;
            } catch (error) {
                console.error("Error uploading file:", error);
            }

        }
    }
}
</script> -->

<template>
  <h2>PPT上传</h2>
  <input type="file" @change="onFileChange" accept=".pdf">
  <button @click="uploadFile">Upload</button>

  <div v-if="pdfPages.length" class="pdf-container">
    <div v-for="(page, index) in pdfPages" :key="index">
      <canvas :id="'pdf-page-' + (index + 1)"></canvas>
      <button @click="playPage(index)">播放</button>
    </div>
  </div>
</template>

<style>
div.pdf-container {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    overflow: auto;
}
</style>

<script>
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';

export default {
  name: 'PPTUpload',
  data() {
    return {
      pdfPages: [],
      selectedFile: null,
    }
  },
  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadFile() {
      if (!this.selectedFile) {
        alert('请选择一个文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await axios.post('http://localhost:5000/api/upload_pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
          console.log("response data: ",response.data);
        await this.renderPDF(response.data.file_url);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    },
    async renderPDF(url) {
      this.pdfPages = [];
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num);
          this.pdfPages.push(page);
          this.$nextTick(() => {
            this.renderPage(page, num);
        })
        
      }
    },
    renderPage(page, pageNumber) {
      const viewport = page.getViewport({ scale: 0.3});
      const canvas = document.getElementById(`pdf-page-${pageNumber}`);
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);
    },
    playPage(index) {
      // 在这里添加播放逻辑
      console.log(`播放第 ${index + 1} 页`);
    }
    },
    mounted() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
    },
}
</script>
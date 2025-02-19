<!-- src/views/AudioLectures.vue -->
<template>
  <div>
    <input type="file" @change="handleFileUpload" accept=".pptx, .ppt"/>
    <div v-if="slides.length > 0">
      <div v-for="(slide, index) in slides" :key="index">
        <h3>Slide {{ index }}</h3>
        <div v-html="slide.content"></div>
        <p>{{ slide.summary }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Pptxgenjs from 'pptxgenjs';

export default {
  name: 'AudioLectures',
  data() {
    return {
      slides:[],
    }
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axios.post('http://localhost:5000/api/upload-slides', formData, {
            headers: {
              'Content-Type': 'mulipart/form-data'
            },
          });
          this.slides = response.data.slides;
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    },
  }
}
</script>
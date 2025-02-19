// src/router/index.js
// 进行路由配置
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TextToSpeech from '../views/TextToSpeech.vue'
import VideoSubtitles from '../views/VideoSubtitles.vue'
import AudioLectures from '../views/AudioLectures.vue'
import VoiceCloning from '../views/VoiceCloning.vue'
import PPTUpload from '@/views/PPTUpload.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/text-to-speech',
    name: 'TextToSpeech',
    component: TextToSpeech
  },
  {
    path: '/video-subtitles',
    name: 'VideoSubtitles',
    component: VideoSubtitles
  },
  {
    path: '/audio-lectures',
    name: 'AudioLectures',
    component: AudioLectures
  },
  {
    path: '/voice-cloning',
    name: 'VoiceCloning',
    component: VoiceCloning
  },
  {
    path: '/ppt-upload',
    name: 'PPTUpload',
    component: PPTUpload
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
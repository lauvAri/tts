<template>
    
</template>

<style scoped>
div.result-display {
    width: 70%;
    background-color: #fff;
    padding: 20px;
    margin: 0 auto;
    margin-top: 15vh;
}
div.main {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    gap: 20px;
}

div.record-result {
    background-color: red;
}

div.clone-result {
    background-color: green;
}
</style>

<script>
export default {
    props: {
        audioBlob: {
            type: Blob,
            required: false,
        },
    },
    computed: {
        /**
         * 创建并返回音频文件的URL
         * 此方法用于将音频Blob对象转换为URL，以便在音频元素中使用
         * 通过createObjectURL方法，可以生成一个指向Blob对象的URL，使得音频可以被播放
         * 
         * @returns {string} 音频文件的URL
         */
        audioUrl() { 
            return URL.createObjectURL(this.audioBlob);
        },
    },
    methods: {

    }
}
</script>
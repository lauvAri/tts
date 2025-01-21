<template>
    <nav id="navbar">
        <div class="logo">
            <img src="../assets/logo.svg" alt="">
        </div>
        <div class="links">
            <ul>
                <router-link to="/text-to-speech">
                    <li>文本转语音</li>
                </router-link>
                <router-link to="/video-subtitles">
                    <li>视频字幕</li>
                </router-link>
                <router-link to="/audio-lectures">
                    <li>有声课件</li>
                </router-link>
                <router-link to="/voice-cloning">
                    <li>声音克隆</li>
                </router-link>
            </ul>
        </div>
        <div class="avatar"></div>
    </nav>
</template>

<style scoped>
#navbar {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 8vh;
    background:#1e293b;
}

li {
    display: inline-block;
    padding: 0 10px;
    color: #fff;
    font-weight: bolder;
    transition:all ease 0.3s;
}

li:hover {
    background: linear-gradient(125deg, var(--crimson-9), var(--amber-10));
    /*设置渐变的方向从左到右*/
    background-clip: text;
    /*将设置的背景颜色限制在文字中*/
    -webkit-text-fill-color: transparent;
    /*给文字设置成透明*/
}
</style>

<script>
export default {
    name: 'Navigation'
}
</script>
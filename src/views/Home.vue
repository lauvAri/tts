<template>
    <div>
        <h1>Home</h1>
        <button id="btn" @click="handleClick">click me</button>
    </div>
    
</template>

<script>
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

export default {
    name: 'Home',
    methods: {
        async handleClick() { 
            fetch('/config', {
                credentials: 'include'
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
            
        }

    }
}
</script>
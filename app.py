from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS, cross_origin
import os
from gtts import gTTS # 导入语音库
import hashlib
import uuid
from translate import Translator  # 导入翻译库

app = Flask(__name__)
CORS(app)  # 为整个应用启用CORS

# 配置保存音频文件的目录
AUDIO_FILES_DIR = "audio_files"
if not os.path.exists(AUDIO_FILES_DIR):
    os.makedirs(AUDIO_FILES_DIR)

def generate_audio_file_name(text):
    """根据文本生成唯一的文件名"""
    hash_object = hashlib.md5(text.encode())
    return f"{hash_object.hexdigest()}.mp3"

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    data = request.json
    text = data.get('text')
    source_lang = data.get('source_lang', 'zh')  # 获取源语言，默认为中文
    target_lang = data.get('target_lang', 'en')  # 获取目标语言，默认为英文

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 生成唯一的文件名
    audio_file_name = generate_audio_file_name(text)
    audio_file_path = os.path.join(AUDIO_FILES_DIR, audio_file_name)

    try:
        # 使用gTTS生成音频
        tts = gTTS(text=text, lang=target_lang)  # 使用目标语言生成音频
        tts.save(audio_file_path)

        # 确认文件创建成功
        if not os.path.isfile(audio_file_path):
            raise FileNotFoundError(f"Failed to create audio file at {audio_file_path}")

        # 发送文件给客户端
        with open(audio_file_path, 'rb') as audio_file:
            audio_data = audio_file.read()

        response = make_response(audio_data)
        response.headers.set('Content-Type', 'audio/mpeg')
        response.headers.set('Content-Disposition', 'attachment', filename=audio_file_name)
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 翻译接口
@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text')
    source_lang = data.get('source_lang', 'zh')  # 获取源语言，默认为中文
    target_lang = data.get('target_lang', 'en')  # 获取目标语言，默认为英文

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        translator = Translator(target_lang, source_lang)
        translated = translator.translate(text)
        return jsonify({"translatedText": translated})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
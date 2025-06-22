from flask import Flask, request, jsonify
from textblob import TextBlob
from langdetect import detect
import re
from collections import Counter

app = Flask(__name__)

MAX_REVIEW_LENGTH = 1000  # Giới hạn độ dài review tối đa

def analyze_review(text):
    # Cắt bớt review nếu quá dài
    if len(text) > MAX_REVIEW_LENGTH:
        text = text[:MAX_REVIEW_LENGTH]

    text_cleaned = text.strip().lower()
    
    # 1. Ngôn ngữ
    try:
        language = detect(text)
    except:
        language = "unknown"

    # 2. Phân tích cảm xúc
    blob = TextBlob(text_cleaned)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    if polarity > 0.2:
        sentiment_label = "positive"
    elif polarity < -0.2:
        sentiment_label = "negative"
    else:
        sentiment_label = "neutral"

    # 3. Thống kê độ dài
    char_count = len(text_cleaned)
    word_count = len(re.findall(r'\w+', text_cleaned))
    sentence_count = len(blob.sentences)

    # 4. Từ lặp
    words = re.findall(r'\w+', text_cleaned)
    word_freq = Counter(words)
    repeated_words = {w: c for w, c in word_freq.items() if c >= 3}

    # 5. Heuristics phát hiện nghi vấn
    suspicious = False
    reasons = []
    suspicion_score = 0

    # Dưới 5 từ
    if word_count < 5:
        reasons.append("Đánh giá quá ngắn")
        suspicion_score += 2

    # Câu quen thuộc
    generic_phrases = ['rất tốt', 'tuyệt vời', 'ok', 'hài lòng', 'sản phẩm tốt',
                       'very good', 'excellent', 'ok', 'satisfied', 'good product']
    for phrase in generic_phrases:
        if phrase in text_cleaned:
            reasons.append(f"Từ ngữ chung chung: '{phrase}'")
            suspicion_score += 1

    # Cảm xúc quá cực đoan
    if abs(polarity) > 0.9:
        reasons.append("Cảm xúc quá mạnh")
        suspicion_score += 2

    # Nhiều từ lặp lại
    if repeated_words:
        reasons.append("Từ bị lặp lại bất thường")
        suspicion_score += 2

    # Ngôn ngữ không phải tiếng Việt hoặc tiếng Anh
    if language not in ['vi', 'en']:
        reasons.append(f"Ngôn ngữ không hỗ trợ hoặc không phải tiếng Việt/Anh: '{language}'")
        suspicion_score += 3

    if suspicion_score >= 3:
        suspicious = True

    # Gợi ý phản hồi
    suggested_reply = None
    if sentiment_label == "positive" and not suspicious:
        suggested_reply = "Cảm ơn bạn đã đánh giá tích cực. Mong bạn tiếp tục ủng hộ!"

    return {
        "language": language,
        "suspicious": suspicious,
        "suspicion_score": suspicion_score,
        "reasons": reasons if suspicious else ["Không có dấu hiệu nghi ngờ"],
        "sentiment": {
            "polarity": polarity,
            "subjectivity": subjectivity,
            "label": sentiment_label
        },
        "length_analysis": {
            "char_count": char_count,
            "word_count": word_count,
            "sentence_count": sentence_count
        },
        "repeated_words": repeated_words,
        "suggested_reply": suggested_reply
    }

@app.route("/check-review", methods=["POST"])
def check_review():
    data = request.get_json()
    if not data or "review" not in data or not isinstance(data["review"], str):
        return jsonify({
            "status": "error",
            "message": "Missing or invalid 'review' field"
        }), 400

    review_text = data["review"]
    result = analyze_review(review_text)
    return jsonify({
        "status": "success",
        "data": result
    })

def analyze_question(text):
    MAX_QUESTION_LENGTH = 500
    if len(text) > MAX_QUESTION_LENGTH:
        text = text[:MAX_QUESTION_LENGTH]

    text_cleaned = text.strip().lower()

    try:
        language = detect(text)
    except:
        language = "unknown"

    blob = TextBlob(text_cleaned)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    word_count = len(re.findall(r'\w+', text_cleaned))
    sentence_count = len(blob.sentences)
    char_count = len(text_cleaned)

    words = re.findall(r'\w+', text_cleaned)
    word_freq = Counter(words)
    repeated_words = {w: c for w, c in word_freq.items() if c >= 3}

    suspicious = False
    reasons = []
    suspicion_score = 0

    # Câu quá ngắn
    if word_count < 4:
        reasons.append("Câu hỏi quá ngắn")
        suspicion_score += 2

    # Cụm từ spam phổ biến
    spam_phrases = ['mua ngay', 'click vào', 'giảm giá', '100%', 'free', 'liên hệ']
    for phrase in spam_phrases:
        if phrase in text_cleaned:
            reasons.append(f"Từ nghi vấn spam: '{phrase}'")
            suspicion_score += 2

    # Cảm xúc cực đoan
    if abs(polarity) > 0.8:
        reasons.append("Cảm xúc quá mạnh trong câu hỏi")
        suspicion_score += 2

    # Lặp từ
    if repeated_words:
        reasons.append("Từ bị lặp lại bất thường")
        suspicion_score += 2

    # Liên kết URL hoặc email
    if re.search(r'(http[s]?://|www\.)', text_cleaned):
        reasons.append("Chứa liên kết đáng ngờ (URL)")
        suspicion_score += 3

    if re.search(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', text_cleaned):
        reasons.append("Chứa địa chỉ email — dấu hiệu spam")
        suspicion_score += 3

    # Emoji
    if re.search(r'[\U0001F600-\U0001F64F]', text):
        reasons.append("Chứa emoji — có thể là spam")
        suspicion_score += 1

    # Chữ in hoa nhiều
    if sum(1 for c in text if c.isupper()) > len(text) * 0.5:
        reasons.append("Quá nhiều chữ in hoa")
        suspicion_score += 1

    # Ngôn ngữ không hỗ trợ
    if language not in ['vi', 'en']:
        reasons.append(f"Ngôn ngữ không hỗ trợ hoặc không phải tiếng Việt/Anh: '{language}'")
        suspicion_score += 3

    if suspicion_score >= 3:
        suspicious = True

    suggested_action = None
    if suspicious:
        suggested_action = "Xem xét thủ công hoặc tạm ẩn câu hỏi"

    return {
        "language": language,
        "suspicious": suspicious,
        "suspicion_score": suspicion_score,
        "reasons": reasons if suspicious else ["Không có dấu hiệu nghi ngờ"],
        "sentiment": {
            "polarity": polarity,
            "subjectivity": subjectivity,
            "label": (
                "positive" if polarity > 0.2 else
                "negative" if polarity < -0.2 else "neutral"
            )
        },
        "length_analysis": {
            "char_count": char_count,
            "word_count": word_count,
            "sentence_count": sentence_count
        },
        "repeated_words": repeated_words,
        "suggested_action": suggested_action
    }

@app.route("/check-question", methods=["POST"])
def check_question():
    data = request.get_json()
    if not data or "question" not in data or not isinstance(data["question"], str):
        return jsonify({
            "status": "error",
            "message": "Missing or invalid 'question' field"
        }), 400

    question_text = data["question"]
    result = analyze_question(question_text)
    return jsonify({
        "status": "success",
        "data": result
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

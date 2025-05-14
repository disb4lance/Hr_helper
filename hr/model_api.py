from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import traceback

app = Flask(__name__)
CORS(app)

# Загрузка модели и векторизатора
model = joblib.load("model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")


# Основная логика предсказания
def smart_predict(skills_text, top1_threshold=0.3, min_prob_threshold=0.027):
    X_vec = vectorizer.transform([skills_text])
    proba = model.predict_proba(X_vec)[0]
    classes = model.classes_
    top_indices = proba.argsort()[::-1]
    top1_prob = proba[top_indices[0]]

    if top1_prob >= top1_threshold:
        result = [(classes[top_indices[0]], round(top1_prob * 100, 2))]
    else:
        result = []
        for idx in top_indices:
            if proba[idx] >= min_prob_threshold:
                result.append((classes[idx], round(proba[idx] * 100, 2)))

    if not result:
        result.append((classes[top_indices[0]], round(proba[top_indices[0]] * 100, 2)))
        result.append((classes[top_indices[1]], round(proba[top_indices[1]] * 100, 2)))
        result.append((classes[top_indices[2]], round(proba[top_indices[2]] * 100, 2)))

    return result


# Эндпоинт API
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        skills_text = data.get("text", "")
        if not skills_text:
            return jsonify({"error": "Missing 'text' field in request."}), 400

        prediction = smart_predict(skills_text)
        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


# Запуск
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

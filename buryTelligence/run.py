import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
folder_path = "botScrape/"
json_files = [file for file in os.listdir(folder_path) if file.endswith('.json')]
#sort -> assume later dataset contains the new info
json_files.sort(reverse = True)
print(json_files)

# Load the JSON data
post_texts = []
response_texts = []
thread_ids = []
board_ids = []

for file in json_files:
  print(file)
  with open(folder_path + file, 'r') as json_file:
      data = json.load(json_file)

  for thread in data['data']:
      if(thread['threadId'] in thread_ids):
          print("duplicate")
          continue
      for post in thread["post"]:
          post_texts.append(post['postText'])
          response_texts.append(post['responseText'])
          thread_ids.append(thread['threadId'])  # Assuming all posts in a thread share the same threadId
          board_ids.append(thread['boardId'])    # Assuming all posts in a thread share the same boardId
# Create a DataFrame
df = pd.DataFrame({'threadId': thread_ids, 'boardId': board_ids, 'postText': post_texts, 'responseText': response_texts})

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(df['postText'])

# Function to get the most similar response to user input
def get_most_similar_response(user_input):
    user_tfidf = vectorizer.transform([user_input])
    similarity_scores = cosine_similarity(user_tfidf, tfidf_matrix)
    most_similar_index = similarity_scores.argmax()

    return df['responseText'].iloc[most_similar_index]

# Simulate a chat session
print("Chatbot: Hi! How can I help you today?")
while True:
    user_input = input("You: ")
    if user_input.lower() == 'exit':
        print("Chatbot: Goodbye!")
        break
    bot_response = get_most_similar_response(user_input)
    print(f"Chatbot: {bot_response}")
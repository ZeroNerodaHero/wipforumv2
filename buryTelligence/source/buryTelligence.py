import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class buryTelligence():
    def __init__(self,folder_path,json_files,debug=False):
        if(debug == True): print("Initializing")

        post_texts = []
        response_texts = []
        thread_ids = []
        board_ids = []
        for file in json_files:
            if(debug == True): print("\tReading File..."+file)

            with open(folder_path + file, 'r') as json_file:
                data = json.load(json_file)

            for thread in data['data']:
                if(thread['threadId'] in thread_ids):
                    #if(debug == True): print("\tDuplicate Thread Id..."+thread["threadId"])
                    continue
                for post in thread["post"]:
                    post_texts.append(post['postText'])
                    response_texts.append(post['responseText'])
                    thread_ids.append(thread['threadId'])  # Assuming all posts in a thread share the same threadId
                    board_ids.append(thread['boardId'])    # Assuming all posts in a thread share the same boardId
        # Create a DataFrame
        self.df = pd.DataFrame({'threadId': thread_ids, 'boardId': board_ids, 'postText': post_texts, 'responseText': response_texts})

        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['postText'])

    def get_most_similar_response(self,user_input):
        user_tfidf = self.vectorizer.transform([user_input])
        similarity_scores = cosine_similarity(user_tfidf, self.tfidf_matrix)
        most_similar_index = similarity_scores.argmax()

        return self.df['responseText'].iloc[most_similar_index]

    def debugSimulate(self):
        print("Chatbot: Hi! How can I help you today?")
        while True:
            user_input = input("You: ")
            if user_input.lower() == 'exit':
                print("Chatbot: Goodbye!")
                break
            bot_response = self.get_most_similar_response(user_input)
            print(f"Chatbot: {bot_response}")
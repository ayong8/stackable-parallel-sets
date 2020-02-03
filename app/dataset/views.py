from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np

# userid,tweet,relationship,iq,gender,age,political,optimism,children,religion,race,income,education,life_satisfaction
dataset_features = {
    'demoemo': [
        { 
            'name': 'gender', 
            'type': 'categorical',
            'instances': []
        },
        { 
            'name': 'age', 
            'type': 'continuous',
            'instances': []
        },
        { 
            'name': 'education', 
            'type': 'categorical',
            'instances': []
        },
        { 
            'name': 'life_satisfaction', 
            'type': 'categorical',
            'instances': []
        }
    ],
    'cancer': [
        { 
            'name': 'Air Pollution', 
            'type': 'continuous',
            'instances': []
        },
        { 
            'name': 'Occupational Hazards', 
            'type': 'continuous',
            'instances': []
        },
        { 
            'name': 'Chest Pain', 
            'type': 'categorical',
            'instances': []
        },
        { 
            'name': 'Shortness of Breath', 
            'type': 'categorical',
            'instances': []
        },
        { 
            'name': 'Level', 
            'type': 'categorical',
            'instances': []
        },
    ]
}

class LoadData(APIView):
    def get(self, request, format=None):
        dataset_abbr = 'demoemo'
        file_name = './app/static/data/' + dataset_abbr + '_simple' + '.csv'
        df_dataset = pd.read_csv(file_name)

        # tweet_objects = models.Tweet.objects.all()
        # # serializer return string, so convert it to list with eval()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects))

        # tweets_json = []
        # for tweet in tweet_objects_json:
        #     tweet_json = tweet['fields']
        #     tweet_json.update({ 'tweet_id': tweet['pk'] })
        #     tweets_json.append(tweet_json)

        for feature_obj in dataset_features[dataset_abbr]:
            feature_obj['instances'] = list(df_dataset[feature_obj['name']])


        return Response({ 
            'dataset': df_dataset.to_json(orient='records'),
            'features': dataset_features[dataset_abbr]
        })
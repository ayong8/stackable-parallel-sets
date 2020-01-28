from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np

class LoadData(APIView):
    def get(self, request, format=None):
        file_name = './app/static/data/' + 'demoemo' + '.csv'
        df_dataset = pd.read_csv(file_name)

        # tweet_objects = models.Tweet.objects.all()
        # # serializer return string, so convert it to list with eval()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects))

        # tweets_json = []
        # for tweet in tweet_objects_json:
        #     tweet_json = tweet['fields']
        #     tweet_json.update({ 'tweet_id': tweet['pk'] })
        #     tweets_json.append(tweet_json)

        return Response(df_dataset.loc[0:100].to_json(orient='records'))
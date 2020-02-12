from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
import json
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cluster import AgglomerativeClustering

# import ..static.lib.clustering.divisive_clustering as cl
# from ..static.lib.clustering.load_dist_matrix import read_data, load_dist_matrix

# userid,tweet,relationship,iq,gender,age,political,optimism,children,religion,race,income,education,life_satisfaction
dataset_features = {
    'demoemo': [
        { 
            'name': 'gender', 
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'age', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'education', 
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'life_satisfaction', 
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        }
    ],
    'cancer': [
        { 
            'name': 'Air Pollution', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Occupational Hazards', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Chest Pain', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Fatigue', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Dry Cough', 
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
    ]
}

# For per-feature clustering (when a feature is continuous)
# For per-level clustering (to generate clusters onto multiple features within a level)
# parameter - data (numpy array - (n_instances x n_features))

n_cls = 4

def hClustering(X):
    # dist_mat = euclidean_distances(data)
    # dhcl_model = cl.DivisiveClustering(dist_mat)
    # dhcl.fit()
    #dist_mat = euclidean_distances(X, X)
    cl_fit = AgglomerativeClustering(n_clusters=n_cls, affinity='euclidean').fit(X)

    return cl_fit.labels_, cl_fit.n_clusters_

class LoadData(APIView):
    def get(self, request, format=None):
        dataset_abbr = 'cancer'
        file_name = './app/static/data/' + dataset_abbr + '.csv'
        df_dataset = pd.read_csv(file_name)
        selected_dataset_features = dataset_features[dataset_abbr]

        # tweet_objects = models.Tweet.objects.all()
        # # serializer return string, so convert it to list with eval()
        # tweet_objects_json = eval(serializers.serialize('json', tweet_objects))

        # tweets_json = []
        # for tweet in tweet_objects_json:
        #     tweet_json = tweet['≈fields']
        #     tweet_json.update({ 'tweet_id': tweet['pk'] })
        #     tweets_json.append(tweet_json)

        df_instances = pd.DataFrame()
        for feature_obj in selected_dataset_features:
            feature_name = feature_obj['name']
            feature_type = feature_obj['type']
            feature_instances = list(df_dataset[feature_name])
            if feature_type == 'continuous':
                # instances_np = np.array(list(zip(range(len(feature_instances)), instances_for_cont)))
                feature_instances, _ = hClustering(np.array(feature_instances).reshape(-1,1)) # Do clustering, and output the cluster labels
                print('feature - clustering done: ', feature_name)
                feature_obj['instances'] = feature_instances
                feature_obj['domain'] = list(range(n_cls))

            df_instances[feature_name] = feature_instances

        return Response({ 
            'dataset': df_dataset.to_json(orient='records'),
            'features': selected_dataset_features,
            'instances': df_instances.to_json(orient='records')
        })

class HClustering(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        hClustering(json_request['data'])

'''
lv_data = [
    { 
        id: 1, 
        name: 'demographic',
        features: [],
        cls: [
            {
              id: 1,
              instances:
            }
        ] // to fill it in
    },
];
'''
class HClusteringForAllLVs(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        lv_data = json_request['data']

        # Clustering for levels
        lv_cl_list_dict = {}
        for idx, lv in enumerate(lv_data):
            df_instances_for_lv = pd.DataFrame({ feature['name']:feature['instances'] for feature in lv['features'] })

            cl_labels_np, n_cls = hClustering(df_instances_for_lv.values)
            # print('cl_labels: ', cl_labels_np)
            # Organize the cluster information to export
            cl_list = []
            for cl_idx in range(n_cls):
                instances_idx_for_cl = np.where(cl_labels_np == cl_idx)
                instances_for_cl = df_instances_for_lv.loc[instances_idx_for_cl]
                cl_list.append(instances_for_cl.values)
            lv_cl_list_dict[idx] = cl_list

        return Response({
            'LVData': lv_data,
            'clResult': lv_cl_list_dict
        })
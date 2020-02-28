from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
import networkx as nx
import scipy
import json, itertools

from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cluster import AgglomerativeClustering
from pyclustering.cluster.kmedoids import kmedoids
from pyclustering.utils import calculate_distance_matrix

import static.lib.edge_filtering as out

# import ..static.lib.clustering.divisive_clustering as cl
# from ..static.lib.clustering.load_dist_matrix import read_data, load_dist_matrix

# userid,tweet,relationship,iq,gender,age,political,optimism,children,religion,race,income,education,life_satisfaction
dataset_features = {
    'demoemo': [
        { 
            'name': 'gender', 
            'id': 'gender',
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'age', 
            'id': 'age',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'education', 
            'id': 'education',
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'life_satisfaction', 
            'id': 'life_satisfaction',
            'type': 'categorical',
            'scale': '',
            'domain': [],
            'instances': []
        }
    ],
    'cancer': [
        { 
            'name': 'Air Pollution', 
            'id': 'air_pollution',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Occupational Hazards', 
            'id': 'occupational_hazards',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Smoking', 
            'id': 'smoking',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Gender', 
            'id': 'gender',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1],
            'labels': ['Male', 'Female'],
            'instances': []
        },
        { 
            'name': 'Chest Pain', 
            'id': 'chest_pain',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Fatigue', 
            'id': 'fatigue',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Dry Cough', 
            'id': 'dry_cough',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Level', 
            'id': 'level',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2],
            'labels': ['Low', 'Medium', 'High'],
            'instances': []
        },
    ]
}

# For per-feature clustering (when a feature is continuous)
# For per-level clustering (to generate clusters onto multiple features within a level)
# parameter - data (numpy array - (n_instances x n_features))

n_cls = 4

def convert_to_numbers(domain_in_str, feature_values_in_str):
    str_num_dict = { string:num for string, num in list(zip(domain_in_str, range(len(domain_in_str)))) }
    feature_values_in_num = []
    for idx, string in enumerate(feature_values_in_str):
        feature_values_in_num.append(str_num_dict[string])

    return feature_values_in_num

def convert_feature_values_to_instances(feature_values):
    instances = []
    for idx, feature_value in enumerate(feature_values):
        instances.append({ 'idx': idx, 'value': feature_value })

    return instances

def reassign_cluster_label_by_order(categorized_values, feature_values):
    num_instances = len(feature_values)
    idx = range(num_instances)

    value_pairs = list(zip(feature_values, categorized_values, idx))
    sorted_value_pairs = sorted(value_pairs, key=lambda e: e[0])
    groups = itertools.groupby(sorted_value_pairs, key=lambda e: e[1])

    sorted_categorized_values = [None] * num_instances
    sorted_idx = 0
    for g_idx, g in groups:
        group = list(g)
        for el in group:
            sorted_categorized_values[el[2]] = sorted_idx
        sorted_idx += 1

    return sorted_categorized_values, feature_values

def convert_instances_to_instance_sets(category_domain, instances):
    instance_sets = [[] for _ in category_domain]
    for instance in instances:
        instance_sets[category_domain.index(instance['value'])].append(instance)

    return instance_sets

def hClustering(X):
    # dist_mat = euclidean_distances(data)
    # dhcl_model = cl.DivisiveClustering(dist_mat)
    # dhcl.fit()
    #dist_mat = euclidean_distances(X, X)
    cl_fit = AgglomerativeClustering(n_clusters=n_cls, affinity='euclidean').fit(X)

    return cl_fit.labels_, cl_fit.n_clusters_

# Input: Dataset itself
def kmdeoidsClustering(X, k):
    initial_medoids_idx = [1, 100, 130, 170] # random.sample(range(len(X)), 4)
    dist_mat = calculate_distance_matrix(X)
    kmedoids_instance = kmedoids(dist_mat, initial_medoids_idx, data_type='distance_matrix')
    kmedoids_instance.process()
    
    # Store clusters and prototypes
    cls_idx_list = kmedoids_instance.get_clusters() # [[1,3,100], [2,56,90], ...]
    protos_idx_list = kmedoids_instance.get_medoids()

    return cls_idx_list, protos_idx_list

def calculate_freq_mat(C1, C2):
    num_cls1 = len(C1)
    num_cls2 = len(C2)
    freq_mat_np = np.array([[0]*num_cls1]*num_cls2)
    for cl1_idx, c1 in enumerate(C1):
        for cl2_idx, c2 in enumerate(C2):
            c1_idx_list = [ cl_instance['idx'] for cl_instance in c1 ]
            c2_idx_list = [ cl_instance['idx'] for cl_instance in c2 ]
            overlapped_instances = list(set(c1_idx_list) & set(c2_idx_list))
            freq_mat_np[cl2_idx, cl1_idx] = len(overlapped_instances)
            
    return freq_mat_np

def calculate_G(freq_mat_np):
    num_cls1, num_cls2 = freq_mat_np.shape
    weighted_adj_mat = np.vstack([
        np.hstack([ np.zeros([num_cls1, num_cls1]), freq_mat_np ]),
        np.hstack([ np.transpose(freq_mat_np), np.zeros([num_cls2, num_cls2])])
    ])
    G = nx.from_numpy_matrix(weighted_adj_mat)

    return G

def sort_nodes(G, num_cls1, num_cls2):
    L = nx.laplacian_matrix(G).toarray()
    w, v = np.linalg.eig(L)
    sorted_w = sorted(w)
    idx_second_smallest_eigen_val = np.where(w == sorted_w[1])
    second_smallest_eigen_v = v[:,idx_second_smallest_eigen_val].squeeze()

    # Half is for c1, the other half is for c2
    ev_for_cl1 = second_smallest_eigen_v[:num_cls1]
    ev_for_cl2 = second_smallest_eigen_v[num_cls1:num_cls1+num_cls2]

    cl1_idx_after_sorting = np.argsort(ev_for_cl1)
    cl2_idx_after_sorting = np.argsort(ev_for_cl2)

    return cl1_idx_after_sorting, cl2_idx_after_sorting

# Detecting the outlier edges
# Input: networkx graph G given a weighted adjacency matrix
# Output: filtered networkx graph filtered_G
def detect_outlier_edges(G, n_cls1, n_cls2):
    cut = 0.3
    standardized_cut = -0.3
    # Return the significant score with full graph
    G = out.disparity_filter(G)
    # Draw the filtered graph with outlier edges removed
    edges = []
    standardized_alphas = scipy.stats.zscore([ d['alpha'] for u, v, d in G.edges(data=True) ])
    print('standardized_alphas: ', standardized_alphas)

    for idx, (u, v, d) in enumerate(G.edges(data=True)):
        isOutlier = 1 if standardized_alphas[idx] > standardized_cut else 0
        added_idx_offset = n_cls2
        print('d: ', standardized_alphas[idx], d['weight'], isOutlier, added_idx_offset)
        edges.append({
            'u': u,
            'v': v,
            'source': max(u, v) - added_idx_offset,
            'target': min(u, v),
            'isOutlier': isOutlier,
            'weight': d['weight'],
            'alpha': standardized_alphas[idx]
        })

    pd.DataFrame(edges).to_csv('edges_check.csv')
    return edges

class LoadData(APIView):
    def get(self, request, format=None):
        dataset_abbr = 'cancer'
        file_name = './app/static/data/' + dataset_abbr + '_simple.csv'
        df_dataset = pd.read_csv(file_name)
        selected_dataset_features = dataset_features[dataset_abbr]

        df_instances = pd.DataFrame()
        df_categorized_instances = pd.DataFrame()
        df_instances['idx'] = list(df_dataset.index)
        df_categorized_instances['idx'] = list(df_dataset.index)
        for feature_obj in selected_dataset_features:
            feature_name = feature_obj['name']
            feature_type = feature_obj['type']
            feature_values = list(df_dataset[feature_name])

            if feature_type == 'continuous':
                # instances_np = np.array(list(zip(range(len(feature_instances)), instances_for_cont)))
                categorized_values, _ = hClustering(np.array(feature_values).reshape(-1,1)) # Do clustering, and output the cluster labels
                
                print('feature_values: ', feature_values)
                print('categorized_values:', categorized_values)

                # feature values to instances
                # [0,2,3,1,0] => [ {'idx': 0, 'value': 0}, ...]
                categorized_values, feature_values = reassign_cluster_label_by_order(categorized_values, feature_values)
                print('feature_values after', feature_values)
                print('categorized_values after: ', categorized_values)
                instances = convert_feature_values_to_instances(categorized_values)
                categorized_domain = range(n_cls)
                instance_sets = convert_instances_to_instance_sets(categorized_domain, instances)

                feature_obj['featureValues'] = categorized_values
                feature_obj['instances'] = instance_sets
                feature_obj['domain'] = list(categorized_domain)
                print('instance_sets: ', [ len(instance_set) for instance_set in instance_sets])
            elif feature_type == 'categorical':
                # feature values to instances
                # [0,2,3,1,0] => [ {'idx': 0, 'value': 0}, ...]
                feature_values = convert_to_numbers(feature_obj['labels'], feature_values)
                instances = convert_feature_values_to_instances(feature_values)
                instance_sets = convert_instances_to_instance_sets(feature_obj['domain'], instances)

                feature_obj['featureValues'] = feature_values
                feature_obj['instances'] = instance_sets

            df_instances[feature_name] = feature_values
            df_categorized_instances[feature_name] = feature_obj['featureValues']
            df_categorized_instances.to_csv('clustered_instances.csv')

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
        num_lvs = len(lv_data)

        # Clustering for levels
        lv_cl_list_dict = {}
        for lv_idx, lv in enumerate(lv_data):
            df_instances_for_lv = pd.DataFrame({ feature['name']:feature['featureValues'] for feature in lv['features'] })
            if len(lv['features']) > 1:
                cl_labels_np, n_cls = hClustering(df_instances_for_lv.values)
                
                num_cls = 4
                cls_idx_list, protos_idx_list = kmdeoidsClustering(df_instances_for_lv.values, num_cls)
                # Organize the cluster information to export
                cl_list = []
                for cl_idx in range(n_cls):
                    df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column

                    instances_idx_for_cl = cls_idx_list[cl_idx]
                    prototypes_idx_for_cl = protos_idx_list[cl_idx]
                    instances_for_cl = df_instances_for_lv.loc[instances_idx_for_cl]
                    prototypes_for_cl = df_instances_for_lv.loc[prototypes_idx_for_cl]
                    prototype_feature_list = [ {'name': feature_name, 'value': feature_value } for feature_name, feature_value in prototypes_for_cl.to_dict().items() if feature_name != 'idx' ]
                    prototype = {
                        'idx': df_instances_for_lv.loc[prototypes_idx_for_cl, 'idx'],
                        'features': prototype_feature_list  # [ {'name': 'air pollution', 'value': 1}, ... ]
                    }

                    cl_list.append({
                        'idx': cl_idx,
                        'lvIdx': lv_idx,
                        'sortedIdx': cl_idx,
                        'instances': instances_for_cl.to_dict('records'),
                        'prototype': prototype
                    })
                lv_cl_list_dict[lv_idx] = cl_list 
            else: # if number of features = 1
                feature = lv['features'][0]
                cat_instances_list = []
                for cat in feature['domain']:
                    df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column
                    instances_for_cl = df_instances_for_lv.loc[df_instances_for_lv[feature['name']] == cat]
                    
                    cat_instances_list.append({
                        'idx': cat,
                        'lvIdx': lv_idx,
                        'sortedIdx': cat,
                        'instances': instances_for_cl.to_dict('records'),
                        'prototype': {}
                    })
                lv_cl_list_dict[lv_idx] = cat_instances_list

        # Between-level clusters sorting
        # go over clusters to sort the nodex
        for lv_idx, cls_for_lv in lv_cl_list_dict.items():
            if lv_idx < num_lvs-1:
                C1_instances = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx]]
                C2_instances = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx+1]]

                freq_mat_np = calculate_freq_mat(C1_instances, C2_instances)
                G = calculate_G(freq_mat_np)
                sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instances), len(C2_instances))

                # Store the sortedIdx information in each cluster set
                for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx]):
                    cl['sortedIdx'] = sorted_C1_idx[cl_idx]
                for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx+1]):
                    cl['sortedIdx'] = sorted_C2_idx[cl_idx]

        # Within-level cats sorting
        sorted_cats_idx_for_lvs = [{} for _ in range(num_lvs)]
        for lv_idx, lv in enumerate(lv_data): # for each level
            feature_list = lv['features']
            num_features = len(feature_list)
            if num_features > 1:
                for feature_idx, _ in enumerate(feature_list): # for each pair of adjacent cats
                    if feature_idx < num_features-1:
                        C1_instance_sets = feature_list[feature_idx]['instances']
                        C2_instance_sets = feature_list[feature_idx+1]['instances']

                        freq_mat_np = calculate_freq_mat(C1_instance_sets, C2_instance_sets)
                        G = calculate_G(freq_mat_np)
                        sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instance_sets), len(C2_instance_sets))
                        sorted_cats_idx_for_lvs[lv_idx][feature_idx] = list(sorted_C1_idx)
                        sorted_cats_idx_for_lvs[lv_idx][feature_idx+1] = list(sorted_C2_idx)

                        # Identifying outlier edges
                        print('within-level, ', feature_idx)
                        edges = detect_outlier_edges(G, len(C1_instance_sets), len(C2_instance_sets))
            else:
                sorted_cats_idx_for_lvs[lv_idx] = [ feature_list[0]['domain'] ]

        return Response({
            'LVData': lv_data,
            'clResult': lv_cl_list_dict,
            'sortedCatsIdxForLvs': sorted_cats_idx_for_lvs,
            'edgesWithOutlierInfo': edges
        })

class SortNodes(APIView):
    def post(self, request, format=None):
        pass

class OptimizeEdges(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        C1_instance_sets = json_request['currNodes']
        C2_instance_sets = json_request['nextNodes']
        print('optimizing node sets: ', json_request['nextNodesName'], json_request['nextNodesName'])

        freq_mat_np = calculate_freq_mat(C1_instance_sets, C2_instance_sets)
        G = calculate_G(freq_mat_np)
        print(freq_mat_np)

        # Sorting clusters
        sorted_cl1_idx, sorted_cl2_idx = sort_nodes(G, len(C1_instance_sets), len(C2_instance_sets))
        # Identifying outlier edges
        edges = detect_outlier_edges(G, len(C1_instance_sets), len(C2_instance_sets))

        return Response({
            'sortedCurrNodes': sorted_cl1_idx,
            'sortedNextNodes': sorted_cl2_idx,
            'edgesWithOutlierInfo': edges
        })
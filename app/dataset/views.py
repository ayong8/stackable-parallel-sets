from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
import networkx as nx
import scipy
import json, itertools, random

from sklearn.metrics.pairwise import euclidean_distances
from sklearn.metrics import silhouette_score
from sklearn.cluster import AgglomerativeClustering, KMeans
from scipy import stats

from pyclustering.cluster.kmedoids import kmedoids
from pyclustering.utils import calculate_distance_matrix
import static.lib.edge_filtering as out
from static.features import dataset_features

# import ..static.lib.clustering.divisive_clustering as cl
# from ..static.lib.clustering.load_dist_matrix import read_data, load_dist_matrix

dataset_features_for_bp = {
    'demoemo': []
}

# For per-feature clustering (when a feature is continuous)
# For per-level clustering (to generate clusters onto multiple features within a level)
# parameter - data (numpy array - (n_instances x n_features))

random.seed(42)
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

def hClustering(k, X):
    # dist_mat = euclidean_distances(data)
    # dhcl_model = cl.DivisiveClustering(dist_mat)
    # dhcl.fit()
    #dist_mat = euclidean_distances(X, X)
    np.random.seed(0)
    cl_fit = AgglomerativeClustering(n_clusters=k, affinity='euclidean').fit(X)

    return cl_fit.labels_, cl_fit.n_clusters_

# Input: Dataset itself
def kmdeoidsClustering(X, k):
    random.seed(42)
    initial_medoids_idx = random.sample(range(len(X)), k) # random.sample(range(len(X)), 4)
    dist_mat = calculate_distance_matrix(X)
    kmedoids_instance = kmedoids(X, initial_medoids_idx)
    kmedoids_instance.process()
    # silhouette_avg = silhouette_score(X, cluster_labels)
    
    # Store clusters and prototypes
    cls_idx_list = kmedoids_instance.get_clusters() # [[1,3,100], [2,56,90], ...]
    protos_idx_list = kmedoids_instance.get_medoids()
    
    return cls_idx_list, protos_idx_list

def kmeansClustering(X, k):
    kmeans = KMeans(n_clusters=k, random_state=42).fit(X)
    cl_labels = kmeans.labels_

    cls_idx_list_dict = {}
    for instance_idx, cl_idx in enumerate(cl_labels):
        if cl_idx not in cls_idx_list_dict.keys():
            cls_idx_list_dict[cl_idx] = []
        else:
            cls_idx_list_dict[cl_idx].append(instance_idx)

    return list(cls_idx_list_dict.values())

def calculate_pairwise_correlation(feature1, feature2):
    # Analyze the statistical coefficience
    # cont-cont => Pearson
    is_significant = 'false'
    if feature1['type'] == 'continuous' and feature2['type'] == 'continuous':
        coef, p_value = stats.pearsonr(feature1['featureValues'], feature2['featureValues'])
        is_significant = 'true' if p_value < 0.05 else 'false'
    # cat-ord, or cat-cat => Chi
    elif (feature1['type'] == 'categorical' and feature2['type'] == 'categorical') or \
    (feature1['type'] == 'categorical' and feature2['type'] == 'categorical') or \
    (feature1['type'] == 'categorical' and feature2['type'] == 'categorical'):
        df_feature_values = pd.DataFrame({'feature1': feature1['featureValues'], 'feature2':feature2['featureValues']})
        contingency_table = pd.crosstab(df_feature_values['feature1'], df_feature_values['feature2'])
        coef, p_value, _, _ = stats.chi2_contingency(contingency_table)
        is_significant = 'true' if p_value < 0.05 else 'false'
    # ord-ord => Spearman
    elif feature1['type'] == 'ordinal' and feature2['type'] == 'ordinal':
        coef, p_value = stats.spearmanr(feature1['featureValues'], feature2['featureValues'])
        is_significant = 'true' if p_value < 0.05 else 'false'
    # cont-(ord or cat) => ANOVA
    elif (feature1['type'] == 'categorical' and feature2['type'] == 'continuous') or \
    (feature1['type'] == 'continuous' and feature2['type'] == 'categorical'):
        coef, p_value = stats.f_oneway(feature1['featureValues'], feature2['featureValues'])
        is_significant = 'true' if p_value < 0.05 else 'false'
    else:
        print('feature type is not set up correctly')
    
    #corr_coef, p_value = stats.pearsonr(feature1['featureValues'], feature2['featureValues'])
    return coef, p_value, is_significant

def calculate_freq_mat(bipartite_mode, C1, C2):
    if bipartite_mode == None:
        num_cls1 = len(C1)
        num_cls2 = len(C2)
        freq_mat_np = np.array([[0]*num_cls2]*num_cls1)
        for cl1_idx, c1 in enumerate(C1):
            for cl2_idx, c2 in enumerate(C2):
                c1_idx_list = [ cl_instance['idx'] for cl_instance in c1 ]
                c2_idx_list = [ cl_instance['idx'] for cl_instance in c2 ]
                overlapped_instances = list(set(c1_idx_list) & set(c2_idx_list))
                freq_mat_np[cl1_idx, cl2_idx] = len(overlapped_instances)
    else: # Generate a freq matrix of (# of C1) x (# of items in bipartite C2) (the other way round if C1 is bipartite)
        if bipartite_mode == 'C2':
            df_bipartite = C2
            C = C1
        elif bipartite_mode == 'C1':
            df_bipartite = C1
            C = C2
        
        freq_mat_np = np.array([[0]*len(C)]*df_bipartite.shape[0])
        for cl1_idx, c1 in enumerate(C):
            for cl2_idx, c2 in enumerate(df_bipartite):
                c1_idx_list = [ cl_instance['idx'] for cl_instance in c1 ]
                freq_mat_np[:, cl1_idx] = list(df_bipartite.loc[:, c1_idx_list].sum(axis=1))

        if bipartite_mode == 'C2':
            freq_mat_np = freq_mat_np.transpose()
                
    return freq_mat_np

def calculate_G(freq_mat_np):
    num_cls1, num_cls2 = freq_mat_np.shape
    weighted_adj_mat = np.vstack([
        np.hstack([ np.zeros([num_cls1, num_cls1]), freq_mat_np ]),
        np.hstack([ np.transpose(freq_mat_np), np.zeros([num_cls2, num_cls2])])
    ])
    # print('weighted_adj_mat: ', weighted_adj_mat)

    print('weighted_adj_mat: ', weighted_adj_mat.shape)
    G = nx.from_numpy_matrix(weighted_adj_mat)

    return G

def calculate_G_for_cluster_set(C): # for a set of clusters (combine two functions - calculate_freq_mat + calculate_G)
    # Calculate the frequency matrix
    C_freqs = []
    C_super_cluster = sum(C_freqs)

    C_freqs.append(C_super_cluster)
    C_freqs.extend([ len(cl) for cl in C ])

    freq_mat_np = np.array([[0]*(len(C_freqs))]*(len(C_freqs)))
    for row_idx, cl_freq1 in enumerate(C_freqs): # Go over clusters except for super cluster
        if row_idx == 0:
            for col_idx, cl_freq2 in enumerate(C_freqs):
                if col_idx != 0:
                    freq_mat_np[row_idx, col_idx] = cl_freq2
        else:
            freq_mat_np[row_idx, 0] = cl_freq1

    G = nx.from_numpy_matrix(freq_mat_np)
    
    return G

def calculate_G_and_dominant_cats_for_cl(features, df_instances_in_cl): # for each cluster
    dominant_cats = {}
    cl_num_instances = df_instances_in_cl.shape[0]
    feature_names = [ feature['name'] for feature in features ]

    for feature in features:
        feature_name = feature['name']
        feature_domain = feature['domain']
        cat_freqs = []

        cat_freqs.append(cl_num_instances) # Add all-instances-freq as super node 
        for feature_value in feature_domain:
            cnt = df_instances_in_cl.loc[df_instances_in_cl[feature_name]==feature_value, feature_name].count()
            cat_freqs.append(cnt)
    #         category_cnts.append({
    #             'cat': feature_value,
    #             'cnt': cnt
    #         })

        freq_mat_np = np.array([[0]*(len(cat_freqs))]*(len(cat_freqs)))
        for row_idx, cat_freq1 in enumerate(cat_freqs): # Go over clusters except for super cluster
            if row_idx == 0:
                for col_idx, cat_freq2 in enumerate(cat_freqs):
                    if col_idx != 0:
                        freq_mat_np[row_idx, col_idx] = cat_freq2 if cat_freq2 != 0 else 1 # if no frequency for a cat, an edge isn't generated
            else:
                freq_mat_np[row_idx, 0] = cat_freq1 if cat_freq1 != 0 else 1

        G = nx.from_numpy_matrix(freq_mat_np)
        
        # Detect dominant clusters for ...
        G = out.disparity_filter(G)

        dominant_node_idx_list = []
        dominant_node_idx = None
        min_outlier_score = 1
        for u, v, d in G.edges(data=True):
            if d['alpha'] <= min_outlier_score:
                dominant_node_idx = v-1 # should exclude super node which is index 0, so subtract by 1
                min_outlier_score = d['alpha']
                dominant_d = d
        
        dominant_cats[feature_name] = dominant_node_idx
    
    return dominant_cats

def sort_nodes(G, num_cls1, num_cls2):
    L = nx.laplacian_matrix(G).toarray()
    w, v = np.linalg.eig(L)
    sorted_w = sorted(w)
    idx_second_smallest_eigen_val = np.where(w == sorted_w[1])[0][0]
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
def detect_outlier_edges(G, standardized_cut, n_cls1, n_cls2):
    cut = 0.3
    # Return the significant score with full graph
    G = out.disparity_filter(G)

    # Draw the filtered graph with outlier edges removed
    edges = []
    standardized_alphas = scipy.stats.zscore([ d['alpha'] for u, v, d in G.edges(data=True) ])

    for idx, (u, v, d) in enumerate(G.edges(data=True)):
        isOutlier = 1 if standardized_alphas[idx] > standardized_cut else 0
        added_idx_offset = n_cls1

        edges.append({
            'u': u,
            'v': v,
            'source': min(u, v),
            'target': max(u, v) - added_idx_offset,
            'isOutlier': isOutlier,
            'weight': d['weight'],
            'alpha': standardized_alphas[idx]
        })

    sorted_edges = sorted(edges, key = lambda i: i['alpha'])
    num_total_edges = n_cls1 * n_cls2
    non_outlier_edges = [ e for e in edges if e['isOutlier'] == 0 ]
    num_non_outliers = len(non_outlier_edges)
    non_outlier_ratio = len(non_outlier_edges) / num_total_edges

    return edges, non_outlier_ratio, num_non_outliers

def detect_outlier_nodes(G):
    G = out.disparity_filter(G)

    dominant_node_idx_list = []
    dominant_node_idx = None
    min_outlier_score = 1
    for u, v, d in G.edges(data=True):
        if d['alpha'] < min_outlier_score:
            dominant_node_idx = v-1 # should exclude super node which is index 0, so subtract by 1
            min_outlier_score = d['alpha']
    dominant_node_idx_list.append(dominant_node_idx)

    return dominant_node_idx_list

class LoadData(APIView):
    def get(self, request, format=None):
        global dataset_abbr
        global file_name
        global file_name_for_bipartite

        dataset_abbr = 'demoemo' # 'cancer' or 'demoemo'
        if dataset_abbr == 'cancer':
            file_name = './app/static/data/' + dataset_abbr + '_simple_high.csv'
            file_name_for_bipartite = './app/static/data/' + 'demoemo' + '_users_hashtags_simple.csv'
        elif dataset_abbr == 'demoemo':
            file_name = './app/static/data/' + dataset_abbr + '_users_simple_200.csv'
            file_name_for_bipartite = './app/static/data/' + dataset_abbr + '_words_simple_200_filtered.csv'
        elif dataset_abbr == 'como':
            file_name = './app/static/data/' + dataset_abbr + '_simple_200.csv'
            file_name_for_bipartite = './app/static/data/' + 'demoemo' + '_words_simple_200_filtered.csv'

        df_dataset = pd.read_csv(file_name)
        
        bipartite = True
        df_dataset_bipartite = pd.DataFrame()
        if bipartite == True:
            df_dataset_bipartite = pd.read_csv(file_name_for_bipartite)
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
                categorized_values, _ = hClustering(n_cls, np.array(feature_values).reshape(-1,1)) # Do clustering, and output the cluster labels

                # feature values to instances
                # [0,2,3,1,0] => [ {'idx': 0, 'value': 0}, ...]
                categorized_values, feature_values = reassign_cluster_label_by_order(categorized_values, feature_values)
                instances = convert_feature_values_to_instances(categorized_values)
                categorized_domain = range(n_cls)
                instance_sets = convert_instances_to_instance_sets(categorized_domain, instances)

                feature_obj['featureValues'] = categorized_values
                feature_obj['instances'] = instance_sets
                feature_obj['domain'] = list(categorized_domain)
                feature_obj['labels'] = list(categorized_domain)
            elif feature_type == 'categorical':
                # feature values to instances
                # [0,2,3,1,0] => [ {'idx': 0, 'value': 0}, ...]
                
                if dataset_abbr == 'como':
                    feature_values = convert_to_numbers(feature_obj['labels'], feature_values)
                    instances = convert_feature_values_to_instances(feature_values)
                    instance_sets = convert_instances_to_instance_sets(feature_obj['domain'], instances)
                else:
                    feature_values = convert_to_numbers(feature_obj['labels'], feature_values)
                    instances = convert_feature_values_to_instances(feature_values)
                    instance_sets = convert_instances_to_instance_sets(feature_obj['domain'], instances)

                feature_obj['featureValues'] = feature_values
                feature_obj['instances'] = instance_sets

            df_instances[feature_name] = feature_values
            df_categorized_instances[feature_name] = feature_obj['featureValues']
            df_categorized_instances.to_csv('clustered_instances.csv')

        return Response({ 
            'datasetAbbr': dataset_abbr,
            'dataset': df_dataset.to_json(orient='records'),
            'datasetForBp': df_dataset_bipartite.to_json(orient='records'),
            'features': selected_dataset_features,
            'instances': df_instances.to_json(orient='records')
        })

class HClustering(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        hClustering(n_cls, json_request['data'])

def clustering_for_lv(lv, lv_idx):
    lv_cl_list = []
    # Prepare the instances and features, domains
    if lv['btnMode']['bipartiteMode'] == 1:
        df_instances_for_lv = pd.read_csv(file_name_for_bipartite).drop('idx', axis=1)
        #df_instances_for_lv = pd.DataFrame({ feature['name']:feature['featureValues'] for feature in lv['features'] })
        # df_instances_for_lv.set_index('idx')
        df_instances_for_lv = df_instances_for_lv.transpose()
        lv['btnMode']['bipartiteMat'] = df_instances_for_lv # matrix of e.g., hashtags (rows) and users (columns)
        total_freq_for_lv = df_instances_for_lv.sum().sum()
    elif lv['btnMode']['bipartiteMode'] == 0:
        df_instances_for_lv = pd.DataFrame({ feature['name']:feature['featureValues'] for feature in lv['features'] })
        total_freq_for_lv = 0
    features = lv['features']
    domain_list = [ feature['domain'] for feature in lv['features'] ]
    feature_names = [ feature['name'] for feature in lv['features'] ]

    # Do clustering and identify centroids and dominant categories
    # -- For bipartite level, only do clustering (it doesn't have within-level layout)
    if lv['btnMode']['bipartiteMode'] == 1:
        # cl_labels_np, n_cls = hClustering(lv['btnMode']['numCls'], df_instances_for_lv.values)
        
        num_cls = 6
        cls_idx_list, protos_idx_list = kmdeoidsClustering(df_instances_for_lv.values, num_cls)
        # Organize the cluster information to export
        cl_list = []

        df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column
        for item_num, (item_idx, item) in enumerate(df_instances_for_lv.iterrows()):
            cl_list.append({
                'idx': item_num,
                'name': item_idx,
                'lvIdx': lv_idx,
                'sortedIdx': item_idx,
                'instances': [ item.to_dict() ]
            })
        # for cl_idx in range(num_cls):
        #     df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column
        #     instances_idx_for_cl = cls_idx_list[cl_idx]
        #     prototypes_idx_for_cl = protos_idx_list[cl_idx]
        #     instances_for_cl = df_instances_for_lv.iloc[instances_idx_for_cl]

        #     cl_list.append({
        #         'idx': cl_idx,
        #         'lvIdx': lv_idx,
        #         'sortedIdx': cl_idx,
        #         'instances': instances_for_cl.to_dict('records')
        #     })
        lv_cl_list = cl_list

        # feature = lv['features'][0]
        # cat_instances_list = []
        # for cat_idx in feature['domain']:
        #     df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column
        #     instances_for_cl = df_instances_for_lv.loc[df_instances_for_lv[feature['name']] == cat_idx]

        #     dominant_cats = {}
        #     for feature_idx, feature_name in enumerate(feature_names):
        #         dominant_cats[feature_name] = cat_idx
            
        #     cat_instances_list.append({
        #         'idx': cat_idx,
        #         'lvIdx': lv_idx,
        #         'label': feature['labels'][cat_idx],
        #         'sortedIdx': cat_idx,
        #         'instances': instances_for_cl.to_dict('records'),
        #         'dominantCat': 0,
        #         'prototype': {},
        #         'dominantCats': dominant_cats
        #     })
        # lv_cl_list = cat_instances_list

    elif lv['btnMode']['bipartiteMode'] == 0:
        if (len(lv['features']) > 1) and (lv['btnMode']['aggrMode'] == 'clustering'):
            #cl_labels_np, n_cls = hClustering(lv['btnMode']['numCls'], df_instances_for_lv.values)
            
            num_cls = 6
            cls_idx_list, protos_idx_list = kmdeoidsClustering(df_instances_for_lv.values, num_cls)
            # Organize the cluster information to export
            cl_list = []
            for cl_idx in range(num_cls):
                df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column

                instances_idx_for_cl = cls_idx_list[cl_idx]
                prototypes_idx_for_cl = protos_idx_list[cl_idx]
                instances_for_cl = df_instances_for_lv.iloc[instances_idx_for_cl]

                # centroid
                prototypes_for_cl = df_instances_for_lv.iloc[prototypes_idx_for_cl]
                prototype_feature_list = [ {'name': feature_name, 'value': feature_value } for feature_name, feature_value in prototypes_for_cl.to_dict().items() if feature_name != 'idx' ]
                prototype = {
                    'idx': df_instances_for_lv.iloc[prototypes_idx_for_cl, df_instances_for_lv.columns.get_loc('idx')],
                    'features': prototype_feature_list  # [ {'name': 'air pollution', 'value': 1}, ... ]
                }

                instances_for_cl.to_csv('instances_for_cl.csv')
                dominant_cats = calculate_G_and_dominant_cats_for_cl(features, instances_for_cl)

                cl_list.append({
                    'idx': cl_idx,
                    'lvIdx': lv_idx,
                    'sortedIdx': cl_idx,
                    'instances': instances_for_cl.to_dict('records'),
                    'dominantCat': 0,
                    'prototype': prototype,
                    'dominantCats': dominant_cats
                })
            lv_cl_list = cl_list
        elif (len(lv['features']) > 1) and (lv['btnMode']['aggrMode'] == 'binning'):
            cat_permutations = list(itertools.product(*domain_list))
            
            cls_idx_list = []
            protos_idx_list = []
            for cat_combi in cat_permutations:
                df_instances_for_bin = df_instances_for_lv[ df_instances_for_lv[feature_names] == list(cat_combi) ].dropna()
                cl_idx_list = list(df_instances_for_bin.index)
                
                if len(cl_idx_list) == 0:
                    protos_idx_list.append(0)
                else:
                    protos_idx_list.append(cl_idx_list[0]) # Prototype is just the first instance
                cls_idx_list.append(cl_idx_list)
                
            cl_list = []
            for cl_idx in range(len(cat_permutations)):
                df_instances_for_lv['idx'] = list(df_instances_for_lv.index)
                instances_idx_for_cl = cls_idx_list[cl_idx]
                prototypes_idx_for_cl = protos_idx_list[cl_idx]
                instances_for_cl = df_instances_for_lv.loc[instances_idx_for_cl]
                prototypes_for_cl = df_instances_for_lv.loc[prototypes_idx_for_cl]
                prototype_feature_list = [ {'name': feature_name, 'value': feature_value } for feature_name, feature_value in prototypes_for_cl.to_dict().items() if feature_name != 'idx' ]
                prototype = {
                    'idx': df_instances_for_lv.loc[prototypes_idx_for_cl, 'idx'],
                    'features': prototype_feature_list  # [ {'name': 'air pollution', 'value': 1}, ... ]
                }
                dominant_cats = {} #[ { feature: 'sex', dominancCat: 0 }, ... ]
                for feature_idx, feature_name in enumerate(feature_names):
                    dominant_cats[feature_name] = cat_permutations[cl_idx][feature_idx]

                cl_list.append({
                    'idx': cl_idx,
                    'lvIdx': lv_idx,
                    'sortedIdx': cl_idx,
                    'instances': instances_for_cl.to_dict('records'),
                    'dominantCat': 0,
                    'prototype': prototype,
                    'dominantCats': dominant_cats
                })
            lv_cl_list = cl_list
        else: # if number of features = 1
            feature = lv['features'][0]
            cat_instances_list = []
            for cat_idx in feature['domain']:
                df_instances_for_lv['idx'] = list(df_instances_for_lv.index) # Add index as explicit column
                instances_for_cl = df_instances_for_lv.loc[df_instances_for_lv[feature['name']] == cat_idx]

                dominant_cats = {}
                for feature_idx, feature_name in enumerate(feature_names):
                    dominant_cats[feature_name] = cat_idx
                
                cat_instances_list.append({
                    'idx': cat_idx,
                    'lvIdx': lv_idx,
                    'label': feature['labels'][cat_idx],
                    'sortedIdx': cat_idx,
                    'instances': instances_for_cl.to_dict('records'),
                    'dominantCat': 0,
                    'prototype': {},
                    'dominantCats': dominant_cats
                })
            lv_cl_list = cat_instances_list

    # Identify the dominant clusters per level(=cluster set) - algorithm version
    # dominant_cls_in_lvs = []
    # for lv_idx, cls_for_lv in lv_cl_list_dict.items():
    #     C_instance_set = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx] ]
    #     G = calculate_G_for_cluster_set(C_instance_set)
    #     dominant_cls_in_lvs.append({
    #         'lv': lv_idx,
    #         'dominantCl': detect_outlier_nodes(G)
    #     })
    return lv, total_freq_for_lv, lv_cl_list

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

        sort_cls_by = json_request['sortClsBy'] # 'layout_optimization' or any given feature name
        df_instances = pd.DataFrame(json_request['instances'])
        df_instances = df_instances.set_index('idx')
        num_lvs = len(lv_data)

        if dataset_abbr == 'cancer':
            # file_name = './app/static/data/' + dataset_abbr + '_simple_high.csv'
            file_name_for_bipartite = './app/static/data/' + 'demoemo' + '_users_hashtags_simple.csv'
        elif dataset_abbr == 'demoemo':
            # file_name = './app/static/data/' + dataset_abbr + '_users_simple.csv'
            file_name_for_bipartite = './app/static/data/' + dataset_abbr + '_users_hashtags_simple.csv'

        # Clustering for levels
        lv_cl_list_dict = {}
        lv_total_freqs_dict = {}
        for lv_idx, lv in enumerate(lv_data):
            if lv['btnMode']['bipartiteMode'] == 0:
                lv_updated, total_freq_for_lv, lv_cl_list = clustering_for_lv(lv, lv_idx)
                lv_data[lv_idx] = lv_updated
                lv_total_freqs_dict[lv_idx] = total_freq_for_lv
                lv_cl_list_dict[lv_idx] = lv_cl_list
            else:
                lv_updated, total_freq_for_lv, lv_cl_list = clustering_for_lv(lv, lv_idx)
                lv_data[lv_idx] = lv_updated
                lv_total_freqs_dict[lv_idx] = total_freq_for_lv
                lv_cl_list_dict[lv_idx] = lv_cl_list
                # lv_cl_list_dict[lv_idx] = [ cl['instances'] for cl in lv_cl_list ]

        # Identify the dominant clusters per level(=cluster set) - pick the biggest cluster
        dominant_cls_in_lvs = {}
        for lv_idx, cls_for_lv in lv_cl_list_dict.items():
            max_cl_idx = np.argmax([ len(cl['instances']) for cl in cls_for_lv ])
            dominant_cls_in_lvs[lv_idx] = cls_for_lv[max_cl_idx]['idx']

        # Between-level clusters sorting..
        # go over clusters to sort the nodes
        df_bipartite_instances = pd.DataFrame()
        for lv_idx, cls_for_lv in lv_cl_list_dict.items():
            if sort_cls_by == 'layout_optimization':
                if lv_idx < num_lvs-1:
                    C1_instances = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx]]
                    C2_instances = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx+1]]

                    # If one of two levels is bipartite
                    if lv_data[lv_idx]['btnMode']['bipartiteMode'] == 1: # If current level is bipartite
                        df_bipartite_instances = lv_data[lv_idx]['btnMode']['bipartiteMat']
                        df_bipartite_instances = df_bipartite_instances.drop('idx', axis=1)
                        freq_mat_np = df_bipartite_instances.values

                        G = calculate_G(freq_mat_np)
                        print('freq_mat_np: ', freq_mat_np.shape)
                        sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instances), len(C2_instances))
                        print('num_cls: ', lv_idx, lv_idx+1, len(C1_instances), len(C2_instances))
                    elif lv_data[lv_idx+1]['btnMode']['bipartiteMode'] == 1: # If next level is bipartite
                        df_bipartite_instances = lv_data[lv_idx+1]['btnMode']['bipartiteMat']
                        df_bipartite_instances = df_bipartite_instances.drop('idx', axis=1)

                        freq_mat_np = calculate_freq_mat('C2', C1_instances, df_bipartite_instances)
                        G = calculate_G(freq_mat_np)
                        num_items = freq_mat_np.shape[1]
                        sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instances), num_items)
                    else:
                        freq_mat_np = calculate_freq_mat(None, C1_instances, C2_instances)  # bipartite_mode = 0
                        print(freq_mat_np)
                        G = calculate_G(freq_mat_np)
                        sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instances), len(C2_instances))
                        print('sorted_C2_idx in normal mode: ', sorted_C2_idx)

                    # Store the sortedIdx information in each cluster set
                    if lv_data[lv_idx]['btnMode']['bipartiteMode'] == 0 and lv_data[lv_idx+1]['btnMode']['bipartiteMode'] == 0:
                        for sorted_idx, cl_idx in enumerate(sorted_C1_idx):
                            lv_cl_list_dict[lv_idx][cl_idx]['sortedIdx'] = sorted_idx
                        for sorted_idx, cl_idx in enumerate(sorted_C2_idx):
                            lv_cl_list_dict[lv_idx+1][cl_idx]['sortedIdx'] = sorted_idx
                    else:
                        for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx]):
                            cl['sortedIdx'] = sorted_C1_idx[cl_idx]
                        for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx+1]):
                            print('sorted_C2_idxxx: ', sorted_C2_idx)
                            cl['sortedIdx'] = sorted_C2_idx[cl_idx]

            else: # then sort by selected feature
                if lv_data[lv_idx]['btnMode']['bipartiteMode'] == 0:
                    cls_instances = [ cl['instances'] for cl in lv_cl_list_dict[lv_idx]]
                    df_instances_for_sorting_feature = df_instances[sort_cls_by]

                    mean_values_by_feature = []
                    for instance_set in cls_instances:
                        instances_idx = [ instance['idx'] for instance in instance_set ]
                        mean_value = df_instances.loc[instances_idx, sort_cls_by].mean()
                        mean_values_by_feature.append(mean_value)

                    sorted_cls_idx = np.argsort(mean_values_by_feature) # in an ascending order

                    for sorted_idx, cl_idx in enumerate(sorted_cls_idx):
                        lv_cl_list_dict[lv_idx][cl_idx]['sortedIdx'] = sorted_idx
                    # for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx]):
                    #     cl['sortedIdx'] = sorted_cls_idx[cl_idx]
                else:
                    df_bipartite_instances = lv_data[lv_idx]['btnMode']['bipartiteMat']
                    df_bipartite_instances = df_bipartite_instances.drop('idx', axis=1)
                    for cl_idx, cl in enumerate(lv_cl_list_dict[lv_idx]):
                        cl['sortedIdx'] = cl_idx

        # Within-level cats sorting and pairwise correlation
        sorted_cats_idx_for_lvs = [{} for _ in range(num_lvs)]
        pairwise_corrs = [{} for _ in range(num_lvs)]
        for lv_idx, lv in enumerate(lv_data): # for each level
            feature_list = lv['features']
            is_bipartite = lv['btnMode']['bipartiteMode']
            num_features = len(feature_list)

            if is_bipartite == 0:
                if num_features > 1:
                    pairwise_corrs[lv_idx] = []
                    for feature_idx, feature in enumerate(feature_list): # for each pair of adjacent cats
                        if feature_idx < num_features-1:
                            C1_instance_set = feature_list[feature_idx]['instances']
                            C2_instance_set = feature_list[feature_idx+1]['instances']

                            freq_mat_np = calculate_freq_mat(None, C1_instance_set, C2_instance_set)
                            G = calculate_G(freq_mat_np)
                            sorted_C1_idx, sorted_C2_idx = sort_nodes(G, len(C1_instance_set), len(C2_instance_set))
                            sorted_cats_idx_for_lvs[lv_idx][feature_idx] = list(sorted_C1_idx)
                            sorted_cats_idx_for_lvs[lv_idx][feature_idx+1] = list(sorted_C2_idx)

                            # Identifying outlier edges
                            # outlier_cut_threshold = -0.3
                            # edges, non_outlier_ratio = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))

                            # Calculating correlation
                            for feature_idx2 in range(feature_idx+1, num_features):
                                coef, p_value, is_significant = calculate_pairwise_correlation(feature_list[feature_idx], feature_list[feature_idx2])
                                pairwise_corrs[lv_idx].append({ 
                                    'featurePair': [feature_idx, feature_idx2], 
                                    'coef': coef,
                                    'pValue': p_value,
                                    'isSignificant': is_significant
                                })
                else:
                    sorted_cats_idx_for_lvs[lv_idx] = [ feature_list[0]['domain'] ]
            elif is_bipartite == 1:
                sorted_cats_idx_for_lvs[lv_idx] = []

        return Response({
            'LVData': lv_data,
            'clResult': lv_cl_list_dict,
            'sortedCatsIdxForLvs': sorted_cats_idx_for_lvs,
            # 'edgesWithOutlierInfo': edges,
            'dominantClsForLvs': dominant_cls_in_lvs,
            'pairwiseCorrs': pairwise_corrs,
            'totalFreqsForLvs': lv_total_freqs_dict,
            'bipartiteMat': df_bipartite_instances.values if not df_bipartite_instances.empty else []
        })

class SortNodes(APIView):
    def post(self, request, format=None):
        pass

class OptimizeEdgesForCats(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        # C1_bipartite_mode = json_request['currBipartiteMode']
        # C2_bipartite_mode = json_request['nextBipartiteMode']
        C1_instance_set = json_request['currNodes']
        C2_instance_set = json_request['nextNodes']
        
        freq_mat_np = calculate_freq_mat(None, C1_instance_set, C2_instance_set)
        G = calculate_G(freq_mat_np)

        # Sorting clusters
        sorted_cl1_idx, sorted_cl2_idx = sort_nodes(G, len(C1_instance_set), len(C2_instance_set))
        
        # Identifying outlier edges between cluster sets
        outlier_cut_threshold = -0.35
        edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
        while num_non_outliers > 6:
            edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
            outlier_cut_threshold -= 0.25

        # for e in edges:
        #     print('weight and score: ', e['u'], e['v'], e['source'], e['target'], e['weight'], e['alpha'], e['isOutlier'])

        return Response({
            'sortedCurrNodes': sorted_cl1_idx,
            'sortedNextNodes': sorted_cl2_idx,
            'edgesWithOutlierInfo': edges
        })

class OptimizeEdgesForCls(APIView):
    def post(self, request, format=None):
        json_request = json.loads(request.body.decode(encoding='UTF-8'))
        C1_bipartite_mode = json_request['currBipartiteMode']
        C2_bipartite_mode = json_request['nextBipartiteMode']
        C1_instance_set = json_request['currNodes']
        C2_instance_set = json_request['nextNodes']
        bipartite_mat = json_request['bipartiteMat']

        # If one of two levels is bipartite
        # freq_mat_np = calculate_freq_mat(C1_instance_set, C2_instance_set)
        # G = calculate_G(freq_mat_np)
        
        if (C1_bipartite_mode == 0) and (C2_bipartite_mode == 0):
            freq_mat_np = calculate_freq_mat(None, C1_instance_set, C2_instance_set)
            G = calculate_G(freq_mat_np)
            sorted_cl1_idx, sorted_cl2_idx = sort_nodes(G, len(C1_instance_set), len(C2_instance_set))
        else: # If current level is bipartite
            if C1_bipartite_mode == 1:
                freq_mat_np = calculate_freq_mat('C1', pd.DataFrame(bipartite_mat), C2_instance_set)
                G = calculate_G(freq_mat_np)
                num_items = freq_mat_np.shape[1]
                sorted_cl1_idx, sorted_cl2_idx = sort_nodes(G, num_items, len(C2_instance_set))
            elif C2_bipartite_mode == 1:
                freq_mat_np = calculate_freq_mat('C2', C1_instance_set, pd.DataFrame(bipartite_mat))
                G = calculate_G(freq_mat_np)
                num_items = freq_mat_np.shape[1]
                sorted_cl1_idx, sorted_cl2_idx = sort_nodes(G, len(C1_instance_set), num_items)
        
        print('sorted_cl1_idxs; ', sorted_cl1_idx)
        print('sorted_cl2_idxs; ', sorted_cl2_idx)
        # Identifying outlier edges between cluster sets

        outlier_cut_threshold = -0.5
        if (C1_bipartite_mode == 0) and (C2_bipartite_mode == 0):
            edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
            while num_non_outliers > 6:
                edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
                outlier_cut_threshold -= 0.25
        else:
            edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
            while num_non_outliers > 20:
                edges, non_outlier_ratio, num_non_outliers = detect_outlier_edges(G, outlier_cut_threshold, len(C1_instance_set), len(C2_instance_set))
                outlier_cut_threshold -= 0.25
        # for e in edges:
        #     print('weight and score: ', e['u'], e['v'], e['source'], e['target'], e['weight'], e['alpha'], e['isOutlier'])

        return Response({
            'sortedCurrNodes': sorted_cl1_idx,
            'sortedNextNodes': sorted_cl2_idx,
            'edgesWithOutlierInfo': edges
        })
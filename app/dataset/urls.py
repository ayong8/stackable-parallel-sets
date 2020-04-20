from django.conf.urls import url
from . import views

urlpatterns = [
    url(
        regex=r'^loadData/$',
        view=views.LoadData.as_view(),
        name='load_data'
    ),
    url(
        regex=r'^hClustering/$',
        view=views.HClustering.as_view(),
        name='h_clustering'
    ),
    url(
        regex=r'^hClusteringForAllLVs/$',
        view=views.HClusteringForAllLVs.as_view(),
        name='h_clustering_for_all_lvs'
    ),
    url(
        regex=r'^optimizeEdgesForCats/$',
        view=views.OptimizeEdgesForCats.as_view(),
        name='optimize_edges_for_cats'
    ),
    url(
        regex=r'^optimizeEdgesForCls/$',
        view=views.OptimizeEdgesForCls.as_view(),
        name='optimize_edges_for_cls'
    ),
]

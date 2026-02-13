from django.urls import path
from . import views

urlpatterns = [
    # path('test/', views.test_api, name='test_api'),
    path('upload/', views.upload_document),
    # path('report/<int:report_id>/', views.download_report),
    # path("recent-results/", views.recent_results),
    path("analyze-text/", views.analyze_text),
    # path("report-details/<int:report_id>/",views.report_details),
    

]

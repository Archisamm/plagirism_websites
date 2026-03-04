from django.urls import path
from . import views

urlpatterns = [
    # Existing endpoints
    path('upload/', views.upload_document, name='upload_document'),
    path('analyze-text/', views.analyze_text, name='analyze_text'),
    
    # New endpoints for dynamic sections
    path('recent-results/', views.recent_results, name='recent_results'),
    path('user-reports/', views.user_reports, name='user_reports'),
    path('citations/', views.get_citations, name='get_citations'),
    path('similarity-data/', views.similarity_data, name='similarity_data'),
    path('user-history/', views.user_history, name='user_history'),
    path('copyright-data/', views.copyright_data, name='copyright_data'),
    path('user-settings/', views.user_settings, name='user_settings'),
    path('result-details/<int:result_id>/', views.result_details, name='result_details'),
    path('report/<int:report_id>/download/', views.download_report, name='download_report'),
    
    # CRITICAL: Add this endpoint for frontend sync
    path('sync-user-data/', views.sync_user_data, name='sync_user_data'),
]
from django.urls import path

from app import views

urlpatterns = [
    path('', views.home, name='Home'),
    path('report', views.reportError, name='Report Error'),
    path('dams', views.getDAMS, name='Get Dams'),
]

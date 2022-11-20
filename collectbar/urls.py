from django.urls import path

from collectbar.views import get_goals, get_packages, get_sections, overview

app_name = 'collectsbar'

urlpatterns = [
    path('', overview, name="overview"),
    path('goals/', get_goals, name="get_goals"),
    path('packages/', get_packages, name="get_packages"),
    path('sections/', get_sections, name="get_sections"),
]

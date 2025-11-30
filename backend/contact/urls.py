from django.urls import path
from .views import ContactCreateView

urlpatterns = [
    path('api/contact/', ContactCreateView.as_view(), name='api-contact'),
]

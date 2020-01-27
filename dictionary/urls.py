from django.contrib import admin
from django.urls import path
from words.views import auth, getCards

urlpatterns = [
    path('admin/', admin.site.urls),
    path('cards/', getCards)
]

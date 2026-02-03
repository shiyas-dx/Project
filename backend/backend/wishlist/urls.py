from django.urls import path
from .views import WishlistView, WishlistToggleView, WishlistRemoveView

urlpatterns = [
    path("", WishlistView.as_view()),
    path("toggle/", WishlistToggleView.as_view()),
    path("remove/", WishlistRemoveView.as_view()),
]
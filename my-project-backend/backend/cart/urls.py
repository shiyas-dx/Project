from django.urls import path
from .views import CartView, CartAddView, CartRemoveView

urlpatterns = [
    path("", CartView.as_view()),
    path("add/", CartAddView.as_view()),
    path("remove/", CartRemoveView.as_view()),
]

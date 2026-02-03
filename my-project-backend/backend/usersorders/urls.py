from django.urls import path
from .views import AdminOrdersView, AdminCancelOrderView

urlpatterns = [
    path("orders/", AdminOrdersView.as_view()),
    path("orders/<int:pk>/cancel/", AdminCancelOrderView.as_view()),
]
from django.urls import path
from .views import CreateOrderView,CancelOrderView,ReorderView,DeleteOrderView

urlpatterns = [
    path("create/", CreateOrderView.as_view()),
    path("admin/orders/<int:order_id>/cancel/", CancelOrderView.as_view()),
    path("admin/orders/<int:order_id>/reorder/", ReorderView.as_view()),
    path("admin/orders/<int:order_id>/delete/", DeleteOrderView.as_view()),
]
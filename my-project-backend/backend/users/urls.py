from django.urls import path
from .views import AdminUserListView, AdminUserBlockToggleView,AdminUserEditView,AdminUserOrdersView

urlpatterns = [
    path("users/", AdminUserListView.as_view()),
    path("users/<int:user_id>/block/", AdminUserBlockToggleView.as_view()),
    path("users/<int:user_id>/edit/", AdminUserEditView.as_view()),
    path("users/<int:user_id>/orders/", AdminUserOrdersView.as_view()),
]

from django.urls import path
from .views import (
    UserProductList,
    UserProductDetail,
    AdminProductListCreate,
    AdminProductDetail,
)

urlpatterns = [
    
    path("", UserProductList.as_view()),
    path("<int:pk>/", UserProductDetail.as_view()),

    
    path("admin/", AdminProductListCreate.as_view()),
    path("admin/<int:pk>/", AdminProductDetail.as_view()),
]

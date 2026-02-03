from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import WishlistItem
from .serializers import WishlistItemSerializer
from products.models import Product


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items = WishlistItem.objects.filter(user=request.user)
            serializer = WishlistItemSerializer(items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"error": "Failed to fetch wishlist items"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"error": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        
        try:
            wishlist_item, created = WishlistItem.objects.get_or_create(
                user=request.user,
                product=product,
            )

            if not created:
                wishlist_item.delete()
                return Response(
                    {"message": "Removed from wishlist"},
                    status=status.HTTP_200_OK
                )

            return Response(
                {"message": "Added to wishlist"},
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Wishlist operation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WishlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"error": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        
        try:
            deleted_count, _ = WishlistItem.objects.filter(
                user=request.user,
                product=product,
            ).delete()

            if deleted_count == 0:
                return Response(
                    {"error": "Item not found in wishlist"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"message": "Removed from wishlist successfully"},
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Failed to remove item from wishlist"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

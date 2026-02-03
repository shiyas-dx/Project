from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CartItem
from .serializers import CartItemSerializer
from products.models import Product


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items = CartItem.objects.filter(user=request.user)
            serializer = CartItemSerializer(items, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"error": "Failed to fetch cart items"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        
        if not product_id:
            return Response(
                {"error": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except:
            return Response(
                {"error": "quantity must be a positive integer"},
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
            cart_item, created = CartItem.objects.get_or_create(
                user=request.user,
                product=product,
            )

            if created:
                cart_item.quantity = quantity
            else:
                cart_item.quantity += quantity

            cart_item.save()

            return Response(
                {
                    "message": "Added to cart successfully",
                    "product_id": product.id,
                    "quantity": cart_item.quantity,
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Failed to add item to cart"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CartRemoveView(APIView):
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
            deleted_count, _ = CartItem.objects.filter(
                user=request.user,
                product=product,
            ).delete()

            if deleted_count == 0:
                return Response(
                    {"error": "Item not found in cart"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"message": "Removed from cart successfully"},
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Failed to remove item from cart"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminOrderSerializer
from .serializers import OrderSerializer
from cart.models import CartItem
from .models import Order,OrderItem


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            
            CartItem.objects.filter(user=request.user).delete()

            return Response(
                {
                    "message": "Order placed successfully",
                    "order_id": serializer.instance.id,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CancelOrderView(APIView):
    permission_classes = [IsAdminUser]  

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        order.status = "CANCELLED"
        order.save()

        return Response({"message": "Order cancelled successfully"}, status=status.HTTP_200_OK)
    
class ReorderView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

       
        new_order = Order.objects.create(
            user=order.user,
            total_amount=order.total_amount,
            payment_method=order.payment_method,
            name=order.name,
            address=order.address,
            pincode=order.pincode,
            status="PAID",
            
        )

        
        for item in order.items.all():
            
            OrderItem.objects.create(
                order=new_order,      
                product=item.product,
                quantity=item.quantity,
                price=item.price
            )

        serializer = AdminOrderSerializer(new_order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DeleteOrderView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        order.delete()

        return Response(
            {"message": "Order deleted successfully"},
            status=status.HTTP_200_OK
        )

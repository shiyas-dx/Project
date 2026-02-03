from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from orders.models import Order

class AdminOrdersView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.prefetch_related("items__product", "user")

        data = []
        for order in orders:
            data.append({
                "id": order.id,
                "userEmail": order.user.email,
                "userId": order.user.id,
                "status": order.status,
                "products": [
                    {
                        "name": item.product.name,
                        "price": item.price,
                        "quantity": item.quantity,
                    }
                    for item in order.items.all()
                ],
                "total": order.total_amount,
            })

        return Response(data)

class AdminCancelOrderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            order.status = "CANCELLED"
            order.save()
            return Response({"message": "Order cancelled"})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

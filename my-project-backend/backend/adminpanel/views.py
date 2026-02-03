from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication


from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from products.models import Product

User = get_user_model()

class AdminDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        
        users = User.objects.all()
        users_data = [
            {
                "id": u.id,
                "email": u.email,
            }
            for u in users
        ]

       
        products = Product.objects.all()
        products_data = [
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
            }
            for p in products
        ]

        
        orders = Order.objects.prefetch_related("items__product")
        orders_data = []

        for order in orders:
            orders_data.append({
                "id": order.id,
                "user_email": order.user.email,
                "products": [
                    {
                        "id": item.product.id,
                        "name": item.product.name,
                        "price": item.price,
                        "quantity": item.quantity,
                    }
                    for item in order.items.all()
                ]
            })

        return Response({
            "users": users_data,
            "products": products_data,
            "orders": orders_data,
        })




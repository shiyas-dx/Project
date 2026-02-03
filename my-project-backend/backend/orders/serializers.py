from rest_framework import serializers
from .models import Order, OrderItem
from django.contrib.auth.models import User



class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        exclude = ["user"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        order = Order.objects.create(user=user, **validated_data)

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order

class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["product_name", "quantity", "price"]


class AdminOrderSerializer(serializers.ModelSerializer):
    userEmail = serializers.EmailField(source="user.email", read_only=True)
    userId = serializers.IntegerField(source="user.id", read_only=True)
    products = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "userEmail",
            "userId",
            "status",
            "total_amount",
            "payment_method",
            "name",
            "address",
            "pincode",
            "created_at",
            "products",
        ]

    def get_products(self, obj):
        return [
            {
                "name": item.product.name,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in obj.items.all()
        ]
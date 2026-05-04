package com.example.demo.entity;

public enum PodOrderStatus {
    /** شراء تم؛ في انتظار التسليم أو إجراء الزبون */
    PENDING_DELIVERY,
    /** الزبون أكد الاستلام؛ القميص أُنشئ في قاعدة البيانات */
    FULFILLED,
    /** شكوى مفتوحة في انتظار رد الإدارة */
    COMPLAINT_FILED,
    /** الإدارة ردت على الشكوى */
    COMPLAINT_ANSWERED
}

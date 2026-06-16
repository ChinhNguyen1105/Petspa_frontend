export const URL_CONSTANT = {
  ForgetPassword: {
    PREFIX: '/forget-password',
    VERIFY_EMAIL: '/forget-password/email-verification/{email}',
    VERIFY_OTP: '/forget-password/otp-verification',
    CHANGE_PASSWORD: '/forget-password/password-update/{email}',
  },

  Auth: {
    PREFIX: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },

  Role: {
  PREFIX: "/roles",

  CREATE_ROLE: "/roles",
  UPDATE_ROLE: "/roles",

  GET_ALL_ROLES: "/roles",
  GET_ROLE_BY_ID: "/roles/{id}",

  DELETE_ROLE: "/roles/{id}",
  },
  
  Permission: {
  PREFIX: "/permissions",

  CREATE_PERMISSION: "/permissions",
  UPDATE_PERMISSION: "/permissions",

  GET_ALL_PERMISSIONS: "/permissions",
  GET_PERMISSION_BY_ID: "/permissions/{id}",

  DELETE_PERMISSION: "/permissions/{id}",
},

  User: {
    PREFIX: '/users',
    GET_USERS: '/users',
    GET_USER: '/users/{id}',
    GET_CURRENT_USER: '/users/current',
    CREATE_USER: '/users',
    UPDATE_USER: '/users',
    DELETE_USER: '/users/{id}',
    CHANGE_USER_STATUS: '/users/{id}/status',
  },

  Product: {
    PREFIX: '/products',
    GET_PRODUCTS: '/products',
    GET_PRODUCT: '/products/{id}',
    CREATE_PRODUCT: '/products',
    UPDATE_PRODUCT: '/products',
    DELETE_PRODUCT: '/products/{id}',
    GET_RECOMMENDATIONS: "/products/recommendations"
  },

  ProductImages: {
    PREFIX: '/product-images',
    ADD_IMAGES: '/product-images',
    DELETE_IMAGE: '/product-images/{id}',
    SET_MAIN_IMAGE: '/product-images/set-main-image',
    GET_IMAGES: "/product-images/{productId}"
  },

  Inventory: {
    PREFIX: '/inventories',
    IMPORT_PRODUCT: '/inventories/import',
    EXPORT_PRODUCT: '/inventories/export',
    ADJUST_PRODUCT: '/inventories/adjust',
    GET_INVENTORY_BY_PRODUCT_ID: '/inventories/{id}',
    GET_INVENTORY_TRANSACTION_HISTORY: '/inventories/transaction-history',
  },

  Cart: {
    PREFIX: '/cart',
    GET_CART: '/cart',
    DELETE_CART: '/cart',
  },

  CartItem: {
    PREFIX: '/cart-items',
    ADD_CART_ITEM: '/cart-items',
    UPDATE_CART_ITEM: '/cart-items',
    DELETE_CART_ITEM: '/cart-items/{id}',
  },

  ShippingAddress: {
    PREFIX: '/shipping-addresses',
    CREATE_SHIPPING_ADDRESS: '/shipping-addresses',
    GET_SHIPPING_ADDRESSES: '/shipping-addresses',
    SET_DEFAULT_ADDRESS: '/shipping-addresses/{id}/default',
    UPDATE_SHIPPING_ADDRESS: '/shipping-addresses',
    DELETE_SHIPPING_ADDRESS: '/shipping-addresses/{id}',
  },

  Order: {
    PREFIX: '/orders',
    ADMIN_PREFIX: '/admin/orders',
    CREATE_ORDER_FROM_CART: '/orders/from-cart',
    CREATE_ORDER_FROM_BUY_NOW: '/orders/buy-now',
    GET_MY_ORDERS: '/orders/my-orders',
    GET_ORDER_DETAIL: '/orders/{id}',
    CANCEL_ORDER: '/orders/{id}/cancel',
    GET_ORDER_STATUS_HISTORY: '/orders/{id}/status-history',
    GET_ALL_ORDERS: '/admin/orders',
    UPDATE_ORDER_STATUS: '/admin/orders/status',
  },

  Pet: {
    PREFIX: '/pets',
    ADMIN_PREFIX: '/admin/pets',
    GET_MY_PETS: '/pets/my-pets',
    GET_PET_DETAIL: '/pets/{id}',
    CREATE_PET: '/pets',
    UPDATE_PET: '/pets',
    DELETE_PET: '/pets/{id}',
    GET_ALL_PETS: '/admin/pets',
    PATCH_DEACTIVATE_PET: '/admin/pets/{id}/deactivate',
    PATCH_ACTIVATE_PET: '/admin/pets/{id}/activate',
  },

  PetService: {
    PREFIX: '/services',
    CREATE_SERVICE: '/services',
    UPDATE_SERVICE: '/services',
    GET_SERVICE: '/services/{id}',
    GET_ALL_SERVICES: '/services',
    SEARCH_SERVICES: '/services/search',
    GET_SERVICES_BY_CATEGORY: '/services/category/{categoryId}',
    DELETE_SERVICE: '/services/{id}',
    GET_TOP_SERVICES: '/services/top',
    GET_RECOMMENDATIONS: "services/recommendations"
  },

  ProductReview: {
    PREFIX: '/product-reviews',
    ADMIN_PREFIX: '/admin/product-reviews',
    GET_REVIEWS_BY_PRODUCT: '/product-reviews/{productId}',
    CREATE_REVIEW: '/product-reviews',
    UPDATE_REVIEW: '/product-reviews',
    DELETE_REVIEW: '/product-reviews/{reviewId}',
    GET_ALL_REVIEWS: '/admin/product-reviews',
  },

  PetServiceImages: {
    PREFIX: '/service-images',
    ADD_IMAGES: '/service-images',
    DELETE_IMAGE: '/service-images/{id}',
    GET_SERVICE_IMAGES: '/service-images/service/{serviceId}',
    SET_MAIN_IMAGE: '/service-images/set-main-image',
  },

  PetServiceReviews: {
    PREFIX: '/service-reviews',
    CREATE_REVIEW: '/service-reviews',
    DELETE_REVIEW: '/service-reviews/{id}',
    GET_SERVICE_REVIEWS: '/service-reviews/service/{serviceId}',
    GET_AVERAGE_RATING: '/service-reviews/{serviceId}/average-rating',
    GET_REVIEW_COUNT: '/service-reviews/{serviceId}/count',
  },

  Booking: {
    PREFIX: '/bookings',
    CREATE_BOOKING: '/bookings',
    GET_BOOKING: '/bookings/{id}',
    GET_MY_BOOKINGS: '/bookings/my-bookings',
    GET_BOOKINGS_BY_STATUS: '/bookings/by-status',
    GET_ALL_BOOKINGS: '/bookings/all',
    CANCEL_BOOKING: '/bookings/{id}/cancel',
    UPDATE_BOOKING_STATUS: '/bookings/{id}/status',
    GET_BOOKED_TIMES: "bookings/occupied-times"
  },

  Category: {
    PREFIX: '/categories',
    GET_CATEGORIES: '/categories',
    GET_CATEGORY: '/categories/{id}',
    CREATE_CATEGORY: '/categories',
    UPDATE_CATEGORY: '/categories',
    DELETE_CATEGORY: '/categories/{id}',
  },

  Menu: {
    PREFIX: '/menus',
    CREATE_MENU: '/menus',
    UPDATE_MENU: '/menus/{id}',
    GET_MENU: '/menus/{id}',
    GET_ALL_MENUS: '/menus',
    SEARCH_MENUS: '/menus/search',
    GET_MENUS_BY_CATEGORY: '/menus/category/{categoryId}',
    DELETE_MENU: '/menus/{id}',
    GET_MENUS_TREE: '/menus/tree',
    GET_ACTIVE_MENUS: '/menus/active',
  },

  Payment: {
    PREFIX: '/payment/vnpay',
    CREATE_PAYMENT: '/payment/vnpay/create',
    HANDLE_RETURN: '/payment/vnpay/return',
  },
};
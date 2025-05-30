import { Repository, GraphData, Documentation, ErrorData } from '../types';

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    url: 'https://github.com/company/ecommerce',
    stats: {
      files: 358,
      classes: 124,
      functions: 892,
      errors: 23,
      churn: 78,
      docCoverage: 42
    },
    lastUpdated: '2025-03-14T12:00:00Z'
  },
  {
    id: '2',
    name: 'Backend API',
    url: 'https://github.com/company/backend-api',
    stats: {
      files: 214,
      classes: 76,
      functions: 548,
      errors: 15,
      churn: 34,
      docCoverage: 68
    },
    lastUpdated: '2025-03-12T09:30:00Z'
  },
  {
    id: '3',
    name: 'Mobile App',
    url: 'https://github.com/company/mobile-app',
    stats: {
      files: 183,
      classes: 57,
      functions: 412,
      errors: 8,
      churn: 45,
      docCoverage: 51
    },
    lastUpdated: '2025-03-10T16:45:00Z'
  }
];

export const mockGraphData: GraphData = {
  nodes: [
    { id: 'n1', name: 'UserService', type: 'class', errors: 5, churn: 23, size: 400 },
    { id: 'n2', name: 'AuthController', type: 'class', errors: 3, churn: 15, size: 350 },
    { id: 'n3', name: 'ProductRepository', type: 'class', errors: 0, churn: 8, size: 280 },
    { id: 'n4', name: 'OrderProcessor', type: 'class', errors: 7, churn: 31, size: 450 },
    { id: 'n5', name: 'PaymentGateway', type: 'class', errors: 4, churn: 12, size: 320 },
    { id: 'n6', name: 'NotificationService', type: 'class', errors: 1, churn: 9, size: 300 },
    { id: 'n7', name: 'Logger', type: 'class', errors: 0, churn: 5, size: 180 },
    { id: 'n8', name: 'CartManager', type: 'class', errors: 2, churn: 18, size: 350 },
    { id: 'n9', name: 'ProductService', type: 'class', errors: 1, churn: 14, size: 320 },
    { id: 'n10', name: 'DatabaseConnector', type: 'class', errors: 0, churn: 7, size: 220 },
    { id: 'n11', name: 'ErrorHandler', type: 'class', errors: 0, churn: 6, size: 200 },
    { id: 'n12', name: 'ConfigManager', type: 'class', errors: 0, churn: 4, size: 150 }
  ],
  links: [
    { source: 'n1', target: 'n2', value: 3 },
    { source: 'n2', target: 'n7', value: 2 },
    { source: 'n1', target: 'n10', value: 5 },
    { source: 'n3', target: 'n10', value: 4 },
    { source: 'n4', target: 'n3', value: 3 },
    { source: 'n4', target: 'n5', value: 5 },
    { source: 'n4', target: 'n6', value: 2 },
    { source: 'n5', target: 'n11', value: 1 },
    { source: 'n6', target: 'n7', value: 2 },
    { source: 'n8', target: 'n9', value: 4 },
    { source: 'n9', target: 'n3', value: 3 },
    { source: 'n8', target: 'n4', value: 2 },
    { source: 'n2', target: 'n12', value: 1 },
    { source: 'n10', target: 'n12', value: 1 }
  ]
};

export const mockDocumentation: Record<string, Documentation> = {
  'n1': {
    id: 'n1',
    name: 'UserService',
    type: 'class',
    description: 'Core service handling user management, authentication, and profile operations.',
    usageNotes: 'Inject this service where user operations are needed. Handles user creation, retrieval, and profile updates.',
    examples: [
      '```typescript\n// Create a new user\nconst newUser = await userService.createUser({\n  email: "user@example.com",\n  password: "securePassword",\n  name: "John Doe"\n});\n```',
      '```typescript\n// Get user by ID\nconst user = await userService.getUserById("user-123");\n```',
      '```typescript\n// Update user profile\nawait userService.updateProfile("user-123", {\n  name: "John Smith",\n  avatar: "https://example.com/avatar.jpg"\n});\n```'
    ]
  },
  'n4': {
    id: 'n4',
    name: 'OrderProcessor',
    type: 'class',
    description: 'Handles the full lifecycle of order processing, from creation to fulfillment.',
    usageNotes: 'This is a high-complexity class with many dependencies. Consider using the OrderFacade for simpler operations.',
    examples: [
      '```typescript\n// Create a new order\nconst order = await orderProcessor.createOrder({\n  userId: "user-123",\n  items: [\n    { productId: "prod-1", quantity: 2 },\n    { productId: "prod-2", quantity: 1 }\n  ],\n  shippingAddress: address\n});\n```',
      '```typescript\n// Process payment for an order\nconst paymentResult = await orderProcessor.processPayment(order.id, paymentDetails);\n```',
      '```typescript\n// Fulfill an order\nawait orderProcessor.fulfillOrder(order.id);\n```'
    ]
  }
};

export const mockErrors: ErrorData[] = [
  {
    id: 'e1',
    message: 'NullPointerException in UserService.updateProfile',
    count: 43,
    lastOccurred: '2025-03-14T08:23:45Z',
    stackTrace: 'at UserService.updateProfile(UserService.java:156)\nat UserController.handleProfileUpdate(UserController.java:78)\nat...',
    relatedFiles: ['n1']
  },
  {
    id: 'e2',
    message: 'Database connection timeout in OrderProcessor.createOrder',
    count: 27,
    lastOccurred: '2025-03-13T19:12:33Z',
    stackTrace: 'at OrderProcessor.createOrder(OrderProcessor.java:92)\nat OrderController.createNewOrder(OrderController.java:45)\nat...',
    relatedFiles: ['n4', 'n10']
  },
  {
    id: 'e3',
    message: 'Payment gateway rejection in PaymentGateway.processPayment',
    count: 18,
    lastOccurred: '2025-03-14T02:55:11Z',
    stackTrace: 'at PaymentGateway.processPayment(PaymentGateway.java:211)\nat OrderProcessor.finalizeOrder(OrderProcessor.java:154)\nat...',
    relatedFiles: ['n5', 'n4']
  }
];
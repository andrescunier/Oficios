/**
 * Tipos TypeScript para la API de SIGP
 */

// Tipos base
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Account
export interface Account extends BaseEntity {
  name: string;
  slug: string;
  default_currency: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
}

// Person
export interface Person extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  metadata?: Record<string, any>;
}

// User
export interface User extends BaseEntity {
  person_id: string;
  email: string;
  username: string;
  role: 'owner' | 'admin' | 'user' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  person?: Person;
}

// Business Partner (Cliente)
export interface BusinessPartner extends BaseEntity {
  name: string;
  partner_type: 'customer' | 'supplier' | 'both';
  person_id?: string;
  tax_id?: string;
  default_currency: string;
  metadata?: Record<string, any>;
  person?: Person;
}

// Product
export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  currency: string;
  tax_rate: number;
  metadata?: Record<string, any>;
  product_type?: string;
  has_variants?: boolean;
  stock_unit?: string;
  stock_min?: number;
  stock_max?: number | null;
  track_inventory?: boolean;
  allow_backorders?: boolean;
  thumbnail_url?: string | null;
  gallery_urls?: string[];
  // Campos adicionales para ecommerce
  image_url?: string;
  category?: string;
  stock_quantity?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ProductVariantOptionValue {
  value: string;
  label: string;
  position: number;
}

export interface ProductVariantOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: ProductVariantOptionValue[];
}

export interface ProductVariant extends BaseEntity {
  product_id: string;
  sku: string;
  name: string;
  option_values: Record<string, string>;
  barcode?: string | null;
  unit_price?: number | null;
  effective_price: number;
  cost_price?: number | null;
  stock_quantity: number;
  stock_min: number;
  stock_max?: number | null;
  track_inventory: boolean;
  allow_backorders: boolean;
  weight?: number | null;
  image_url?: string | null;
  status: string;
  position: number;
  metadata?: Record<string, any>;
  version: number;
}

// Sales Order Item
export interface SalesOrderItem {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  product?: Product;
}

// Sales Order
export interface SalesOrder extends BaseEntity {
  order_number: string;
  customer_id: string;
  currency: string;
  status: 'draft' | 'pending_payment' | 'payment_review' | 'confirmed' | 'preparing' | 'ready_to_ship' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'return_requested' | 'return_in_transit' | 'returned' | 'refunded';
  items: SalesOrderItem[];
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  metadata?: Record<string, any>;
  customer?: BusinessPartner;
}

// Delivery
export interface Delivery extends BaseEntity {
  sales_order_id: string;
  delivery_number: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  metadata?: Record<string, any>;
  sales_order?: SalesOrder;
}

// Invoice
export interface Invoice extends BaseEntity {
  invoice_number: string;
  sales_order_id: string;
  customer_id: string;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_at: string;
  paid_at?: string;
  metadata?: Record<string, any>;
  sales_order?: SalesOrder;
  customer?: BusinessPartner;
}

// Payment
export interface Payment extends BaseEntity {
  payment_number: string;
  source_type: 'customer' | 'supplier';
  partner_id: string;
  currency: string;
  amount: number;
  method: 'cash' | 'credit_card' | 'debit_card' | 'wire_transfer' | 'check' | 'other';
  reference?: string;
  status: 'pending' | 'received' | 'failed' | 'cancelled';
  partner?: BusinessPartner;
}

// Payment Application
export interface PaymentApplication extends BaseEntity {
  payment_id: string;
  invoice_id: string;
  amount_applied: number;
  payment?: Payment;
  invoice?: Invoice;
}

// Auth Token Response
export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Error Response
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Request Types
export interface CreateAccountRequest {
  name: string;
  slug: string;
  default_currency: string;
  timezone: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface CreatePersonRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface CreateUserRequest {
  person_id: string;
  email: string;
  username: string;
  password_hash: string;
  role: 'owner' | 'admin' | 'user';
  status: 'active' | 'inactive';
}

export interface CreateBusinessPartnerRequest {
  name: string;
  partner_type: 'customer' | 'supplier' | 'both';
  person_id?: string;
  tax_id?: string;
  default_currency: string;
  metadata?: Record<string, any>;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  currency: string;
  tax_rate: number;
  metadata?: Record<string, any>;
}

export interface CreateSalesOrderRequest {
  order_number: string;
  customer_id: string;
  currency: string;
  status: 'draft';
  items: Omit<SalesOrderItem, 'product'>[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateDeliveryRequest {
  sales_order_id: string;
  delivery_number: string;
  status: 'pending' | 'in_transit';
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  invoice_number: string;
  due_at: string;
  status: 'draft';
  metadata?: Record<string, any>;
}

export interface CreatePaymentRequest {
  payment_number: string;
  source_type: 'customer' | 'supplier';
  partner_id: string;
  currency: string;
  amount: number;
  method: 'cash' | 'credit_card' | 'debit_card' | 'wire_transfer' | 'check' | 'other';
  reference?: string;
  status: 'pending' | 'received';
}

export interface CreatePaymentApplicationRequest {
  invoice_id: string;
  amount_applied: number;
}

// Ecommerce specific types
export interface CartItem {
  line_id: string;
  product: Product;
  variant?: ProductVariant;
  selected_options?: Record<string, string>;
  quantity: number;
  unit_price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
}

export interface CheckoutData {
  customer: CreateBusinessPartnerRequest;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: {
    type: 'credit_card' | 'debit_card' | 'wire_transfer';
    details: Record<string, any>;
  };
}

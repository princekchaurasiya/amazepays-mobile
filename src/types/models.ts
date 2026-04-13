/** Mirrors `formatUser` from API AuthController */
export type User = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  two_factor_enabled?: boolean;
  transaction_pin_set?: boolean;
  roles?: string[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  thumbnail?: string | null;
};

export type StorefrontBrand = {
  id: number;
  name: string;
  slug?: string;
  logo?: string | null;
};

/** Product row from catalog list/detail (Laravel toArray + resolved fields) */
export type Product = {
  id: number;
  sku: string;
  product_name?: string | null;
  name?: string | null;
  slug?: string | null;
  brand?: StorefrontBrand | null;
  brand_id?: number | null;
  brandName?: string | null;
  categories?: Category[];
  images?: unknown;
  selling_price?: string | number | null;
  mrp?: string | number | null;
  denomination?: string | number | null;
  discount_percentage?: string | number | null;
  currency?: string;
  out_of_stock?: boolean;
  show_product?: boolean;
  description?: string | null;
  terms_and_conditions?: string | null;
  how_to_redeem?: string | null;
  resolved_image_url?: string | null;
  /** Detail-only */
  resolved?: {
    image_url?: string | null;
    gallery_urls?: string[];
    description?: string | null;
    terms?: string | null;
    how_to_redeem?: string | null;
  };
};

export type ProductPriceType = 'RANGE' | 'SLAB' | 'FIXED';

export type CartItem = {
  productId: number;
  sku: string;
  name: string;
  imageUrl?: string | null;
  denomination: number;
  quantity: number;
};

export type Offer = {
  id: number;
  name: string;
  code: string;
  type: string;
  discount_value?: number | null;
  discount_percentage?: number | null;
  min_order_value?: number | null;
  max_discount?: number | null;
  start_date?: string;
  end_date?: string;
  description?: string | null;
};

export type Slide = {
  id: number;
  desktop_image?: string | null;
  image_mobile?: string | null;
  big_header?: string | null;
  small_header?: string | null;
  cta_link?: string | null;
  link_type?: string | null;
};

export type Order = {
  id: number;
  order_number?: string | null;
  merchant_order_id?: string | null;
  status?: string | null;
  order_status?: string | null;
  product_id?: number | null;
  product_name?: string | null;
  sku?: string | null;
  denomination?: string | number | null;
  quantity?: number | null;
  grand_total?: string | number | null;
  grand_payable_amount?: string | number | null;
  payment_method?: string | null;
  voucher_code?: string | null;
  voucher_pin?: string | null;
  expiry_date?: string | null;
  created_at?: string;
  receiver_name?: string | null;
  receiver_email?: string | null;
  receiver_mobile?: string | null;
  receiver_msg?: string | null;
};

export type WalletBalance = {
  balance: number;
  currency: string;
  is_frozen: boolean;
};

export type WalletTransaction = {
  id: number;
  wallet_id?: number;
  type?: string;
  amount?: string | number;
  balance_after?: string | number;
  description?: string | null;
  reference?: string | null;
  created_at?: string;
};

export type PlaceOrderPayload = {
  product_id: number;
  quantity: number;
  denomination: number;
  payment_method: 'wallet' | 'ccavenue' | 'unlimit' | 'razorpay';
  offer_code?: string;
  gift_send_option?: 'send_as_gift' | 'buy_for_self';
  receiver_name?: string;
  receiver_email?: string;
  receiver_mobile?: string;
  receiver_msg?: string;
};

export type PlaceOrderPaymentInfo = {
  success?: boolean;
  redirect_url?: string | null;
  payment_token?: string | null;
  gateway_order_id?: string | null;
  error?: string | null;
};

export type PlaceOrderResult = {
  order_id: number;
  order_number?: string;
  grand_total?: string | number;
  status?: string;
  payment?: PlaceOrderPaymentInfo;
};

export type VoucherReveal = {
  voucher_code?: string | null;
  pin?: string | null;
  expiry_date?: string | null;
  product_name?: string | null;
  viewed_at?: string;
};

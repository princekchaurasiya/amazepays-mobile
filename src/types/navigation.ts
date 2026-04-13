export type HomeStackParams = {
  product: { id: string };
  checkout: undefined;
  payment: { redirectUrl: string; orderId: string };
  order: { id: string };
  voucher: { id: string };
};

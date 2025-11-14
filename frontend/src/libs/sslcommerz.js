import SSLCommerzPayment from 'sslcommerz-lts';

const sslCommerzConfig = {
  store_id: process.env.SSLCOMMERZ_STORE_ID,
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
  is_live: false, // true for live, false for sandbox
};

export { SSLCommerzPayment, sslCommerzConfig };

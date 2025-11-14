export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: number | string;
  discountedPrice?: number | string;
  brand: string;
  color: string;
  material: string;
  compatibleDevices: string;
  screenSize: string;
  dimensions: string;
  batteryLife?: string;
  sensorType?: string;
  batteryDescription?: string;
  features: string[];
  imageUrls: string[];
  isInStock: boolean;
}

export const mockProducts: ProductFormData[] = [
  {
    id: '1',
    name: 'Smartphone X',
    description: 'A high-performance smartphone with advanced features.',
    price: 699.99,
    discountedPrice: 649.99,
    brand: 'TechTrend',
    color: 'Midnight Black',
    material: 'Aluminum and Glass',
    compatibleDevices: 'Bluetooth, Wi-Fi devices',
    screenSize: '6.5 inches',
    dimensions: '158 x 73 x 8 mm',
    batteryLife: '4000 mAh',
    batteryDescription: 'Lithium-ion',
    features: ['5G Support', 'Wireless Charging', 'Water Resistant'],
    imageUrls: [
      'https://example.com/images/smartphone-x-1.jpg',
      'https://example.com/images/smartphone-x-2.jpg',
    ],
    isInStock: true,
  },
  {
    id: '2',
    name: 'Wireless Earbuds Pro',
    description: 'True wireless earbuds with noise cancellation.',
    price: 149.99,
    brand: 'SoundWave',
    color: 'White',
    material: 'Plastic',
    compatibleDevices: 'iOS, Android',
    screenSize: 'N/A',
    dimensions: '25 x 20 x 15 mm (per earbud)',
    batteryLife: '24 hours (with case)',
    batteryDescription: 'Rechargeable',
    features: ['Active Noise Cancellation', 'Touch Controls', 'IPX4'],
    imageUrls: [
      'https://example.com/images/earbuds-pro-1.jpg',
      'https://example.com/images/earbuds-pro-2.jpg',
    ],
    isInStock: false,
  },
  {
    id: '3',
    name: 'Smartwatch Z',
    description: 'A sleek smartwatch with fitness tracking capabilities.',
    price: 249.99,
    discountedPrice: 229.99,
    brand: 'FitTech',
    color: 'Silver',
    material: 'Stainless Steel',
    compatibleDevices: 'iOS, Android',
    screenSize: '1.4 inches',
    dimensions: '44 x 38 x 11 mm',
    batteryLife: '14 days',
    sensorType: 'Heart Rate, SpO2',
    features: ['Fitness Tracking', 'Sleep Monitoring', 'Waterproof'],
    imageUrls: [
      'https://example.com/images/smartwatch-z-1.jpg',
      'https://example.com/images/smartwatch-z-2.jpg',
    ],
    isInStock: true,
  },
];

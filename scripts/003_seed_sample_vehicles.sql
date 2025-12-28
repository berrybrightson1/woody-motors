-- Seed sample vehicles for the Woody Motors showroom
-- Mix of Foreign Used and Brand New vehicles with trust badges

-- Foreign Used Luxury Vehicles
INSERT INTO public.vehicles (
  make, model, year, price, mileage, transmission, fuel_type, engine_size,
  description, status, condition, is_duty_paid, vin_verified, features, images
) VALUES
(
  'Mercedes-Benz', 'S-Class S500', 2021, 45000.00, 28000, 'Automatic', 'Petrol', '3.0L V6',
  'Luxurious flagship sedan with cutting-edge technology and supreme comfort. Imported from Germany with full service history.',
  'available', 'foreign_used', true, true,
  ARRAY['Leather Interior', 'Sunroof', 'Navigation', 'Parking Sensors', 'Heated Seats'],
  ARRAY['/luxury-mercedes-s-class-black.jpg']
),
(
  'BMW', 'M5 Competition', 2020, 52000.00, 35000, 'Automatic', 'Petrol', '4.4L V8',
  'High-performance luxury sedan with 617 horsepower. Perfect blend of comfort and raw power.',
  'available', 'foreign_used', true, true,
  ARRAY['M Sport Package', 'Carbon Fiber Trim', 'Harman Kardon Sound', 'Adaptive Suspension'],
  ARRAY['/bmw-m5-competition-blue.jpg']
),
(
  'Audi', 'RS7 Sportback', 2019, 48000.00, 42000, 'Automatic', 'Petrol', '4.0L V8',
  'Stunning sportback design with incredible performance. Twin-turbo V8 beast in pristine condition.',
  'available', 'foreign_used', true, true,
  ARRAY['Dynamic Ride Control', 'Matrix LED Headlights', 'Bang & Olufsen Sound', '21" Alloy Wheels'],
  ARRAY['/audi-rs7-sportback-grey.jpg']
),
(
  'Porsche', 'Panamera Turbo', 2020, 75000.00, 22000, 'Automatic', 'Petrol', '4.0L V8',
  'Executive sports car with breathtaking performance. German engineering at its finest.',
  'available', 'foreign_used', false, true,
  ARRAY['Sport Chrono Package', 'Air Suspension', 'Bose Surround Sound', 'Panoramic Roof'],
  ARRAY['/porsche-panamera-turbo-white.jpg']
),
(
  'Range Rover', 'Autobiography', 2021, 62000.00, 18000, 'Automatic', 'Diesel', '3.0L V6',
  'Ultimate luxury SUV with commanding presence. Perfect for Nigerian roads with all-terrain capability.',
  'available', 'foreign_used', true, true,
  ARRAY['Meridian Sound System', 'Massage Seats', 'Wade Sensing', 'Terrain Response 2'],
  ARRAY['/range-rover-autobiography.jpg']
);

-- Brand New Vehicles
INSERT INTO public.vehicles (
  make, model, year, price, mileage, transmission, fuel_type, engine_size,
  description, status, condition, is_duty_paid, vin_verified, features, images
) VALUES
(
  'Toyota', 'Camry XLE', 2024, 32000.00, 0, 'Automatic', 'Petrol', '2.5L I4',
  'Brand new 2024 Camry with factory warranty. Reliable, fuel-efficient, and loaded with features.',
  'available', 'brand_new', true, true,
  ARRAY['Apple CarPlay', 'Blind Spot Monitor', 'Lane Departure Warning', 'Wireless Charging'],
  ARRAY['/toyota-camry-2024.jpg']
),
(
  'Lexus', 'ES 350', 2024, 48000.00, 0, 'Automatic', 'Petrol', '3.5L V6',
  'Brand new luxury sedan with Lexus reliability. Factory-fresh with full manufacturer warranty.',
  'available', 'brand_new', true, true,
  ARRAY['Mark Levinson Audio', 'Adaptive Cruise Control', 'Panoramic View Monitor', 'Premium Leather'],
  ARRAY['/lexus-es-350-2024.jpg']
),
(
  'Honda', 'Accord Touring', 2024, 35000.00, 0, 'Automatic', 'Petrol', '1.5L Turbo',
  'All-new 2024 Accord with turbocharged power. Perfect balance of performance and efficiency.',
  'available', 'brand_new', true, true,
  ARRAY['Honda Sensing', 'Wireless Android Auto', 'Heated & Ventilated Seats', 'Head-Up Display'],
  ARRAY['/honda-accord-2024.jpg']
),
(
  'Mercedes-Benz', 'GLE 450', 2024, 85000.00, 0, 'Automatic', 'Petrol', '3.0L I6',
  'Brand new luxury SUV straight from the factory. Premium comfort meets cutting-edge technology.',
  'available', 'brand_new', true, true,
  ARRAY['MBUX Infotainment', 'Air Body Control', 'Burmester Sound', '360-degree Camera'],
  ARRAY['/mercedes-gle-450-2024.jpg']
),
(
  'BMW', 'X5 M50i', 2024, 92000.00, 0, 'Automatic', 'Petrol', '4.4L V8',
  'Factory-fresh M Performance SUV. Zero mileage with full warranty and service package.',
  'available', 'brand_new', true, true,
  ARRAY['M Sport Exhaust', 'Laser Lights', 'Gesture Control', 'Sky Lounge Panoramic Roof'],
  ARRAY['/bmw-x5-m50i-2024.jpg']
);

-- Additional Foreign Used vehicles (with some without duty paid to show badge variation)
INSERT INTO public.vehicles (
  make, model, year, price, mileage, transmission, fuel_type, engine_size,
  description, status, condition, is_duty_paid, vin_verified, features, images
) VALUES
(
  'Jaguar', 'F-Pace SVR', 2019, 38000.00, 45000, 'Automatic', 'Petrol', '5.0L V8',
  'Performance SUV with supercharged V8 roar. Contact us for duty clearance options.',
  'available', 'foreign_used', false, true,
  ARRAY['Sport Seats', 'Adaptive Dynamics', 'Meridian Sound', 'Configurable Dynamics'],
  ARRAY['/jaguar-f-pace-svr.jpg']
),
(
  'Maserati', 'Ghibli S Q4', 2020, 42000.00, 32000, 'Automatic', 'Petrol', '3.0L V6',
  'Italian luxury and performance. Currently being processed for duty clearance.',
  'available', 'foreign_used', false, false,
  ARRAY['Sport Skyhook Suspension', 'Harman Kardon Audio', 'Red Brake Calipers', 'Carbon Fiber Interior'],
  ARRAY['/maserati-ghibli-2020.jpg']
);

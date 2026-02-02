UPDATE products 
SET price = CASE 
  WHEN name = 'Organic Kale Bunch' THEN 249.00
  WHEN name = 'Organic Quinoa 500g' THEN 599.00
  WHEN name = 'Organic Almond Butter' THEN 899.00
  WHEN name = 'Organic Baby Spinach' THEN 199.00
  ELSE price 
END,
"compareAtPrice" = CASE 
  WHEN name = 'Organic Quinoa 500g' THEN 799.00
  ELSE "compareAtPrice"
END;

SELECT name, price, "compareAtPrice" FROM products;

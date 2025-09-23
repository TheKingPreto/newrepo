SELECT * FROM inventory;
SELECT inv_id, inv_make, inv_model, inv_image, inv_thumbnail 
FROM public.inventory 
LIMIT 10;
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/vehicles/vehicles/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/vehicles/vehicles/', '/images/vehicles/');
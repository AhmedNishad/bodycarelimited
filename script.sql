delimiter //
 CREATE TRIGGER update_stock
  AFTER INSERT ON 
  orderset 
  FOR EACH ROW 
  IF NEW.age < 0 THEN SET NEW.age = 0; END IF;//
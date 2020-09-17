DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude decimal,
  longitude decimal
);

INSERT INTO locations (search_query) VALUES ('Tokyo');

SELECT * FROM locations;
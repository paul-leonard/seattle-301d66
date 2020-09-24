-- create the new author table
CREATE TABLE author (id SERIAL PRIMARY KEY, name VARCHAR(255));

-- select the distinct authors from the books table and insert into the author table
INSERT INTO author (name) SELECT DISTINCT author FROM books;

-- Alter the books table to include a field for author id
ALTER TABLE books ADD COLUMN author_id INT;

-- Retrieve the primary key on each author and fill in with the author id from the author table
UPDATE books SET author_id=author.id FROM (SELECT * FROM author) AS author WHERE books.author = author.name;

-- remove the author column 
ALTER TABLE books DROP COLUMN author;

-- make the author_id a foregin key 
ALTER TABLE books ADD CONSTRAINT fk_authors FOREIGN KEY (author_id) REFERENCES author(id);
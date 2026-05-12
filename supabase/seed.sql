INSERT INTO public.subjects(subject_number, display_title)
VALUES ('SCI', 'Science');

INSERT INTO public.categories(category_number, subject_number, display_title, description)
VALUES ('CHEM', 'SCI', 'Chemistry', 'Chemistry playgrounds.');

INSERT INTO public.playgrounds(playground_number, category_number, version, author, display_title, description)
VALUES ('PVNRT-001', 'CHEM', 1, 'John Doe', 'Ideal Gas Law', 'Pressure value is derived from simulated gas molecules colliding with the walls of a closed container.');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";




---------------- Users ----------------
CREATE TABLE public.users(
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    display_name TEXT
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can edit their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Disallow updating specific fields
CREATE FUNCTION verify_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    NEW.id = OLD.id;
    NEW.created_at = OLD.created_at;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
CREATE TRIGGER verify_user_update_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION verify_user_update();

-- auth.users
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users(id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;
CREATE TRIGGER handle_new_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;




-- Storage buckets
INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Users can create their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND owner_id = auth.uid()::text
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND owner_id = auth.uid()::text
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars'
    AND owner_id = auth.uid()::text
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND owner_id = auth.uid()::text
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view any avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'avatars'
);
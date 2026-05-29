"use server"

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/lib/supabase/database.types";
import { Bucket } from "@supabase/storage-js";

const SIGNED_URL_EXPIRY_SEC = 5 * 60;

export interface GradientException extends Error {
    message: string,
}


type LoginResult = { success: true, user: User } | { success: false, error: GradientException };

export async function login(email: string, password: string): Promise<LoginResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error != null) {
        return {
            success: false,
            error: { message: error.message, name: error.name }
        };
    }

    return { success: true, user: data.user };

}

type SignUpResult = { success: true, user: User } | { success: false, error: GradientException };
export async function signUp(email: string, password: string): Promise<SignUpResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error != null) {
        return {
            success: false,
            error: { message: error.message, name: error.name }
        };
    }

    return await login(email, password);

}

export async function logOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}


export async function fetchCurrentUserProfile() {
    const supabase = await createClient();
    let authUser: User | null;
    {

        const { data: { user } } = await supabase.auth.getUser();
        authUser = user;
    }
    let user: Tables<'users'> | null;
    if (authUser != null) {
        const { data, error } = await fetchUserProfile(authUser.id);
        if (error != undefined) {
            console.error(JSON.stringify(error));
            user = null;
        } else {
            user = data!;
        }
    } else {
        user = null;
    }

    return user;
}

export async function fetchUserProfile(authUserId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.from("users").select().eq("id", authUserId);

    if (error != null) {
        return {
            success: false,
            error: { message: error.message }
        };
    }
    if (data.length != 1) {
        return { success: false, error: { message: "Error fetching your profile. " + data } };
    }

    return { success: true, data: data[0] };
}

export async function fetchUserAvatar(userId: string) {
    const supabase = await createClient();
    const bucket = supabase.storage.from("avatars");
    let path = null;
    {
        const { data, error } = await bucket.list(_userIdAvatarFolderPath(userId));

        if (error != null) {
            console.error(error);
            return null;
        } else {
            if (data.length == 0) {
                return null;
            }
            for (const object of data) {
                // supabase storage bug where uploading doesnt remove the ghost `.emptyFolderPlaceholder` element
                if (object.id != null && (object.name.split("/").pop() !== ".emptyFolderPlaceholder")) {
                    path = `${_userIdAvatarFolderPath(userId)}/${object.name}`;
                    break;
                }
            }

        }
    }
    if (path != null) {
        const { data, error } = await bucket.createSignedUrl(path, SIGNED_URL_EXPIRY_SEC);
        if (error) {
            console.error(error);
            return null;
        }

        let signedUrl = data.signedUrl;
        if (!process.env.GRADIENT_IS_PROD || process.env.GRADIENT_IS_PROD !== "true") {
            signedUrl = signedUrl.replace("host.docker.internal", "localhost");
        }
        return signedUrl;
    } else {
        return null;
    }
}

export async function uploadAvatar(imageData: File): Promise<GradientException | null> {
    const supabase = await createClient();

    let user: User;
    {
        const { data, error } = await supabase.auth.getUser();
        if (error != null) {
            throw { message: error.message } as GradientException
        }
        user = data.user;
    }

    {
        const { data, error } = await supabase.storage.from('avatars').upload(
            `${_userIdAvatarFolderPath(user.id)}/avatar.${imageData.name.split('.').pop()!}`,
            imageData
        );
        if (error != null) {
            return { message: error.message } as GradientException
        }
    }
    return null;
}


function _userIdAvatarFolderPath(userId: string) {
    return `${userId}`
}

export interface UpdateCurrentUserArgs {
    displayName?: string
}

export async function updateCurrentUser(args: UpdateCurrentUserArgs) {
    const user = await fetchCurrentUserProfile();
    if (user == null) {
        return { success: false, error: { message: "Cannot update profile while not logged in" } };
    }
    const supabase = await createClient();
    const { data, error } = await supabase.from("users").update({ display_name: args.displayName }).eq("id", user.id).select().single();
    if (error != null) {
        return { success: false, error: { message: error.message } };
    }
    return { success: true, user: data };
}; 
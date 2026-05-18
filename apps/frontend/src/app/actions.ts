"use server"

import { HTTPRequestMethod } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

export async function sendRequestToBackend(method: HTTPRequestMethod, body: string): Promise<string> {
    const backendHost = "http://" + process.env["GRADIENT_BACKEND_SERVER_IP"] + ":" + process.env["GRADIENT_BACKEND_SERVER_PORT"];

    let response;
    try {
        if (method == HTTPRequestMethod.GET) {
            if (body != "") {
                console.warn("Body in GET request ignored.")
            }
            response = await fetch(backendHost, { method });
        } else {
            response = await fetch(backendHost, { method, body });
        }
    }
    catch (e) {
        return "Fetch error: " + e + " Host: " + backendHost; // TODO: Never show backend host to client, this is only for initial setup.
    }
    return await response.text();
}

type LoginResult = "success" | { error: { message: string, name: string, code?: string, cause?: any } };

export async function login(email: string, password: string): Promise<LoginResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error != null) {
        return {
            error: { message: error.message, name: error.name, code: error.code, cause: error.cause }
        };
    } else {
        return "success";
    }
}

type SignUpResult = "success" | { error: { message: string, name: string, code?: any, cause?: any } };
export async function signUp(email: string, password: string): Promise<SignUpResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error != null) {

        return {
            error: { message: error.message, name: error.name, code: error.code, cause: error.cause }
        };
    } else {
        return await login(email, password);
    }
}

export async function logOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}
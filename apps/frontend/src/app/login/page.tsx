import { Metadata } from "next";
import LoginForm from "./components/LoginForm";
import GradientContainer from "../components/common/GradientContainer";
import { fetchCurrentUserProfile, fetchUserAvatar } from "../actions";
import UserProfile from "./components/UserProfile";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage() {
    const user = await fetchCurrentUserProfile();
    const userAvatarUrl = user ? await fetchUserAvatar(user.id) : null;

    return (
        <GradientContainer
            z="-30"
            direction="col"
            className="mt-20 p-20 w-min mx-auto"
        >
            <GradientContainer
                z="-20"
                direction="col"
                className="space-y-8 p-20 w-min mx-auto"
            >
                <GradientContainer
                    z="-10"
                    direction="col"
                    className="text-white text-center font-extrabold p-4 w-300 mx-auto space-y-4"
                >
                    <p className="text-5xl">Welcome to Gradient!</p>
                    {user == null ? <p className="text-xl">Enter your credentials to continue</p> : <></>}
                </GradientContainer>
                {
                    user == null ?
                        <LoginForm /> :
                        <UserProfile
                            user={user}
                            imageUrl={userAvatarUrl != null ? userAvatarUrl : undefined}
                        />}
            </GradientContainer>
        </GradientContainer>
    )
};
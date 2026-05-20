"use server";

import SecureConnectionWarning from "./common/SecureConnectionWarning";
import NavigationBarRoute, { NavigationBarRouteProps } from "./NavigationBar/NavigationBarRoute";
import UserIcon from "./NavigationBar/UserIcon";
import { fetchCurrentUserProfile, fetchUserAvatar } from "../actions";

const leadingRouteItems: NavigationBarRouteProps[] = [
    { title: "Home", route: "/" },
];

const trailingRouteItems: NavigationBarRouteProps[] = [
];

export default async function NavigationBar() {
    // Get user here, but not avatar
    const user = await fetchCurrentUserProfile();
    const userIconUrl = user ? await fetchUserAvatar(user.id) : undefined;

    return (
        <div className="flex flex-col top-0 left-0 fixed z-1000">
            <SecureConnectionWarning />

            <div className="flex flex-row items-center justify-between w-screen h-20  p-8 bg-sky-300 space-x-8">
                <div className="flex flex-row w-full justify-between">
                    <div
                        className="flex flex-row space-x-8 float-left"
                    >
                        {...leadingRouteItems.map((props) => <NavigationBarRoute {...props} />)}
                    </div>
                    <div
                        className="flex flex-row space-x-8 float-right"
                    >
                        {...trailingRouteItems.map((props) => <NavigationBarRoute {...props} />)}
                    </div>
                </div>
                <UserIcon user={user} icon={typeof userIconUrl == "string" ? userIconUrl : "https://placehold.co/400"} />
            </div>
        </div>
    );
}
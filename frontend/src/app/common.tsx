import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const handleLocationPermission = (setLocation: Function, router: any) => {
    if (!navigator.geolocation) {
        if (router.pathname !== '/hello'){
            router.push('/hello');
        }
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
            router.push('/');
        },
        () => {
            router.push('/hello');
        }
    );
};
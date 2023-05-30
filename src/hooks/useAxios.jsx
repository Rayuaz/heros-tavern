import { useState, useEffect } from "react";

export default function useAxios(config) {
    const { axiosInstance, method, url, requestConfig = {} } = config;

    const [response, setResponse] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(0);

    const refetch = () => setReload((prev) => prev + 1);

    useEffect(() => {
        error && setError("");
        !loading && setLoading(true);

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const res = await axiosInstance[method.toLowerCase()](url, {
                    ...requestConfig,
                    signal: controller.signal,
                });
                setResponse(res.data);
            } catch (err) {
                console.log(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        // call the function
        fetchData();

        // useEffect cleanup function
        return () => controller.abort();
    }, [reload]);

    return [response, error, loading, refetch];
}

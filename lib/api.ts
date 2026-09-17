import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("eventify-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { msg?: string; message?: string; error?: Record<string, string[]> } | undefined;
    if (data?.msg || data?.message) return data.msg ?? data.message ?? fallback;
    if (data?.error) return Object.values(data.error).flat().join(" ") || fallback;
  }
  return fallback;
}

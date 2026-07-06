import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Transportista } from "@/types";

export const transportistasService = {
  getAll: () => apiFetch<Transportista[]>(endpoints.transportistas),

  create: (data: Transportista) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.transportistas}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Transportista) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.transportistas}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.transportistas}/${id}`, {
      method: "DELETE",
    }),
};
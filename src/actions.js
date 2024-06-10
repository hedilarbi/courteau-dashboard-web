"use server";

import { cookies } from "next/headers";

export async function create(data) {
  cookies().set("token", data.token);
  cookies().set("name", data.staff.name);
  cookies().set("role", data.staff.role);
  cookies().set("image", data.staff.image ? data.staff.image : "");
  cookies().set("id", data.staff._id);
  cookies().set(
    "restaurant",
    data.staff.restaurant ? data.staff.restaurant : ""
  );
}

export async function getToken() {
  return cookies().get("token");
}

export async function getStaffData() {
  const data = {
    name: cookies().get("name").value,
    role: cookies().get("role").value,
    image: cookies().get("image").value,
    id: cookies().get("id").value,
    restaurant: cookies().get("restaurant").value,
  };
  return data;
}

export async function logout() {
  cookies().delete("token");
  cookies().delete("name");
  cookies().delete("role");
  cookies().delete("image");
  cookies().delete("id");
  cookies().delete("restaurant");
}

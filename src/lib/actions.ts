"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { calculateAbjourDimensions as calculateAbjourDimensionsAI } from "@/ai/flows/calculate-abjour-dimensions";
import { generateOrderName as generateOrderNameAI } from "@/ai/flows/generate-order-name";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  if (email === "admin@abjour.com") {
    redirect("/admin/dashboard");
  } else if (email === "user@abjour.com") {
    redirect("/dashboard");
  } else {
    return {
      message: "Invalid email or password.",
    };
  }
}

export async function calculateAbjourDimensions(prevState: any, formData: { width: number, abjourType: string }) {
  try {
    const result = await calculateAbjourDimensionsAI({
      width: formData.width,
      abjourType: formData.abjourType
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: "Failed to calculate dimensions." };
  }
}


export async function generateOrderName(prevState: any, formData: { abjourType: string, color: string, codeLength: number, numberOfCodes: number }) {
  try {
    const result = await generateOrderNameAI(formData);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: "Failed to generate name." };
  }
}

export async function createOrder(formData: any) {
  // In a real app, you'd save this to a database.
  console.log("New order created:", formData);
  // We'll redirect to the orders page after "creation".
  redirect("/dashboard/orders");
}

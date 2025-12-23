import { email, z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be atleast 3 char long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be atleast 6 char"),
});

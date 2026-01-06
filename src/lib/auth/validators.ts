// TODO: Add Zod schemas or other validation logic here
export const emailValidator = (email: string) => /\S+@\S+\.\S+/.test(email);
export const passwordValidator = (password: string) => password.length >= 8;

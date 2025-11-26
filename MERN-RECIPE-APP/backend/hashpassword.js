import bcrypt from "bcrypt";

const hashPassword = async () => {
  const newPassword = "admin123"; // <-- your new password
  const hashed = await bcrypt.hash(newPassword, 10);
  console.log("Hashed password:", hashed);
};

hashPassword();

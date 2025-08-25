"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

type LoginForm = {
  email_usuario: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/auth/login",
        data
      );
      console.log(res.data);

      if (res.data.success) {
        console.log("Login exitoso");
        console.log(res.data);

      }else {
        console.log("Login fallido"+res.data.message);
        setError("Credenciales inválidas");
        return;
      }
      
      // Guarda el token en localStorage (mejor luego en cookies seguras)
      //localStorage.setItem("token", res.data.access_token);

      //router.push("/dashboard");
    } catch (err: any) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Iniciar Sesión jaja
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Correo
            </label>
            <input
              type="email"
              {...register("email_usuario", { required: true })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Contraseña
            </label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

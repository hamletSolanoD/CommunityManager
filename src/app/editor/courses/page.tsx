"use client";
import React from "react";
import { useSession } from "next-auth/react";
import MyCourses from "./_components/MyCourses";
import PublicCourses from "./_components/PublicCourses";
import { UserType } from "@prisma/client";
import { Loader2 } from "lucide-react";
import MyAdministeredCourses from "./_components/Admin/MyAdministeredCourses";

export default function CursosPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500">
          Debes iniciar sesión para acceder a los cursos
        </p>
      </div>
    );
  }

  const userType = session?.user?.type as UserType;
  const isAdmin = userType === UserType.ADMINISTRADOR || userType === UserType.COORDINADOR;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cursos</h1>
        <p className="text-gray-600">
          {isAdmin 
            ? "Gestiona tus cursos, imparte conocimiento y descubre nuevo contenido"
            : "Gestiona tus cursos actuales y descubre nuevos contenidos disponibles"
          }
        </p>
      </div>

      {/* Sección para administradores/coordinadores */}
      {isAdmin && (
        <section>
          <MyAdministeredCourses />
        </section>
      )}

      {/* Sección de mis cursos (como estudiante) */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {isAdmin ? "Mis Cursos como Estudiante" : "Mis Cursos"}
        </h2>
        <MyCourses />
      </section>

      {/* Sección de cursos disponibles */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cursos Disponibles</h2>
        <PublicCourses />
      </section>
    </div>
  );
}
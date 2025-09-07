import React from "react";
import MyCourses from "./_components/MyCourses";
import PublicCourses from "./_components/PublicCourses";

export default function CursosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cursos</h1>
        <p className="text-gray-600">
          Gestiona tus cursos actuales y descubre nuevos contenidos disponibles
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mis Cursos</h2>
        <MyCourses />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cursos Disponibles</h2>
        <PublicCourses />
      </section>
    </div>
  );
}
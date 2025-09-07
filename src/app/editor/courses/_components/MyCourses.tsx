"use client";
import React from "react";
import { BookOpen, Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";

const MyCourses = () => {
  const { data: courses, isLoading, error } = api.courses.getMyCourses.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando tus cursos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <BookOpen className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Error al cargar cursos
        </h3>
        <p className="text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes cursos activos
        </h3>
        <p className="text-gray-500">
          Explora los cursos disponibles para comenzar tu aprendizaje
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((curso) => {
        const progressPercentage = curso._count.sessions > 0 
          ? Math.round((curso.completedSessions / curso._count.sessions) * 100)
          : 0;

        return (
          <Card key={curso.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {curso.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{curso.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {curso.completedSessions}/{curso._count.sessions} sesiones
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(curso.lastActivity).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Instructores: {curso.administrators.map(admin => admin.name).join(", ")}</p>
                </div>

                <Link 
                  href={`/courses/${curso.id}`}
                  className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block"
                >
                  Continuar Curso
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MyCourses;
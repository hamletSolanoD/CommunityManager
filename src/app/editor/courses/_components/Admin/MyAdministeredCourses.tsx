"use client";
import React from "react";
import { BookOpen, Users, Calendar, Settings, BarChart3, Loader2, Plus, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

const MyAdministeredCourses = () => {
  const { data: courses, isLoading, error } = api.courses.getMyAdministeredCourses.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando cursos administrados...</span>
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

  return (
    <div className="space-y-6">
      {/* Header con botón para crear nuevo curso */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Cursos Impartidos</h2>
          <p className="text-gray-600 mt-1">Gestiona y supervisa tus cursos</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Link>
        </Button>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes cursos creados
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer curso para comenzar a impartir conocimiento
          </p>
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Curso
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold flex-1">
                    {curso.title}
                  </CardTitle>
                  <div className="flex gap-1 ml-2">
                    {!curso.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Admin
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{curso.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Estadísticas del curso */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                      <div className="font-semibold text-blue-900">{curso._count.enrollments}</div>
                      <div className="text-blue-700">Estudiantes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <BookOpen className="h-5 w-5 mx-auto text-green-600 mb-1" />
                      <div className="font-semibold text-green-900">{curso._count.sessions}</div>
                      <div className="text-green-700">Sesiones</div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Creado: {new Date(curso.createdAt).toLocaleDateString()}
                    </div>
                    {curso.accessCode && (
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Código: <code className="ml-1 bg-gray-100 px-1 rounded">{curso.accessCode}</code>
                      </div>
                    )}
                  </div>

                  {/* Co-administradores */}
                  {curso.administrators.length > 1 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Co-administradores:</p>
                      <div className="flex flex-wrap gap-1">
                        {curso.administrators.map((admin, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {admin.name || 'Sin nombre'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button 
                      asChild
                      className="flex-1"
                      size="sm"
                    >
                      <Link href={`/admin/courses/${curso.id}`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Gestionar
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/admin/courses/${curso.id}/stats`}>
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAdministeredCourses;
"use client";
import React from "react";
import { BookOpen, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

const MyCourses = () => {
  const misCursos = [
    {
      id: "1",
      title: "Introducción a IA",
      description: "Conceptos básicos de inteligencia artificial",
      totalSessions: 12,
      completedSessions: 8,
      lastActivity: "2024-03-15",
    },
    {
      id: "2", 
      title: "Desarrollo Web Full Stack",
      description: "Stack T3: Next.js, tRPC, Prisma, TypeScript",
      totalSessions: 16,
      completedSessions: 4,
      lastActivity: "2024-03-10",
    },
  ];

  if (misCursos.length === 0) {
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
      {misCursos.map((curso) => (
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
                  <span>{Math.round((curso.completedSessions / curso.totalSessions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(curso.completedSessions / curso.totalSessions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {curso.completedSessions}/{curso.totalSessions} sesiones
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {curso.lastActivity}
                </div>
              </div>

              <Link 
                href={`/editor/cursos/${curso.id}`}
                className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block"
              >
                Continuar Curso
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyCourses;
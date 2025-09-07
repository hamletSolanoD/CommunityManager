"use client";
import React, { useState } from "react";

import { BookOpen, Lock, Users, Calendar, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

const PublicCourses = () => {
  const [accessCode, setAccessCode] = useState("");
  const [selectedPrivateCourse, setSelectedPrivateCourse] = useState<string | null>(null);

  const cursosDisponibles = [
    {
      id: "1",
      title: "Fundamentos de Machine Learning",
      description: "Aprende los conceptos básicos de ML con ejemplos prácticos",
      isPublic: true,
      totalSessions: 10,
      enrolledCount: 45,
      createdAt: "2024-02-15",
      administrators: ["Dr. García", "Prof. López"],
    },
    {
      id: "2",
      title: "Desarrollo Avanzado con React",
      description: "Patrones avanzados y mejores prácticas en React",
      isPublic: true,
      totalSessions: 8,
      enrolledCount: 32,
      createdAt: "2024-03-01",
      administrators: ["Dev. Martínez"],
    },
    {
      id: "3",
      title: "Investigación en IA - Grupo Selecto",
      description: "Proyecto de investigación para desarrollo de papers",
      isPublic: false,
      totalSessions: 15,
      enrolledCount: 8,
      createdAt: "2024-01-20",
      administrators: ["Dr. Chen", "Dr. Rodríguez"],
    },
  ];

  const handleEnrollPublic = (courseId: string) => {
    console.log("Inscribiéndose al curso público:", courseId);
  };

  const handleEnrollPrivate = (courseId: string) => {
    console.log("Inscribiéndose al curso privado:", courseId, "con código:", accessCode);
    setAccessCode("");
    setSelectedPrivateCourse(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Key className="h-5 w-5 mr-2" />
            ¿Tienes un código de acceso?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ingresa el código del curso"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleEnrollPrivate("codigo-directo")}
              disabled={!accessCode.trim()}
            >
              Unirse
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursosDisponibles.map((curso) => (
          <Card key={curso.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold flex-1">
                  {curso.title}
                </CardTitle>
                {!curso.isPublic && (
                  <Badge variant="secondary" className="ml-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Privado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{curso.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {curso.totalSessions} sesiones
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {curso.enrolledCount} estudiantes
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Creado: {new Date(curso.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Instructores:</p>
                  <div className="flex flex-wrap gap-1">
                    {curso.administrators.map((admin, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {admin}
                      </Badge>
                    ))}
                  </div>
                </div>

                {curso.isPublic ? (
                  <Button 
                    onClick={() => handleEnrollPublic(curso.id)}
                    className="w-full"
                  >
                    Inscribirse
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedPrivateCourse(curso.id)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Solicitar Acceso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Acceso a Curso Privado</DialogTitle>
                        <DialogDescription>
                          Este curso requiere un código de acceso. Solicítalo al instructor o administrador.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Código de Acceso</label>
                          <Input
                            placeholder="Ingresa el código proporcionado"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleEnrollPrivate(curso.id)}
                            disabled={!accessCode.trim()}
                            className="flex-1"
                          >
                            Inscribirse
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cursosDisponibles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-gray-500">
            Los nuevos cursos aparecerán aquí cuando estén disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicCourses;
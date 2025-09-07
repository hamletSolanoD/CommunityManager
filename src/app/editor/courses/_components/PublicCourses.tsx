"use client";
import React, { useState } from "react";
import { BookOpen, Lock, Users, Calendar, Key, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const PublicCourses = () => {
  const [accessCode, setAccessCode] = useState("");
  const [selectedPrivateCourse, setSelectedPrivateCourse] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: courses, isLoading, refetch } = api.courses.getPublicCourses.useQuery();
  
  const enrollPublicMutation = api.courses.enrollPublic.useMutation({
    onSuccess: () => {
      toast.success("¡Te has inscrito exitosamente al curso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsEnrolling(false);
    }
  });

  const enrollPrivateMutation = api.courses.enrollPrivate.useMutation({
    onSuccess: () => {
      toast.success("¡Te has inscrito exitosamente al curso!");
      setAccessCode("");
      setSelectedPrivateCourse(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsEnrolling(false);
    }
  });

  const handleEnrollPublic = (courseId: string) => {
    setIsEnrolling(true);
    enrollPublicMutation.mutate({ courseId });
  };

  const handleEnrollPrivate = (courseId?: string) => {
    if (!accessCode.trim()) return;
    
    setIsEnrolling(true);
    enrollPrivateMutation.mutate({ 
      accessCode: accessCode.trim(),
      ...(courseId && courseId !== "codigo-directo" ? { courseId } : {})
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando cursos...</span>
      </div>
    );
  }

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
              disabled={isEnrolling}
            />
            <Button 
              onClick={() => handleEnrollPrivate("codigo-directo")}
              disabled={!accessCode.trim() || isEnrolling}
            >
              {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unirse"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((curso) => (
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
                    {curso._count.sessions} sesiones
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {curso._count.enrollments} estudiantes
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
                        {admin.name || 'Sin nombre'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {curso.isPublic ? (
                  <Button 
                    onClick={() => handleEnrollPublic(curso.id)}
                    className="w-full"
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Inscribirse
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedPrivateCourse(curso.id)}
                        disabled={isEnrolling}
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
                            disabled={isEnrolling}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleEnrollPrivate(selectedPrivateCourse!)}
                            disabled={!accessCode.trim() || isEnrolling}
                            className="flex-1"
                          >
                            {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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

      {courses?.length === 0 && (
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
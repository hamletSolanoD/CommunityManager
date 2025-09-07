"use client";
import React from "react";
import { CourseType } from "@prisma/client";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Lock, 
  Key, 
  Link,
  Edit,
  Image,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface CourseSession {
  title: string;
  description?: string;
  atlasEntryId?: string;
  registrationCode?: string;
  order: number;
}

interface CourseFormData {
  title: string;
  description?: string;
  isPublic: boolean;
  accessCode?: string;
  type: CourseType;
  location?: string;
  thumbnail?: string;
  duration?: number;
  maxStudents?: number;
  startDate?: Date;
  endDate?: Date;
  sessions: CourseSession[];
}

interface CourseReviewStepProps {
  formData: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
}

const CourseReviewStep: React.FC<CourseReviewStepProps> = ({ formData, onUpdate }) => {
  const formatDate = (date?: Date) => {
    if (!date) return "No especificada";
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: CourseType) => {
    switch (type) {
      case CourseType.VIRTUAL:
        return <Globe className="h-4 w-4" />;
      case CourseType.PRESENCIAL:
        return <MapPin className="h-4 w-4" />;
      case CourseType.HIBRIDO:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: CourseType) => {
    switch (type) {
      case CourseType.VIRTUAL:
        return "Virtual";
      case CourseType.PRESENCIAL:
        return "Presencial";
      case CourseType.HIBRIDO:
        return "Híbrido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
          <h3 className="text-2xl font-bold text-gray-900">Revisar Información del Curso</h3>
        </div>
        <p className="text-gray-600">
          Revisa toda la información antes de crear el curso. Podrás editarla después si es necesario.
        </p>
      </div>

      {/* Vista Previa del Curso */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-blue-900">{formData.title}</CardTitle>
              {formData.description && (
                <p className="text-blue-700 mt-2">{formData.description}</p>
              )}
            </div>
            {formData.thumbnail && (
              <img
                src={formData.thumbnail}
                alt="Vista previa del curso"
                className="w-20 h-20 object-cover rounded-lg border ml-4"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              {getTypeIcon(formData.type)}
              <span className="ml-1">{getTypeLabel(formData.type)}</span>
            </Badge>
            {formData.isPublic ? (
              <Badge variant="outline" className="bg-white text-green-700">
                <Globe className="h-3 w-3 mr-1" />
                Público
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-white text-orange-700">
                <Lock className="h-3 w-3 mr-1" />
                Privado
              </Badge>
            )}
            {formData.sessions.length > 0 && (
              <Badge variant="outline" className="bg-white">
                <BookOpen className="h-3 w-3 mr-1" />
                {formData.sessions.length} sesión{formData.sessions.length !== 1 ? 'es' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información Detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Título</label>
              <p className="text-gray-900">{formData.title}</p>
            </div>
            
            {formData.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Descripción</label>
                <p className="text-gray-900 text-sm">{formData.description}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-600">Modalidad</label>
              <div className="flex items-center mt-1">
                {getTypeIcon(formData.type)}
                <span className="ml-2 text-gray-900">{getTypeLabel(formData.type)}</span>
              </div>
            </div>
            
            {formData.location && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  {formData.type === CourseType.VIRTUAL ? "Plataforma" : "Ubicación"}
                </label>
                <p className="text-gray-900">{formData.location}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración de Acceso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Configuración de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Acceso</label>
              <div className="flex items-center mt-1">
                {formData.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-green-600" />
                    <span className="ml-2 text-green-600 font-medium">Público</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-orange-600" />
                    <span className="ml-2 text-orange-600 font-medium">Privado</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.isPublic 
                  ? "Cualquier usuario puede inscribirse"
                  : "Solo usuarios con código pueden inscribirse"
                }
              </p>
            </div>
            
            {!formData.isPublic && formData.accessCode && (
              <div>
                <label className="text-sm font-medium text-gray-600">Código de Acceso</label>
                <div className="flex items-center mt-1">
                  <Key className="h-4 w-4 text-gray-500" />
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                    {formData.accessCode}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalles del Curso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Detalles del Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.duration && (
              <div>
                <label className="text-sm font-medium text-gray-600">Duración Estimada</label>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="ml-2 text-gray-900">{formData.duration} horas</span>
                </div>
              </div>
            )}
            
            {formData.maxStudents && (
              <div>
                <label className="text-sm font-medium text-gray-600">Máximo de Estudiantes</label>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="ml-2 text-gray-900">{formData.maxStudents} estudiantes</span>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
              <p className="text-gray-900">{formatDate(formData.startDate)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Finalización</label>
              <p className="text-gray-900">{formatDate(formData.endDate)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Imagen del Curso */}
        {formData.thumbnail && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Imagen del Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={formData.thumbnail}
                alt="Imagen del curso"
                className="w-full h-32 object-cover rounded-lg border"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sesiones Configuradas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Sesiones del Curso
            </div>
            {formData.sessions.length > 0 && (
              <Badge variant="outline">
                {formData.sessions.length} sesión{formData.sessions.length !== 1 ? 'es' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No se han configurado sesiones</p>
              <p className="text-sm">Se podrán agregar después de crear el curso</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.sessions.map((session, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Sesión {index + 1}
                        </Badge>
                        <h4 className="font-medium">{session.title}</h4>
                      </div>
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {session.atlasEntryId ? (
                          <Badge variant="secondary" className="text-xs">
                            <Link className="h-3 w-3 mr-1" />
                            Enlazada con Atlas
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Se creará automáticamente
                          </Badge>
                        )}
                        {session.registrationCode && (
                          <Badge variant="outline" className="text-xs">
                            <Key className="h-3 w-3 mr-1" />
                            Con código de registro
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Final */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Listo para Crear el Curso
              </h3>
              <p className="text-green-700 text-sm">
                Toda la información ha sido configurada. El curso se creará en estado "Borrador" 
                y podrás activarlo cuando esté listo para recibir estudiantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseReviewStep;
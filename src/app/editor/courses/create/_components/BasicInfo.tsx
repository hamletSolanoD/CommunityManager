"use client";
import React from "react";
import { CourseType } from "@prisma/client";
import { Calendar, MapPin, Users, Clock, Globe, Lock, Image } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";

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
  sessions: any[];
}

interface CourseBasicInfoStepProps {
  formData: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
}

const CourseBasicInfoStep: React.FC<CourseBasicInfoStepProps> = ({ formData, onUpdate }) => {
  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    onUpdate({ [field]: value });
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onUpdate({ [field]: value ? new Date(value) : undefined });
  };

  return (
    <div className="space-y-6">
      {/* Información Principal */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Título del Curso *
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Introducción a React y Next.js"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
                {!formData.title && (
                  <p className="text-sm text-red-500 mt-1">El título es requerido</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe de qué trata el curso, objetivos de aprendizaje, prerequisitos..."
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-base font-medium">
                  Modalidad del Curso
                </Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value as CourseType)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseType.VIRTUAL}>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Virtual
                      </div>
                    </SelectItem>
                    <SelectItem value={CourseType.PRESENCIAL}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Presencial
                      </div>
                    </SelectItem>
                    <SelectItem value={CourseType.HIBRIDO}>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Híbrido
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  {formData.type === CourseType.VIRTUAL ? "Plataforma" : "Ubicación"}
                </Label>
                <Input
                  id="location"
                  placeholder={
                    formData.type === CourseType.VIRTUAL 
                      ? "Ej: Zoom, Google Meet, Discord..."
                      : "Ej: Sala 101, Edificio A..."
                  }
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Acceso */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Configuración de Acceso
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center">
                  {formData.isPublic ? (
                    <Globe className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2 text-orange-600" />
                  )}
                  <span className="font-medium">
                    {formData.isPublic ? "Curso Público" : "Curso Privado"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.isPublic 
                    ? "Cualquier usuario puede inscribirse libremente"
                    : "Solo usuarios con código de acceso pueden inscribirse"
                  }
                </p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
            </div>

            {!formData.isPublic && (
              <div>
                <Label htmlFor="accessCode" className="text-base font-medium">
                  Código de Acceso
                </Label>
                <Input
                  id="accessCode"
                  placeholder="Ej: REACT2024, CURSO-INTRO..."
                  value={formData.accessCode || ""}
                  onChange={(e) => handleInputChange('accessCode', e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Los estudiantes necesitarán este código para inscribirse
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalles Adicionales */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Detalles del Curso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-base font-medium">
                Duración Estimada (horas)
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="Ej: 40"
                value={formData.duration || ""}
                onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="maxStudents" className="text-base font-medium">
                Máximo de Estudiantes
              </Label>
              <Input
                id="maxStudents"
                type="number"
                placeholder="Ej: 30"
                value={formData.maxStudents || ""}
                onChange={(e) => handleInputChange('maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="startDate" className="text-base font-medium">
                Fecha de Inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-base font-medium">
                Fecha de Finalización
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="mt-1"
                min={formatDateForInput(formData.startDate)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="thumbnail" className="text-base font-medium">
                <Image className="h-4 w-4 inline mr-2" />
                URL de Imagen (opcional)
              </Label>
              <Input
                id="thumbnail"
                type="url"
                placeholder="https://ejemplo.com/imagen-curso.jpg"
                value={formData.thumbnail || ""}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL de una imagen que represente el curso
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa de la Imagen */}
      {formData.thumbnail && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-base font-medium mb-2">Vista Previa de Imagen</h3>
            <div className="w-full max-w-md">
              <img
                src={formData.thumbnail}
                alt="Vista previa del curso"
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseBasicInfoStep;
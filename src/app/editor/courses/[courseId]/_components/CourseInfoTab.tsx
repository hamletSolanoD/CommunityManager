"use client";
import React, { useState } from "react";
import { 
  Globe, 
  MapPin, 
  Users, 
  Clock, 
  Calendar,
  Lock,
  Edit,
  Save,
  X
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { CourseStatus, CourseType } from "@prisma/client";

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  type: CourseType;
  location: string | null;
  thumbnail: string | null;
  duration: number | null;
  maxStudents: number | null;
  status: CourseStatus;
  startDate: Date | null;
  endDate: Date | null;
  isPublic: boolean;
  accessCode: string | null;
  _count: {
    enrollments: number;
    sessions: number;
  };
}

interface CourseInfoTabProps {
  course: CourseData;
  isAdmin: boolean;
  onUpdateCourse?: (updates: Partial<CourseData>) => Promise<void>;
  isUpdating?: boolean;
}

const CourseInfoTab: React.FC<CourseInfoTabProps> = ({
  course,
  isAdmin,
  onUpdateCourse,
  isUpdating = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: course.title,
    description: course.description || "",
    type: course.type,
    location: course.location || "",
    duration: course.duration?.toString() || "",
    maxStudents: course.maxStudents?.toString() || "",
    status: course.status,
    startDate: course.startDate ? course.startDate.toISOString().split('T')[0] : "",
    endDate: course.endDate ? course.endDate.toISOString().split('T')[0] : "",
    isPublic: course.isPublic,
    accessCode: course.accessCode || "",
  });

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

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.DRAFT:
        return <Badge variant="outline" className="text-gray-600">Borrador</Badge>;
      case CourseStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
      case CourseStatus.COMPLETED:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completado</Badge>;
      case CourseStatus.CANCELLED:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
    }
  };

  const handleSave = async () => {
    if (!onUpdateCourse) return;

    const updates: Partial<CourseData> = {
      title: editData.title,
      description: editData.description || null,
      type: editData.type,
      location: editData.location || null,
      duration: editData.duration ? parseInt(editData.duration) : null,
      maxStudents: editData.maxStudents ? parseInt(editData.maxStudents) : null,
      status: editData.status,
      startDate: editData.startDate ? new Date(editData.startDate) : null,
      endDate: editData.endDate ? new Date(editData.endDate) : null,
      isPublic: editData.isPublic,
      accessCode: editData.accessCode || null,
    };

    await onUpdateCourse(updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: course.title,
      description: course.description || "",
      type: course.type,
      location: course.location || "",
      duration: course.duration?.toString() || "",
      maxStudents: course.maxStudents?.toString() || "",
      status: course.status,
      startDate: course.startDate ? course.startDate.toISOString().split('T')[0] : "",
      endDate: course.endDate ? course.endDate.toISOString().split('T')[0] : "",
      isPublic: course.isPublic,
      accessCode: course.accessCode || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Información del Curso</CardTitle>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              disabled={isUpdating}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Título</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del curso"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Descripción</label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del curso"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Modalidad</label>
                <Select
                  value={editData.type}
                  onValueChange={(value: CourseType) => setEditData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseType.VIRTUAL}>Virtual</SelectItem>
                    <SelectItem value={CourseType.PRESENCIAL}>Presencial</SelectItem>
                    <SelectItem value={CourseType.HIBRIDO}>Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  {editData.type === CourseType.VIRTUAL ? "Plataforma" : "Ubicación"}
                </label>
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={editData.type === CourseType.VIRTUAL ? "Zoom, Teams, etc." : "Dirección física"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Duración (horas)</label>
                  <Input
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Máx. Estudiantes</label>
                  <Input
                    type="number"
                    value={editData.maxStudents}
                    onChange={(e) => setEditData(prev => ({ ...prev, maxStudents: e.target.value }))}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                  <Input
                    type="date"
                    value={editData.startDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Fin</label>
                  <Input
                    type="date"
                    value={editData.endDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Título</label>
                <p className="text-gray-900 font-medium">{course.title}</p>
              </div>

              {course.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900">{course.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Modalidad</label>
                <div className="flex items-center mt-1">
                  {getTypeIcon(course.type)}
                  <span className="ml-2">{getTypeLabel(course.type)}</span>
                </div>
              </div>

              {course.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {course.type === CourseType.VIRTUAL ? "Plataforma" : "Ubicación"}
                  </label>
                  <p className="text-gray-900">{course.location}</p>
                </div>
              )}

              {course.startDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                  <p className="text-gray-900">
                    {new Date(course.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {course.endDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Finalización</label>
                  <p className="text-gray-900">
                    {new Date(course.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado y Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Estado y Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Estado del Curso</label>
                <Select
                  value={editData.status}
                  onValueChange={(value: CourseStatus) => setEditData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseStatus.DRAFT}>Borrador</SelectItem>
                    <SelectItem value={CourseStatus.ACTIVE}>Activo</SelectItem>
                    <SelectItem value={CourseStatus.COMPLETED}>Completado</SelectItem>
                    <SelectItem value={CourseStatus.CANCELLED}>Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Visibilidad</label>
                <Select
                  value={editData.isPublic ? "public" : "private"}
                  onValueChange={(value) => {
                    const isPublic = value === "public";
                    setEditData(prev => ({ 
                      ...prev, 
                      isPublic,
                      // Limpiar código de acceso si se hace público
                      accessCode: isPublic ? "" : prev.accessCode
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editData.isPublic && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Código de Acceso 
                    <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                  </label>
                  <Input
                    value={editData.accessCode}
                    onChange={(e) => setEditData(prev => ({ ...prev, accessCode: e.target.value }))}
                    placeholder="Dejar vacío para curso privado sin código"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no especificas un código, solo los administradores podrán agregar estudiantes
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Estado:</span>
                {getStatusBadge(course.status)}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Visibilidad:</span>
                {course.isPublic ? (
                  <Badge variant="outline" className="text-green-700">
                    <Globe className="h-3 w-3 mr-1" />
                    Público
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-700">
                    <Lock className="h-3 w-3 mr-1" />
                    Privado
                  </Badge>
                )}
              </div>

              {!course.isPublic && course.accessCode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Código:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{course.accessCode}</code>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Total de sesiones:</span>
                <span className="font-medium">{course._count.sessions}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Estudiantes inscritos:</span>
                <span className="font-medium">{course._count.enrollments}</span>
              </div>

              {course.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración estimada:</span>
                  <span className="font-medium">{course.duration} horas</span>
                </div>
              )}

              {course.maxStudents && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacidad máxima:</span>
                  <span className="font-medium">{course.maxStudents} estudiantes</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseInfoTab;
"use client";
import React, { useState } from "react";
import { Plus, Trash2, BookOpen, Link, GripVertical, Edit3, Key } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface CourseSession {
  title: string;
  description?: string;
  atlasEntryId?: string;
  registrationCode?: string;
  order: number;
}

interface CourseSessionsStepProps {
  sessions: CourseSession[];
  onUpdate: (sessions: CourseSession[]) => void;
}

const CourseSessionsStep: React.FC<CourseSessionsStepProps> = ({ sessions, onUpdate }) => {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [newSession, setNewSession] = useState<Omit<CourseSession, 'order'>>({
    title: "",
    description: "",
    atlasEntryId: "",
    registrationCode: "",
  });

  // Obtener entradas de Atlas disponibles
  const { data: atlasEntries, isLoading: isLoadingAtlas } = api.courses.getAvailableAtlasEntries.useQuery();

  const addSession = () => {
    if (!newSession.title.trim()) return;

    const session: CourseSession = {
      ...newSession,
      order: sessions.length,
      atlasEntryId: newSession.atlasEntryId || undefined,
      registrationCode: newSession.registrationCode || undefined,
    };

    onUpdate([...sessions, session]);
    setNewSession({
      title: "",
      description: "",
      atlasEntryId: "",
      registrationCode: "",
    });
    setIsAddingSession(false);
  };

  const removeSession = (index: number) => {
    const newSessions = sessions.filter((_, i) => i !== index);
    // Reordenar los índices
    const reorderedSessions = newSessions.map((session, i) => ({
      ...session,
      order: i,
    }));
    onUpdate(reorderedSessions);
  };

  const updateSession = (index: number, updatedSession: Partial<CourseSession>) => {
    const newSessions = sessions.map((session, i) =>
      i === index ? { ...session, ...updatedSession } : session
    );
    onUpdate(newSessions);
    setEditingSession(null);
  };

  const moveSession = (fromIndex: number, toIndex: number) => {
    const newSessions = [...sessions];
    const [movedSession] = newSessions.splice(fromIndex, 1)?? {};
    newSessions.splice(toIndex, 0, movedSession);
    
    // Actualizar órdenes
    const reorderedSessions = newSessions.map((session, i) => ({
      ...session,
      order: i,
    }));
    onUpdate(reorderedSessions);
  };

  const getAtlasEntryTitle = (atlasEntryId?: string) => {
    if (!atlasEntryId || !atlasEntries) return null;
    return atlasEntries.find(entry => entry.id === atlasEntryId)?.title;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Configurar Sesiones del Curso</h3>
          <p className="text-gray-600 text-sm">
            Agrega las sesiones que tendrá tu curso. Puedes enlazarlas con entradas existentes del Atlas.
          </p>
        </div>
        <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Sesión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Sesión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sessionTitle">Título de la Sesión *</Label>
                <Input
                  id="sessionTitle"
                  placeholder="Ej: Introducción a React Hooks"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sessionDescription">Descripción</Label>
                <Textarea
                  id="sessionDescription"
                  placeholder="Describe los objetivos y contenido de esta sesión..."
                  value={newSession.description || ""}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="atlasEntry">Enlazar con Entrada de Atlas (opcional)</Label>
                <Select
                  value={newSession.atlasEntryId || "no-atlas"}
                  onValueChange={(value) => setNewSession({ ...newSession, atlasEntryId: value === "no-atlas" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entrada existente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-atlas">Sin enlazar</SelectItem>
                    {isLoadingAtlas ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      atlasEntries?.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2" />
                            {entry.title}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Si no seleccionas una entrada, se creará automáticamente una nueva
                </p>
              </div>

              <div>
                <Label htmlFor="registrationCode">Código de Registro (opcional)</Label>
                <Input
                  id="registrationCode"
                  placeholder="Ej: SESION1, INTRO-REACT..."
                  value={newSession.registrationCode || ""}
                  onChange={(e) => setNewSession({ ...newSession, registrationCode: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si agregas un código, solo estudiantes con él podrán marcar asistencia
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addSession} disabled={!newSession.title.trim()}>
                  Agregar Sesión
                </Button>
                <Button variant="outline" onClick={() => setIsAddingSession(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Sesiones */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay sesiones configuradas
              </h3>
              <p className="text-gray-500 mb-4">
                Agrega sesiones para estructurar tu curso
              </p>
              <Button onClick={() => setIsAddingSession(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <Card key={index} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Sesión {index + 1}
                        </Badge>
                        {editingSession === index ? (
                          <Input
                            value={session.title}
                            onChange={(e) => updateSession(index, { title: e.target.value })}
                            onBlur={() => setEditingSession(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingSession(null);
                              if (e.key === 'Escape') setEditingSession(null);
                            }}
                            autoFocus
                            className="text-sm"
                          />
                        ) : (
                          <span 
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingSession(index)}
                          >
                            {session.title}
                          </span>
                        )}
                      </CardTitle>
                      {session.description && (
                        <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSession(index)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSession(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {session.atlasEntryId && (
                    <Badge variant="secondary" className="text-xs">
                      <Link className="h-3 w-3 mr-1" />
                      Atlas: {getAtlasEntryTitle(session.atlasEntryId)}
                    </Badge>
                  )}
                  {session.registrationCode && (
                    <Badge variant="outline" className="text-xs">
                      <Key className="h-3 w-3 mr-1" />
                      Código: {session.registrationCode}
                    </Badge>
                  )}
                  {!session.atlasEntryId && (
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                      Se creará automáticamente
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumen */}
      {sessions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">
                  Resumen de Sesiones
                </h4>
                <p className="text-sm text-blue-700">
                  {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} configurada{sessions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">
                  {sessions.filter(s => s.atlasEntryId).length} enlazadas con Atlas
                </div>
                <div className="text-sm text-blue-700">
                  {sessions.filter(s => s.registrationCode).length} con código de registro
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseSessionsStep;
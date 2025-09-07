"use client";
import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Circle, 
  Clock, 
  Key,
  Users,
  Calendar
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { SessionStatus } from "@prisma/client";

interface SessionData {
  id: string;
  registrationCode: string | null;
  atlasEntry: {
    id: string;
    title: string;
  };
  participants: Array<{
    status: SessionStatus;
    attendedAt: Date | null;
    hasRegistrationCode: boolean;
  }>;
}

interface SessionsTabProps {
  sessions: SessionData[];
  isEnrolled: boolean;
  onRegisterAttendance: (sessionId: string) => void;
  isLoading: boolean;
}

const CourseSessionsTab: React.FC<SessionsTabProps> = ({
  sessions,
  isEnrolled,
  onRegisterAttendance,
  isLoading
}) => {
  const getSessionStatusIcon = (hasParticipation: boolean, status?: SessionStatus) => {
    if (!hasParticipation) {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
    
    switch (status) {
      case SessionStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case SessionStatus.ON_WORK:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (hasParticipation: boolean, status?: SessionStatus) => {
    if (!hasParticipation) {
      return (
        <Badge variant="outline" className="text-gray-600">
          Pendiente
        </Badge>
      );
    }
    
    switch (status) {
      case SessionStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Completada
          </Badge>
        );
      case SessionStatus.ON_WORK:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            En Progreso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Pendiente
          </Badge>
        );
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay sesiones configuradas
        </h3>
        <p className="text-gray-600">
          Las sesiones se agregarán próximamente
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session, index) => {
        const participation = session.participants[0];
        const hasParticipation = !!participation;
        
        return (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getSessionStatusIcon(hasParticipation, participation?.status)}
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">
                      Sesión {index + 1}
                    </Badge>
                    <CardTitle className="text-lg leading-tight">
                      {session.atlasEntry.title}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                {getStatusBadge(hasParticipation, participation?.status)}
              </div>

              {/* Información de asistencia */}
              {hasParticipation && participation.attendedAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Asistencia: {new Date(participation.attendedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {participation.hasRegistrationCode && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Key className="h-4 w-4" />
                      <span>Verificado con código</span>
                    </div>
                  )}
                </div>
              )}

              {/* Indicador de código requerido */}
              {session.registrationCode && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Key className="h-4 w-4" />
                  <span>Requiere código de registro</span>
                </div>
              )}

              {/* Acciones */}
              {isEnrolled && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link href={`/atlas/${session.atlasEntry.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Ver Contenido
                    </Link>
                  </Button>
                  
                  {(!hasParticipation || participation.status !== SessionStatus.COMPLETED) && (
                    <Button
                      size="sm"
                      onClick={() => onRegisterAttendance(session.id)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {session.registrationCode ? (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Registrar Asistencia
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Completada
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CourseSessionsTab;
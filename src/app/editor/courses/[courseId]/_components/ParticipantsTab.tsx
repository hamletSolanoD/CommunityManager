"use client";
import React from "react";
import { 
  Users, 
  UserCheck, 
  Crown, 
  Calendar,
  Mail,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SessionStatus } from "@prisma/client";

interface Administrator {
  id: string;
  name: string | null;
  email: string;
}

interface Participant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: Date;
}

interface SessionParticipant {
  userId: string;
  status: SessionStatus;
  attendedAt: Date | null;
}

interface ParticipantsTabProps {
  administrators: Administrator[];
  participants: Participant[];
  sessions: Array<{
    id: string;
    participants: SessionParticipant[];
  }>;
  totalSessions: number;
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  administrators,
  participants,
  sessions,
  totalSessions
}) => {
  const getParticipantProgress = (userId: string) => {
    const userSessions = sessions.flatMap(session => 
      session.participants.filter(p => p.userId === userId)
    );
    
    const completedSessions = userSessions.filter(p => p.status === SessionStatus.COMPLETED).length;
    const inProgressSessions = userSessions.filter(p => p.status === SessionStatus.ON_WORK).length;
    
    return {
      completed: completedSessions,
      inProgress: inProgressSessions,
      total: totalSessions,
      percentage: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    };
  };

  const getProgressBadge = (percentage: number) => {
    if (percentage === 100) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Award className="h-3 w-3 mr-1" />
          Completado
        </Badge>
      );
    } else if (percentage >= 50) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          En Progreso
        </Badge>
      );
    } else if (percentage > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Iniciado
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600">
          Sin iniciar
        </Badge>
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Instructores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Instructores ({administrators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {administrators.map((instructor) => (
              <div key={instructor.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-yellow-100 text-yellow-800">
                    {getInitials(instructor.name, instructor.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {instructor.name || "Sin nombre"}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-1" />
                    {instructor.email}
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Instructor
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Estudiantes ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay estudiantes inscritos
              </h3>
              <p className="text-gray-600">
                Los estudiantes aparecerán aquí cuando se inscriban al curso
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => {
                const progress = getParticipantProgress(participant.user.id);
                
                return (
                  <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getInitials(participant.user.name, participant.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user.name || "Sin nombre"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {participant.user.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Inscrito: {formatDate(participant.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {progress.completed}/{progress.total} sesiones
                        </div>
                        <div className="text-xs text-gray-600">
                          {Math.round(progress.percentage)}% completado
                        </div>
                      </div>
                      {getProgressBadge(progress.percentage)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de Participación */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Participación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
                <div className="text-sm text-blue-800">Total Estudiantes</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {participants.filter(p => getParticipantProgress(p.user.id).percentage === 100).length}
                </div>
                <div className="text-sm text-green-800">Completaron Curso</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {participants.filter(p => {
                    const progress = getParticipantProgress(p.user.id);
                    return progress.percentage > 0 && progress.percentage < 100;
                  }).length}
                </div>
                <div className="text-sm text-yellow-800">En Progreso</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {participants.filter(p => getParticipantProgress(p.user.id).percentage === 0).length}
                </div>
                <div className="text-sm text-gray-800">Sin Iniciar</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParticipantsTab;
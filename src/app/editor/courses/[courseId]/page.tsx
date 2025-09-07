"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Lock, 
  Key, 
  Settings,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { CourseType, SessionStatus } from "@prisma/client";
import CourseChatTab from "./_components/CourseChatTab";
import CourseInfoTab from "./_components/CourseInfoTab";
import ParticipantsTab from "./_components/ParticipantsTab";
import CourseSessionsTab from "./_components/CourseSessionsTab";


interface CourseDetailPageProps {
  courseId: string;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ }) => {
  const params = useParams();
  const courseId = params.courseId as string;
  const [registrationCode, setRegistrationCode] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Queries
  const { data: course, isLoading, error, refetch } = api.courses.getCourse.useQuery({ courseId });
  const { data: participantsData } = api.courses.getCourseParticipants.useQuery(
    { courseId },
    { enabled: !!course?.isEnrolled || !!course?.isAdmin }
  );

  // Mutations
  const enrollMutation = api.courses.enrollPublic.useMutation({
    onSuccess: () => {
      toast({
        title: "Inscripción exitosa",
        description: "Te has inscrito al curso correctamente",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error en la inscripción",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerAttendanceMutation = api.courses.registerAttendance.useMutation({
    onSuccess: () => {
      toast({
        title: "Asistencia registrada",
        description: "Tu asistencia ha sido registrada exitosamente",
      });
      refetch();
      setRegistrationCode("");
      setSelectedSessionId(null);
    },
    onError: (error) => {
      toast({
        title: "Error al registrar asistencia",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = api.courses.updateCourse.useMutation({
    onSuccess: () => {
      toast({
        title: "Curso actualizado",
        description: "La información del curso ha sido actualizada exitosamente",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendChatMessageMutation = api.courses.sendChatMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Curso no encontrado</h2>
          <p className="text-gray-600 mb-4">{error?.message || "El curso que buscas no existe o no tienes acceso a él"}</p>
          <Button asChild>
            <Link href="/editor/courses">Volver a Cursos</Link>
          </Button>
        </div>
      </div>
    );
  }

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

  const completedSessions = course.sessions.filter(session => 
    session.participants.some(p => p.status === SessionStatus.COMPLETED)
  ).length;
  
  const progressPercentage = course.sessions.length > 0 
    ? (completedSessions / course.sessions.length) * 100 
    : 0;

  const handleEnroll = () => {
    enrollMutation.mutate({ courseId });
  };

  const handleRegisterAttendance = (sessionId: string) => {
    const session = course.sessions.find(s => s.id === sessionId);
    if (session?.registrationCode) {
      setSelectedSessionId(sessionId);
    } else {
      registerAttendanceMutation.mutate({ sessionId });
    }
  };

  const handleSubmitRegistrationCode = () => {
    if (selectedSessionId) {
      registerAttendanceMutation.mutate({
        sessionId: selectedSessionId,
        registrationCode,
      });
    }
  };

  const handleUpdateCourse = async (updates: any) => {
    await updateCourseMutation.mutateAsync({
      courseId,
      ...updates,
    });
  };

  const handleSendMessage = async (message: string) => {
    await sendChatMessageMutation.mutateAsync({
      courseId,
      message,
    });
  };

  const chatMessages = (course.chatConversation as any[]) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/editor/courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cursos
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-gray-600 text-lg">{course.description}</p>
              )}
            </div>
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg border ml-6"
              />
            )}
          </div>

          {/* Course Info */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="outline" className="flex items-center">
              {getTypeIcon(course.type)}
              <span className="ml-1">{getTypeLabel(course.type)}</span>
            </Badge>
            
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
            
            <Badge variant="outline">
              <BookOpen className="h-3 w-3 mr-1" />
              {course._count.sessions} sesiones
            </Badge>
            
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {course._count.enrollments} estudiantes
            </Badge>

            {course.duration && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {course.duration} horas
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!course.isEnrolled && !course.isAdmin && (
              <Button 
                onClick={handleEnroll}
                disabled={enrollMutation.isLoading}
                size="lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {enrollMutation.isLoading ? "Inscribiendo..." : "Inscribirse al Curso"}
              </Button>
            )}
            
            {course.isAdmin && (
              <Button asChild size="lg">
                <Link href={`/editor/courses/${courseId}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar Curso
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Progress for enrolled students */}
        {course.isEnrolled && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Progreso del Curso</h3>
                <span className="text-sm text-gray-600">
                  {completedSessions} de {course.sessions.length} sesiones completadas
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            {(course.isEnrolled || course.isAdmin) && (
              <TabsTrigger value="chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="sessions">
            <CourseSessionsTab
              sessions={course.sessions}
              isEnrolled={course.isEnrolled}
              onRegisterAttendance={handleRegisterAttendance}
              isLoading={registerAttendanceMutation.isLoading}
            />
          </TabsContent>

          <TabsContent value="info">
            <CourseInfoTab
              course={course}
              isAdmin={course.isAdmin}
              onUpdateCourse={handleUpdateCourse}
              isUpdating={updateCourseMutation.isLoading}
            />
          </TabsContent>

          <TabsContent value="participants">
            {participantsData ? (
              <ParticipantsTab
                administrators={course.administrators}
                participants={participantsData.participants}
                sessions={participantsData.sessions}
                totalSessions={course.sessions.length}
              />
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cargando participantes...</p>
              </div>
            )}
          </TabsContent>

          {(course.isEnrolled || course.isAdmin) && (
            <TabsContent value="chat">
              <CourseChatTab
                courseId={courseId}
                messages={chatMessages}
                currentUser={{
                  id: "", // This should come from your auth context
                  name: "", // This should come from your auth context
                }}
                administrators={course.administrators}
                onSendMessage={handleSendMessage}
                isSending={sendChatMessageMutation.isLoading}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Registration Code Modal */}
        {selectedSessionId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Código de Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Esta sesión requiere un código de registro para confirmar tu asistencia.
                  </p>
                  <input
                    type="text"
                    placeholder="Ingresa el código..."
                    value={registrationCode}
                    onChange={(e) => setRegistrationCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitRegistrationCode}
                      disabled={!registrationCode.trim() || registerAttendanceMutation.isLoading}
                      className="flex-1"
                    >
                      {registerAttendanceMutation.isLoading ? "Registrando..." : "Confirmar"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedSessionId(null);
                        setRegistrationCode("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
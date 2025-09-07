"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { CourseType } from "@prisma/client";
import CourseBasicInfoStep from "./_components/BasicInfo";
import CourseReviewStep from "./_components/FinalReview";
import CourseSessionsStep from "./_components/SesionConfig";

// Tipos para el estado del wizard
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

const STEPS = [
  { id: 1, title: "Información Básica", description: "Datos generales del curso" },
  { id: 2, title: "Sesiones", description: "Configurar sesiones del curso" },
  { id: 3, title: "Revisar y Crear", description: "Confirmar la información" },
];

const CreateCourseWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Estado inicial del formulario
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    isPublic: true,
    accessCode: "",
    type: CourseType.VIRTUAL,
    location: "",
    thumbnail: "",
    duration: undefined,
    maxStudents: undefined,
    startDate: undefined,
    endDate: undefined,
    sessions: [],
  });

  // Mutación para crear curso
  const createCourseMutation = api.courses.create.useMutation({
    onSuccess: (course) => {
      toast({
        title: "Curso creado exitosamente",
        description: `El curso "${course.title}" ha sido creado.`,
      });
      router.push(`/editor/courses/${course.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error al crear curso",
        description: error.message,
        variant: "destructive",
      });
      setIsCreating(false);
    },
  });

  const updateFormData = (data: Partial<CourseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreateCourse = async () => {
    setIsCreating(true);
    
    try {
      await createCourseMutation.mutateAsync({
        ...formData,
        sessions: formData.sessions.map((session, index) => ({
          ...session,
          order: index,
        })),
      });
    } catch (error) {
      // Error ya manejado en onError
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return true; // Las sesiones son opcionales
      case 3:
        return true; // Solo es revisión
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CourseBasicInfoStep
            formData={formData}
            onUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <CourseSessionsStep
            sessions={formData.sessions}
            onUpdate={(sessions) => updateFormData({ sessions })}
          />
        );
      case 3:
        return (
          <CourseReviewStep
            formData={formData}
            onUpdate={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Cursos
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Curso</h1>
          <p className="text-gray-600 mt-2">
            Sigue los pasos para configurar tu curso completo
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-8">
              {STEPS.map((step, stepIndex) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                        ${currentStep > step.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : currentStep === step.id
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-500"
                        }
                      `}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIndex < STEPS.length - 1 && (
                    <div
                      className={`
                        ml-8 w-16 h-0.5
                        ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}
                      `}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{STEPS[currentStep - 1]?.title}</span>
              <Badge variant="outline">
                Paso {currentStep} de {STEPS.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateCourse}
              disabled={!isStepValid() || isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? "Creando..." : "Crear Curso"}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourseWizard;
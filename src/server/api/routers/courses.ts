import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserType, SessionStatus, ParticipantRole, CourseStatus, CourseType } from "@prisma/client";


const courseSessionSchema = z.object({
  title: z.string().min(1, "El título de la sesión es requerido"),
  description: z.string().optional(),
  atlasEntryId: z.string().optional(),
  registrationCode: z.string().optional(),
  order: z.number().default(0),
});

export const coursesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        // Información general
        title: z.string().min(1, "El título es requerido"),
        description: z.string().optional(),
        isPublic: z.boolean().default(true),
        accessCode: z.string().optional(),
        type: z.nativeEnum(CourseType).default(CourseType.VIRTUAL),
        location: z.string().optional(),
        thumbnail: z.string().optional(),
        duration: z.number().optional(),
        maxStudents: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),

        // Sesiones a crear
        sessions: z.array(courseSessionSchema).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      if (user.type !== UserType.COORDINADOR && user.type !== UserType.ADMINISTRADOR) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo coordinadores y administradores pueden crear cursos"
        });
      }

      // Crear el curso
      const course = await ctx.db.course.create({
        data: {
          title: input.title,
          description: input.description,
          isPublic: input.isPublic,
          accessCode: input.accessCode,
          type: input.type,
          location: input.location,
          thumbnail: input.thumbnail,
          duration: input.duration,
          maxStudents: input.maxStudents,
          startDate: input.startDate,
          endDate: input.endDate,
          status: CourseStatus.DRAFT,
          administrators: {
            connect: { id: user.id }
          }
        }
      });

      // Crear las sesiones si se proporcionaron
      if (input.sessions.length > 0) {
        for (const [index, sessionData] of input.sessions.entries()) {
          // Si no hay atlasEntryId, crear una entrada de atlas básica
          let atlasEntryId = sessionData.atlasEntryId;

          if (!atlasEntryId) {
            const atlasEntry = await ctx.db.atlasEntry.create({
              data: {
                title: sessionData.title,
                content: {
                  participantes: [{
                    userId: user.id,
                    role: ParticipantRole.ADMIN,
                    name: user.name || undefined
                  }],
                  discusionForum: [],
                  descripcion: {
                    titulo: sessionData.title,
                    descripcionSesion: sessionData.description || "",
                    contenido: {},
                    ejerciciosPracticos: []
                  }
                },
                isPublic: false,
                creatorId: user.id,
              }
            });

            // Crear label automático tipo ATLAS_SESION_LABEL
            const autoLabel = await ctx.db.atlasLabel.create({
              data: {
                title: `Sesión-${sessionData.title}`,
                description: `Label automático para sesión: ${sessionData.title}`,
                type: "ATLAS_SESION_LABEL",
                tabPermissions: [],
              }
            });

            await ctx.db.atlasEntryLabel.create({
              data: {
                atlasEntryId: atlasEntry.id,
                atlasLabelId: autoLabel.id,
              }
            });

            // Agregar usuario a la entrada como administrador
            await ctx.db.userAtlasEntry.create({
              data: {
                userId: user.id,
                atlasEntryId: atlasEntry.id,
                role: ParticipantRole.ADMIN,
              }
            });

            atlasEntryId = atlasEntry.id;
          }

          // Crear la sesión del curso
          await ctx.db.courseSession.create({
            data: {
              courseId: course.id,
              atlasEntryId: atlasEntryId,
              registrationCode: sessionData.registrationCode,
            }
          });
        }
      }

      return course;
    }),
  getAvailableAtlasEntries: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const entries = await ctx.db.atlasEntry.findMany({
        where: {
          OR: [
            { creatorId: userId },
            {
              users: {
                some: {
                  userId: userId,
                  role: ParticipantRole.ADMIN
                }
              }
            }
          ],
          labels: {
            some: {
              atlasLabel: {
                type: "ATLAS_SESION_LABEL"
              }
            }
          }
        },
        include: {
          labels: {
            include: {
              atlasLabel: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return entries;
    }),
  getPublicCourses: protectedProcedure
    .query(async ({ ctx }) => {
      const courses = await ctx.db.course.findMany({
        where: {
          isPublic: true,
          status: CourseStatus.ACTIVE
        },
        include: {
          administrators: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              enrollments: true,
              sessions: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return courses;
    }),

  getMyCourses: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const enrollments = await ctx.db.userCourseEnrollment.findMany({
        where: {
          userId: userId
        },
        include: {
          course: {
            include: {
              administrators: {
                select: {
                  id: true,
                  name: true,
                }
              },
              sessions: {
                include: {
                  participants: {
                    where: {
                      userId: userId
                    }
                  }
                }
              },
              _count: {
                select: {
                  enrollments: true,
                  sessions: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return enrollments.map(enrollment => {
        const completedSessions = enrollment.course.sessions.filter(
          session => session.participants.some(p => p.status === SessionStatus.COMPLETED)
        ).length;

        return {
          ...enrollment.course,
          completedSessions,
          lastActivity: enrollment.createdAt,
        };
      });
    }),

  getMyAdministeredCourses: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const courses = await ctx.db.course.findMany({
        where: {
          administrators: {
            some: {
              id: userId
            }
          }
        },
        include: {
          administrators: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              enrollments: true,
              sessions: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return courses;
    }),


  enrollPublic: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId }
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado"
        });
      }

      if (!course.isPublic) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Este curso requiere código de acceso"
        });
      }

      const existingEnrollment = await ctx.db.userCourseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: input.courseId
          }
        }
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya estás inscrito en este curso"
        });
      }


      const enrollment = await ctx.db.userCourseEnrollment.create({
        data: {
          userId: userId,
          courseId: input.courseId,
        },
        include: {
          course: true
        }
      });

      return enrollment;
    }),

  enrollPrivate: protectedProcedure
    .input(
      z.object({
        accessCode: z.string().min(1, "Código de acceso requerido"),
        courseId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const course = await ctx.db.course.findFirst({
        where: {
          accessCode: input.accessCode,
          ...(input.courseId ? { id: input.courseId } : {})
        }
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Código de acceso inválido"
        });
      }

      const existingEnrollment = await ctx.db.userCourseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: course.id
          }
        }
      });

      if (existingEnrollment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya estás inscrito en este curso"
        });
      }

      const enrollment = await ctx.db.userCourseEnrollment.create({
        data: {
          userId: userId,
          courseId: course.id,
        },
        include: {
          course: true
        }
      });

      return enrollment;
    }),

  createSession: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        atlasEntryId: z.string(),
        registrationCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar que el usuario es administrador del curso
      const course = await ctx.db.course.findFirst({
        where: {
          id: input.courseId,
          administrators: {
            some: {
              id: userId
            }
          }
        }
      });

      if (!course) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para crear sesiones en este curso"
        });
      }

      // Verificar que la atlas entry existe y es tipo ATLAS_SESION_LABEL
      const atlasEntry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.atlasEntryId },
        include: {
          labels: {
            include: {
              atlasLabel: true
            }
          }
        }
      });

      if (!atlasEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada de atlas no encontrada"
        });
      }

      const hasSessionLabel = atlasEntry.labels.some(
        label => label.atlasLabel.type === "ATLAS_SESION_LABEL"
      );

      if (!hasSessionLabel) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La entrada de atlas debe ser de tipo ATLAS_SESION_LABEL"
        });
      }

      // Crear sesión
      const session = await ctx.db.courseSession.create({
        data: {
          courseId: input.courseId,
          atlasEntryId: input.atlasEntryId,
          registrationCode: input.registrationCode,
        },
        include: {
          atlasEntry: true,
          course: true
        }
      });

      return session;
    }),

  // Obtener sesiones de un curso
  getCourseSessions: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar que el usuario está inscrito en el curso o es administrador
      const enrollment = await ctx.db.userCourseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: input.courseId
          }
        }
      });

      const isAdmin = await ctx.db.course.findFirst({
        where: {
          id: input.courseId,
          administrators: {
            some: {
              id: userId
            }
          }
        }
      });

      if (!enrollment && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes acceso a este curso"
        });
      }

      const sessions = await ctx.db.courseSession.findMany({
        where: {
          courseId: input.courseId
        },
        include: {
          atlasEntry: {
            include: {
              labels: {
                include: {
                  atlasLabel: true
                }
              }
            }
          },
          participants: {
            where: {
              userId: userId
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return sessions;
    }),

  // Registrar asistencia a sesión
  registerAttendance: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        registrationCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const session = await ctx.db.courseSession.findUnique({
        where: { id: input.sessionId },
        include: {
          course: {
            include: {
              enrollments: {
                where: {
                  userId: userId
                }
              }
            }
          }
        }
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sesión no encontrada"
        });
      }

      if (session.course.enrollments.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No estás inscrito en este curso"
        });
      }

      // Verificar código si es requerido
      if (session.registrationCode && input.registrationCode !== session.registrationCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Código de registro incorrecto"
        });
      }

      // Crear o actualizar participación
      const participation = await ctx.db.userSessionParticipant.upsert({
        where: {
          userId_sessionId: {
            userId: userId,
            sessionId: input.sessionId
          }
        },
        create: {
          userId: userId,
          sessionId: input.sessionId,
          status: SessionStatus.COMPLETED,
          attendedAt: new Date(),
          hasRegistrationCode: !!input.registrationCode
        },
        update: {
          status: SessionStatus.COMPLETED,
          attendedAt: new Date(),
          hasRegistrationCode: !!input.registrationCode
        }
      });

      return participation;
    }),

  // Obtener estadísticas de un curso (para administradores)
  getCourseStats: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar que es administrador del curso
      const course = await ctx.db.course.findFirst({
        where: {
          id: input.courseId,
          administrators: {
            some: {
              id: userId
            }
          }
        }
      });

      if (!course) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para ver las estadísticas de este curso"
        });
      }

      const stats = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          _count: {
            select: {
              enrollments: true,
              sessions: true,
            }
          },
          enrollments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          sessions: {
            include: {
              _count: {
                select: {
                  participants: true,
                }
              },
              participants: {
                where: {
                  status: SessionStatus.COMPLETED
                }
              }
            }
          }
        }
      });

      return stats;
    }),
  getCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          administrators: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          sessions: {
            include: {
              atlasEntry: {
                select: {
                  id: true,
                  title: true,
                }
              },
              participants: {
                where: {
                  userId: userId
                },
                select: {
                  status: true,
                  attendedAt: true,
                  hasRegistrationCode: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          enrollments: {
            where: {
              userId: userId
            }
          },
          _count: {
            select: {
              enrollments: true,
              sessions: true,
            }
          }
        }
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso no encontrado"
        });
      }

      const isEnrolled = course.enrollments.length > 0;
      const isAdmin = course.administrators.some(admin => admin.id === userId);

      if (!course.isPublic && !isEnrolled && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes acceso a este curso"
        });
      }

      return {
        ...course,
        isEnrolled,
        isAdmin,
      };
    }),

});
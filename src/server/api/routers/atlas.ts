// server/api/routers/atlas.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { AtlasLabelType, ParticipantRole, ResourceType } from "@prisma/client";

// Esquemas para diferentes tipos de contenido de Atlas
const participantSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(ParticipantRole),
  name: z.string().optional(),
});

const discussionCommentSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  comment: z.string(),
  timestamp: z.string(),
});

const resourceSchema = z.object({
  type: z.nativeEnum(ResourceType),
  title: z.string(),
  url: z.string().optional(), // Para EXTERNAL_LINK
  atlasEntryId: z.string().optional(), // Para INTERNAL_ATLAS_ENTRY
});

// Contenido para entradas arbitrarias (COMPLETED, DRAFT, IDEA)
const arbitraryAtlasContentSchema = z.object({
  descripcion: z.string(),
  participantes: z.array(participantSchema),
  discusionForum: z.array(discussionCommentSchema),
});

// Contenido para ATLAS_SESION_LABEL
const sessionAtlasContentSchema = z.object({
  participantes: z.array(participantSchema),
  discusionForum: z.array(discussionCommentSchema),
  descripcion: z.object({
    titulo: z.string(),
    descripcionSesion: z.string(),
    contenido: z.any(), // Contenido arbitrario
    ejerciciosPracticos: z.array(resourceSchema),
  }),
});

// Contenido para PROJECT_LABEL
const projectAtlasContentSchema = z.object({
  participantes: z.array(participantSchema),
  discusionForum: z.array(discussionCommentSchema),
  descripcion: z.object({
    titulo: z.string(),
    descripcionProyecto: z.string(),
    objetivos: z.array(z.string()),
    tecnologias: z.array(z.string()),
    recursos: z.array(resourceSchema),
    estado: z.enum(["PLANIFICACION", "EN_DESARROLLO", "COMPLETADO", "PAUSADO"]),
  }),
});

// Contenido para CONCEPT_LABEL
const conceptAtlasContentSchema = z.object({
  participantes: z.array(participantSchema),
  discusionForum: z.array(discussionCommentSchema),
  descripcion: z.object({
    titulo: z.string(),
    definicion: z.string(),
    ejemplos: z.array(z.string()),
    recursosRelacionados: z.array(resourceSchema),
    tags: z.array(z.string()),
  }),
});

export const atlasRouter = createTRPCRouter({
  // Crear entrada de atlas
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "El título es requerido"),
        labelType: z.nativeEnum(AtlasLabelType),
        isPublic: z.boolean().default(false),
        content: z.union([
          arbitraryAtlasContentSchema,
          sessionAtlasContentSchema,
          projectAtlasContentSchema,
          conceptAtlasContentSchema,
          z.any() // Para otros tipos futuros
        ]),
        labelIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Validar contenido según tipo
      let validatedContent;
      if (
        input.labelType === AtlasLabelType.ATLAS_SESION_COMPLETED_LABEL ||
        input.labelType === AtlasLabelType.ATLAS_SESION_DRAFT_COMPLETED_LABEL ||
        input.labelType === AtlasLabelType.ATLAS_IDEA_LABEL
      ) {
        validatedContent = arbitraryAtlasContentSchema.parse(input.content);
      } else if (input.labelType === AtlasLabelType.ATLAS_SESION_LABEL) {
        validatedContent = sessionAtlasContentSchema.parse(input.content);
      } else if (input.labelType === AtlasLabelType.ATLAS_PROJECT_LABEL) {
        validatedContent = projectAtlasContentSchema.parse(input.content);
      } else if (input.labelType === AtlasLabelType.ATLAS_CONCEPT_LABEL) {
        validatedContent = conceptAtlasContentSchema.parse(input.content);
      } else {
        validatedContent = input.content;
      }

      // Agregar usuario creador a participantes si no está
      if ('participantes' in validatedContent) {
        const creatorExists = validatedContent.participantes.some(p => p.userId === userId);
        if (!creatorExists) {
          validatedContent.participantes.unshift({
            userId: userId,
            role: ParticipantRole.ADMIN,
            name: ctx.session.user.name || undefined
          });
        }
      }

      // Crear entrada de atlas
      const atlasEntry = await ctx.db.atlasEntry.create({
        data: {
          title: input.title,
          content: validatedContent,
          isPublic: input.isPublic,
          creatorId: userId,
        }
      });

      // Crear o asociar labels
      if (input.labelIds && input.labelIds.length > 0) {
        await ctx.db.atlasEntryLabel.createMany({
          data: input.labelIds.map(labelId => ({
            atlasEntryId: atlasEntry.id,
            atlasLabelId: labelId,
          }))
        });
      }

      // Crear label automático basado en tipo si no se proporcionaron labels
      if (!input.labelIds || input.labelIds.length === 0) {
        const autoLabel = await ctx.db.atlasLabel.create({
          data: {
            title: `Auto-${input.labelType}`,
            description: `Label automático para ${input.title}`,
            type: input.labelType,
            tabPermissions: [],
          }
        });

        await ctx.db.atlasEntryLabel.create({
          data: {
            atlasEntryId: atlasEntry.id,
            atlasLabelId: autoLabel.id,
          }
        });
      }

      // Agregar usuario a la entrada como administrador
      await ctx.db.userAtlasEntry.create({
        data: {
          userId: userId,
          atlasEntryId: atlasEntry.id,
          role: ParticipantRole.ADMIN,
        }
      });

      return atlasEntry;
    }),

  // Obtener mis entradas de atlas
  getMyEntries: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(AtlasLabelType).optional(),
        includePublic: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const entries = await ctx.db.atlasEntry.findMany({
        where: {
          OR: [
            { creatorId: userId },
            input.includePublic ? { isPublic: true } : {},
            {
              users: {
                some: {
                  userId: userId
                }
              }
            }
          ],
          ...(input.type ? {
            labels: {
              some: {
                atlasLabel: {
                  type: input.type
                }
              }
            }
          } : {})
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            }
          },
          labels: {
            include: {
              atlasLabel: true
            }
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return entries;
    }),

  // Obtener entradas públicas
  getPublicEntries: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(AtlasLabelType).optional(),
        limit: z.number().default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.atlasEntry.findMany({
        where: {
          isPublic: true,
          ...(input.type ? {
            labels: {
              some: {
                atlasLabel: {
                  type: input.type
                }
              }
            }
          } : {})
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            }
          },
          labels: {
            include: {
              atlasLabel: true
            }
          },
          _count: {
            select: {
              users: true,
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: input.limit + 1,
        ...(input.cursor ? {
          cursor: { id: input.cursor },
          skip: 1,
        } : {})
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (entries.length > input.limit) {
        const nextItem = entries.pop();
        nextCursor = nextItem!.id;
      }

      return {
        entries,
        nextCursor,
      };
    }),

  // Obtener una entrada específica
  getEntry: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const entry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.entryId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            }
          },
          labels: {
            include: {
              atlasLabel: true
            }
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          referencedEntries: {
            include: {
              targetEntry: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          },
          referencingEntries: {
            include: {
              sourceEntry: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        }
      });

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada de atlas no encontrada"
        });
      }

      // Verificar permisos
      const hasAccess = entry.isPublic || 
                       entry.creatorId === userId ||
                       entry.users.some(u => u.userId === userId);

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para ver esta entrada"
        });
      }

      return entry;
    }),

  // Unirse a una entrada de atlas
  joinEntry: protectedProcedure
    .input(
      z.object({
        atlasEntryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar que la entrada existe y es pública
      const entry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.atlasEntryId }
      });

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada de atlas no encontrada"
        });
      }

      if (!entry.isPublic) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Esta entrada no es pública"
        });
      }

      // Verificar si ya está unido
      const existingMembership = await ctx.db.userAtlasEntry.findUnique({
        where: {
          userId_atlasEntryId: {
            userId: userId,
            atlasEntryId: input.atlasEntryId
          }
        }
      });

      if (existingMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya estás unido a esta entrada"
        });
      }

      // Unirse como guest
      const membership = await ctx.db.userAtlasEntry.create({
        data: {
          userId: userId,
          atlasEntryId: input.atlasEntryId,
          role: ParticipantRole.GUEST,
        }
      });

      return membership;
    }),

  // Agregar comentario al foro de discusión
  addComment: protectedProcedure
    .input(
      z.object({
        atlasEntryId: z.string(),
        comment: z.string().min(1, "El comentario no puede estar vacío"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar permisos
      const membership = await ctx.db.userAtlasEntry.findUnique({
        where: {
          userId_atlasEntryId: {
            userId: userId,
            atlasEntryId: input.atlasEntryId
          }
        }
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para comentar en esta entrada"
        });
      }

      // Obtener entrada actual
      const entry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.atlasEntryId }
      });

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada no encontrada"
        });
      }

      // Agregar comentario al contenido
      const content = entry.content as any;
      if (!content.discusionForum) {
        content.discusionForum = [];
      }

      const newComment = {
        userId: userId,
        userName: ctx.session.user.name || "Usuario",
        comment: input.comment,
        timestamp: new Date().toISOString(),
      };

      content.discusionForum.push(newComment);

      // Actualizar entrada
      const updatedEntry = await ctx.db.atlasEntry.update({
        where: { id: input.atlasEntryId },
        data: {
          content: content,
          updatedAt: new Date(),
        }
      });

      return updatedEntry;
    }),

  // Actualizar entrada de atlas
  updateEntry: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        title: z.string().optional(),
        content: z.any().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar permisos (solo creador o admin)
      const membership = await ctx.db.userAtlasEntry.findUnique({
        where: {
          userId_atlasEntryId: {
            userId: userId,
            atlasEntryId: input.entryId
          }
        }
      });

      const entry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.entryId }
      });

      if (!entry || (entry.creatorId !== userId && membership?.role !== ParticipantRole.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para editar esta entrada"
        });
      }

      const updatedEntry = await ctx.db.atlasEntry.update({
        where: { id: input.entryId },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
          ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
          updatedAt: new Date(),
        }
      });

      return updatedEntry;
    }),

  // Crear referencia entre entradas
  createReference: protectedProcedure
    .input(
      z.object({
        sourceEntryId: z.string(),
        targetEntryId: z.string(),
        resourceType: z.nativeEnum(ResourceType),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verificar permisos en la entrada origen
      const sourceMembership = await ctx.db.userAtlasEntry.findUnique({
        where: {
          userId_atlasEntryId: {
            userId: userId,
            atlasEntryId: input.sourceEntryId
          }
        }
      });

      const sourceEntry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.sourceEntryId }
      });

      if (!sourceEntry || (sourceEntry.creatorId !== userId && sourceMembership?.role !== ParticipantRole.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permisos para crear referencias desde esta entrada"
        });
      }

      // Verificar que la entrada destino existe
      const targetEntry = await ctx.db.atlasEntry.findUnique({
        where: { id: input.targetEntryId }
      });

      if (!targetEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entrada destino no encontrada"
        });
      }

      // Crear referencia
      const reference = await ctx.db.atlasEntryReference.create({
        data: {
          sourceEntryId: input.sourceEntryId,
          targetEntryId: input.targetEntryId,
          resourceType: input.resourceType,
        }
      });

      return reference;
    }),

  // Obtener labels disponibles
  getLabels: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(AtlasLabelType).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const labels = await ctx.db.atlasLabel.findMany({
        where: input.type ? { type: input.type } : undefined,
        orderBy: {
          title: 'asc'
        }
      });

      return labels;
    }),

  // Crear label personalizado
  createLabel: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "El título es requerido"),
        description: z.string().optional(),
        type: z.nativeEnum(AtlasLabelType),
        tabPermissions: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const label = await ctx.db.atlasLabel.create({
        data: {
          title: input.title,
          description: input.description,
          type: input.type,
          tabPermissions: input.tabPermissions,
        }
      });

      return label;
    }),
});
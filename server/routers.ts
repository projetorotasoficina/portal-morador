import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getMoradorByUserId, createMorador, updateMorador } from "./db";
import { getAgendaColeta, getHistoricoColeta } from "./backend-client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Configuração da cidade permitida
const CIDADE_PERMITIDA = "Pato Branco";
const ESTADO_PERMITIDO = "PR";
const PERMITIR_APENAS_ESTA_CIDADE = true;

// Schema de validação para morador
const moradorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  cep: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
}).refine(
  (data) => {
    if (!PERMITIR_APENAS_ESTA_CIDADE) return true;
    
    const cidadeNormalizada = data.cidade.toLowerCase().trim();
    const cidadePermitida = CIDADE_PERMITIDA.toLowerCase().trim();
    const estadoNormalizado = data.estado.toUpperCase().trim();
    
    return cidadeNormalizada === cidadePermitida && estadoNormalizado === ESTADO_PERMITIDO;
  },
  {
    message: `Este portal é exclusivo para moradores de ${CIDADE_PERMITIDA} - ${ESTADO_PERMITIDO}`,
    path: ["cidade"],
  }
);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  morador: router({
    // Obter perfil do morador logado
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const morador = await getMoradorByUserId(ctx.user.id);
      return morador;
    }),

    // Criar perfil de morador
    createProfile: protectedProcedure
      .input(moradorSchema)
      .mutation(async ({ ctx, input }) => {
        // Verificar se já existe perfil
        const existing = await getMoradorByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Perfil de morador já existe",
          });
        }

        const morador = await createMorador({
          ...input,
          userId: ctx.user.id,
        });

        return morador;
      }),

    // Atualizar perfil de morador
    updateProfile: protectedProcedure
      .input(moradorSchema.partial().extend({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        // Verificar se o morador pertence ao usuário logado
        const existing = await getMoradorByUserId(ctx.user.id);
        if (!existing || existing.id !== id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para atualizar este perfil",
          });
        }

        const updated = await updateMorador(id, data);
        return updated;
      }),
  }),

  coleta: router({
    // Consultar agenda de coleta
    getAgenda: protectedProcedure.query(async ({ ctx }) => {
      const morador = await getMoradorByUserId(ctx.user.id);
      
      if (!morador || !morador.latitude || !morador.longitude) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Complete seu perfil com endereço e coordenadas para consultar a agenda",
        });
      }

      try {
        // Integração com backend Java Spring Boot
        const data = await getAgendaColeta(
          parseFloat(morador.latitude),
          parseFloat(morador.longitude)
        );

        return {
          endereco: `${morador.endereco}, ${morador.numero || "S/N"}`,
          diasColeta: data.diasColeta || [],
        };
      } catch (error) {
        console.error('Erro ao buscar agenda de coleta:', error);
        // Retornar dados vazios em caso de erro
        return {
          endereco: `${morador.endereco}, ${morador.numero || "S/N"}`,
          diasColeta: [],
        };
      }
    }),

    // Consultar histórico de coleta
    getHistorico: protectedProcedure.query(async ({ ctx }) => {
      const morador = await getMoradorByUserId(ctx.user.id);
      
      if (!morador || !morador.latitude || !morador.longitude) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Complete seu perfil com endereço e coordenadas para consultar o histórico",
        });
      }

      try {
        // Integração com backend Java Spring Boot
        const data = await getHistoricoColeta(
          parseFloat(morador.latitude),
          parseFloat(morador.longitude)
        );

        return {
          ultimaColeta: data.ultimaColeta,
          passou: data.passou,
          historico: data.historico || [],
        };
      } catch (error) {
        console.error('Erro ao buscar histórico de coleta:', error);
        // Retornar dados vazios em caso de erro
        return {
          ultimaColeta: null,
          passou: false,
          historico: [],
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;

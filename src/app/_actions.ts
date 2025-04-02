"use server";

import { prisma } from "@/services/prisma";

export const SavePdfBase64 = async (pdf: string, name: string) => {
  const placaCriada = await prisma.placasCriadas.create({
    data: {
      placa: pdf,
      name: name,
    },
  });
  return placaCriada;
};

export const GetPlacasCriadas = async () => {
  const date = new Date();

  const fourDaysAgo = new Date(date);
  fourDaysAgo.setDate(date.getDate() - 4);

  await prisma.placasCriadas.deleteMany({
    where: {
      createdAt: {
        lt: fourDaysAgo,
      },
    },
  });

  const placasCriadas = await prisma.placasCriadas.findMany();

  return placasCriadas;
};

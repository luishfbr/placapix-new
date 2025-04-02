"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Archive, BadgeMinus, Eye, PlusCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Placa } from "@/lib/types";
import PageToVizu from "./_components/page-to-vizu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BrowserQRCodeReader } from "@zxing/browser";
import QRCode from "qrcode";
import { HistoricoDePlacas } from "./_components/history";
import { GetPlacasCriadas } from "./_actions";

export type Placas = {
  placa: string;
  createdAt: Date;
  name: string;
};

export default function Home() {
  const { control, handleSubmit, register, setValue } = useForm({
    defaultValues: {
      fields: [
        {
          imgUrl: "",
          qrCodeText: "",
          name: "",
          key: "",
          qtd: 0,
          solicitante: "",
        },
      ],
    },
  });

  const [values, setValues] = React.useState<Placa | null>(null);

  const [placas, setPlacas] = React.useState<Placas[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const handleFileChange = async (file: File, index: number) => {
    const reader = new FileReader();

    reader.onload = async () => {
      if (reader.result) {
        const imgUrl = reader.result.toString();
        setValue(`fields.${index}.imgUrl`, imgUrl); // Salva a imagem como URL base64

        // Tenta detectar o QR Code na imagem carregada
        try {
          const codeReader = new BrowserQRCodeReader();
          const result = await codeReader.decodeFromImageUrl(imgUrl);

          if (result) {
            const qrCodeContent = result.getText();
            setValue(`fields.${index}.qrCodeText`, qrCodeContent); // Salva o texto do QR Code

            // Gerar o QR Code de volta em formato de imagem base64 a partir do texto do QR Code
            try {
              const generatedQRCode = await QRCode.toDataURL(qrCodeContent); // Versão assíncrona
              setValue(`fields.${index}.imgUrl`, generatedQRCode); // Atualiza a imagem com o QR Code gerado
            } catch (err) {
              console.error("Erro ao gerar QR Code:", err);
            }
          }
        } catch (error) {
          console.error("QR Code não detectado:", error);
          setValue(
            `fields.${index}.qrCodeText`,
            "QR Code inválido ou não encontrado."
          );
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    remove(index);
    if (values) {
      const updatedValues = {
        ...values,
        fields: values.fields.filter((_, i) => i !== index),
      };
      setValues(updatedValues);
    }
  };

  const onSubmit = (data: Placa) => {
    setValues(data);
  };

  const fetchPlacas = async () => {
    const res = await GetPlacasCriadas();
    setPlacas(res);
  };

  React.useEffect(() => {
    fetchPlacas();
  }, []);

  return (
    <div className="flex flex-row gap-6 items-center justify-center h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Placa Pix Sicoob Uberaba</CardTitle>
          <CardDescription>Insira os valores nos campos abaixo</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4 justify-around">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-row gap-2 justify-around"
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Archive />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <Input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0], index);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  required
                  placeholder="Nome do Beneficiado"
                  {...register(`fields.${index}.name`)}
                />
                <Input
                  type="text"
                  required
                  placeholder="Chave Pix"
                  {...register(`fields.${index}.key`)}
                />
                <Input
                  className="max-w-24"
                  type="number"
                  required
                  placeholder="Qtd"
                  defaultValue={0}
                  {...register(`fields.${index}.qtd`)}
                />
                <Input
                  type="text"
                  required
                  placeholder="Nome do Solicitante"
                  {...register(`fields.${index}.solicitante`)}
                />
                <Button
                  type="button"
                  onClick={() => handleRemove(index)}
                  variant={"destructive"}
                >
                  <BadgeMinus />
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-row gap-2">
            <HistoricoDePlacas placas={placas} />
            <Button type="submit" variant={"secondary"} className="w-full">
              <Eye />
              Vizualizar
            </Button>
            <Button
              variant={"outline"}
              onClick={() =>
                append({
                  imgUrl: "",
                  qrCodeText: "",
                  name: "",
                  key: "",
                  qtd: 0,
                  solicitante: "",
                })
              }
              type="button"
              className="w-24"
            >
              <PlusCircle /> Campos
            </Button>
          </CardFooter>
        </form>
      </Card>
      {values && <PageToVizu values={values} executeFetch={fetchPlacas} />}
    </div>
  );
}

/**
 * `uploadCloudinary` middleware
 */

import type { Core } from "@strapi/strapi";
import { Context } from "koa";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx: Context, next) => {
    // Verificar si la solicitud es una subida de archivos
    if (
      ctx.request.method === "POST" &&
      ctx.request.url == "/upload" &&
      ctx.request.files
    ) {
      // Obtenemos la URL de referencia desde donde se está haciendo la subida
      const referer =
        ctx.request.headers["referer"] || ctx.request.headers["referrer"];

      // Verificar si se está accediendo a la URL desde una fuente específica
      let folderName = null;
      if (referer) {
        // Aquí puedes analizar el `referer` para determinar la colección o contexto
        if (referer.includes("api::post.post")) {
          folderName = "Posts";
        } else if (referer.includes("api::producto.producto")) {
          folderName = "Productos";
        }
      } else {
        console.log("No se proporcionó Referer en la solicitud");
      }

      // Creación y asignación de carpeta:
      let folderId = null;

      switch (folderName) {
        // SI ENTRA EN POSTS:
        case "Productos":
          break;

        // SI ENTRA EN POSTS:
        case "Posts":
          // Obtener la fecha actual para definir año y mes
          const now = new Date();
          const year = now.getFullYear().toString();
          const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Mes en formato "MM"

          // Define los nombres de las carpetas de año y mes
          const yearFolderName = year;
          const monthFolderName = month;
          const yearFolderPath = `/${year}`;
          const monthFolderPath = `/${year}/${month}`;

          try {
            // Intentar encontrar o crear la carpeta del año
            const [yearFolder] = await strapi.entityService.findMany(
              "plugin::upload.folder",
              {
                filters: { name: yearFolderName },
              },
            );

            let yearFolderId: any;
            if (yearFolder) {
              // Si la carpeta del año existe, obtener su ID
              yearFolderId = yearFolder.id;
            } else {
              // Si la carpeta del año no existe, crearla
              const newYearFolder = await strapi.entityService.create(
                "plugin::upload.folder",
                {
                  data: {
                    name: yearFolderName,
                    path: yearFolderPath,
                    pathId: year,
                  },
                } as any,
              );
              yearFolderId = newYearFolder.id;
            }

            // Intentar encontrar o crear la carpeta del mes dentro de la carpeta del año
            const [monthFolder] = (await strapi.entityService.findMany(
              "plugin::upload.folder",
              {
                filters: { name: monthFolderName, parent: yearFolderId },
              },
            )) as any;

            let monthFolderId: number;
            if (monthFolder) {
              // Si la carpeta del mes existe, obtener su ID
              monthFolderId = monthFolder.id;
            } else {
              // Si la carpeta del mes no existe, crearla dentro de la carpeta del año

              const newMonthFolder = (await strapi.entityService.create(
                "plugin::upload.folder",
                {
                  data: {
                    name: monthFolderName,
                    path: monthFolderPath,
                    parent: yearFolderId,
                    pathId: parseInt(String(year) + String(month)),
                  },
                } as any,
              )) as any;

              monthFolderId = newMonthFolder.id;
            }
          } catch (error) {
            console.error("Error al organizar archivos por fecha:", error);
          }

          break;
        default:
          folderId = null;
          break;
      } // FIN SWITCH

      //Asignación final de carpeta si ha encontrado alguna ruta:
      if (folderId != null) {
        let fileInfo = JSON.parse(ctx.request.body.fileInfo);
        fileInfo.folder = folderId;
        fileInfo = JSON.stringify(fileInfo);
        ctx.request.body.fileInfo = fileInfo;
      }
    }

    // Pasar al siguiente middleware o controlador
    await next();
  };
};
